/**
 * Inspection-flight planner.
 *
 * Given a list of inspection waypoints (with altitude, loiter time,
 * and priority) and the drone's performance envelope, this module
 * orders them into a feasible flight plan: a cheap nearest-neighbour
 * opener, 2-opt polish, and a battery-aware split that schedules
 * return-to-home legs whenever the remaining charge can't safely
 * cover the next hop plus RTH.
 */

export type Waypoint = {
  id: string;
  lat: number;
  lon: number;
  altitudeM: number;
  loiterSec: number;
  priority: 1 | 2 | 3;          // 3 = critical
};

export type DronePerf = {
  cruiseSpeedMs: number;
  climbRateMs: number;
  amperesCruise: number;
  amperesHover: number;
  batteryAh: number;
  reserveFrac: number;           // fly home when ≤ this
};

export type FlightLeg = {
  fromId: string;
  toId: string;
  distanceM: number;
  etaSec: number;
  ampSecCost: number;
};

export type FlightPlan = {
  home: Waypoint;
  sorties: { legs: FlightLeg[]; totalSec: number; ampSec: number }[];
  totalDistanceM: number;
  droppedWaypoints: string[];
};

const R = 6_371_000;

export function haversineMeters(a: Waypoint, b: Waypoint): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function legCost(a: Waypoint, b: Waypoint, perf: DronePerf): FlightLeg {
  const distance = haversineMeters(a, b);
  const climbSec = Math.abs(b.altitudeM - a.altitudeM) / perf.climbRateMs;
  const cruiseSec = distance / perf.cruiseSpeedMs;
  const etaSec = climbSec + cruiseSec;
  const ampSecCost = etaSec * perf.amperesCruise + b.loiterSec * perf.amperesHover;
  return {
    fromId: a.id,
    toId: b.id,
    distanceM: Math.round(distance),
    etaSec: round(etaSec, 1),
    ampSecCost: round(ampSecCost, 1),
  };
}

/** Greedy nearest-neighbour tour, priority-first. */
function nearestNeighbour(home: Waypoint, waypoints: Waypoint[]): Waypoint[] {
  const remaining = [...waypoints].sort((a, b) => b.priority - a.priority);
  const tour: Waypoint[] = [];
  let cur = home;
  while (remaining.length > 0) {
    // within top priority tier, take nearest
    const topTier = remaining[0].priority;
    const pool = remaining.filter((w) => w.priority === topTier);
    let best = pool[0];
    let bestD = haversineMeters(cur, best);
    for (const w of pool) {
      const d = haversineMeters(cur, w);
      if (d < bestD) { best = w; bestD = d; }
    }
    tour.push(best);
    cur = best;
    remaining.splice(remaining.indexOf(best), 1);
  }
  return tour;
}

function totalDistance(home: Waypoint, tour: Waypoint[]): number {
  let total = 0;
  let cur = home;
  for (const w of tour) { total += haversineMeters(cur, w); cur = w; }
  total += haversineMeters(cur, home);
  return total;
}

/** 2-opt polish — only swap within a single priority tier. */
function twoOpt(home: Waypoint, tour: Waypoint[]): Waypoint[] {
  let best = [...tour];
  let bestDist = totalDistance(home, best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        if (best[i].priority !== best[k].priority) continue;
        const candidate = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)];
        const d = totalDistance(home, candidate);
        if (d < bestDist) { best = candidate; bestDist = d; improved = true; }
      }
    }
  }
  return best;
}

export function plan(home: Waypoint, waypoints: Waypoint[], perf: DronePerf): FlightPlan {
  const tour = twoOpt(home, nearestNeighbour(home, waypoints));
  const batteryAmpSec = perf.batteryAh * 3600;
  const reserve = batteryAmpSec * perf.reserveFrac;

  const sorties: FlightPlan["sorties"] = [];
  const dropped: string[] = [];
  let sortieLegs: FlightLeg[] = [];
  let cur = home;
  let used = 0;

  for (const w of tour) {
    const legToNext = legCost(cur, w, perf);
    const legRthFromNext = legCost(w, home, perf);
    if (used + legToNext.ampSecCost + legRthFromNext.ampSecCost > batteryAmpSec - reserve) {
      // can't safely reach w AND return home — close the sortie
      if (sortieLegs.length > 0) {
        const rth = legCost(cur, home, perf);
        sortieLegs.push(rth);
        used += rth.ampSecCost;
        sorties.push({ legs: sortieLegs, totalSec: sumEta(sortieLegs), ampSec: round(used, 1) });
      }
      // start new sortie from home — if even one hop doesn't fit, drop
      const fresh = legCost(home, w, perf);
      if (fresh.ampSecCost + legRthFromNext.ampSecCost > batteryAmpSec - reserve) {
        dropped.push(w.id);
        continue;
      }
      sortieLegs = [fresh];
      used = fresh.ampSecCost;
      cur = w;
    } else {
      sortieLegs.push(legToNext);
      used += legToNext.ampSecCost;
      cur = w;
    }
  }
  if (sortieLegs.length > 0) {
    const rth = legCost(cur, home, perf);
    sortieLegs.push(rth);
    used += rth.ampSecCost;
    sorties.push({ legs: sortieLegs, totalSec: sumEta(sortieLegs), ampSec: round(used, 1) });
  }

  return {
    home,
    sorties,
    totalDistanceM: Math.round(sorties.reduce((a, s) => a + s.legs.reduce((b, l) => b + l.distanceM, 0), 0)),
    droppedWaypoints: dropped,
  };
}

function sumEta(legs: FlightLeg[]): number {
  return round(legs.reduce((a, l) => a + l.etaSec, 0), 1);
}

function round(x: number, digits: number): number {
  const m = Math.pow(10, digits);
  return Math.round(x * m) / m;
}
