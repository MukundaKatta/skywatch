/**
 * Drone telemetry formatting and geofence utilities.
 *
 * All functions are pure and unit-agnostic at their boundary —
 * incoming MAVLink/RF data is normalized to SI units, then surfaced
 * via the format* helpers in the user's preferred system.
 */

export type UnitSystem = "metric" | "imperial";

export type TelemetryFrame = {
  /** Altitude above ground level, in metres. */
  altitudeM: number;
  /** Ground speed, in metres per second. */
  speedMS: number;
  /** Battery, 0..1 (fraction). */
  battery: number;
  /** Heading, in degrees (0 = N, 90 = E). */
  headingDeg: number;
  /** RSSI link quality, 0..1. */
  linkQuality?: number;
  lat: number;
  lon: number;
  timestamp: number;
};

const M_TO_FT = 3.28084;
const MS_TO_MPH = 2.23694;
const MS_TO_KMH = 3.6;

export function formatAltitude(m: number, system: UnitSystem = "metric"): string {
  if (system === "imperial") return `${Math.round(m * M_TO_FT)} ft`;
  return `${m.toFixed(1)} m`;
}

export function formatSpeed(ms: number, system: UnitSystem = "metric"): string {
  if (system === "imperial") return `${(ms * MS_TO_MPH).toFixed(1)} mph`;
  return `${(ms * MS_TO_KMH).toFixed(1)} km/h`;
}

export function formatBattery(fraction: number): string {
  const clamped = Math.max(0, Math.min(1, fraction));
  return `${Math.round(clamped * 100)}%`;
}

export function batteryState(fraction: number): "critical" | "low" | "ok" {
  if (fraction < 0.2) return "critical";
  if (fraction < 0.35) return "low";
  return "ok";
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export function headingCardinal(deg: number): (typeof COMPASS)[number] {
  const idx = Math.round(((deg % 360) + 360) / 45) % 8;
  return COMPASS[idx];
}

/**
 * Haversine distance in metres between two (lat, lon) points.
 */
export function haversineM(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type Geofence = {
  centerLat: number;
  centerLon: number;
  /** Radius in metres. */
  radiusM: number;
};

/**
 * Return true when the drone is inside the geofence. Use the returned
 * distance to drive a "X m to boundary" HUD element.
 */
export function evaluateGeofence(
  frame: Pick<TelemetryFrame, "lat" | "lon">,
  fence: Geofence,
): { inside: boolean; distanceM: number; marginM: number } {
  const d = haversineM(frame, { lat: fence.centerLat, lon: fence.centerLon });
  return {
    inside: d <= fence.radiusM,
    distanceM: d,
    marginM: fence.radiusM - d,
  };
}
