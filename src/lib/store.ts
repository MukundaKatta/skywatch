import { create } from 'zustand'

export interface Drone {
  id: string; name: string; model: string
  status: 'flying' | 'idle' | 'charging' | 'maintenance' | 'returning'
  lat: number; lng: number; altitude: number; speed: number; battery: number; heading: number
  currentMission: string | null
}

export interface Mission {
  id: string; name: string; type: 'inspection' | 'survey' | 'mapping' | 'monitoring' | 'search_rescue'
  status: 'planned' | 'in_progress' | 'completed' | 'aborted'
  droneId: string | null; waypoints: [number, number][]; altitude: number
  startTime: string | null; endTime: string | null; progress: number
}

export interface Telemetry {
  droneId: string; timestamp: string; battery: number; altitude: number; speed: number
  gpsAccuracy: number; signalStrength: number; temperature: number; windSpeed: number
}

export interface Inspection {
  id: string; name: string; type: 'powerline' | 'building' | 'bridge' | 'solar_farm' | 'pipeline'
  status: 'pending' | 'scheduled' | 'in_progress' | 'review' | 'completed'
  droneId: string | null; findings: number; priority: 'low' | 'medium' | 'high' | 'urgent'
  date: string
}

const drones: Drone[] = Array.from({ length: 12 }, (_, i) => ({
  id: `drone-${i + 1}`, name: `SkyWatch-${String(i + 1).padStart(3, '0')}`,
  model: ['Matrice 350', 'Mavic 3E', 'Inspire 3', 'Phantom 5'][i % 4],
  status: (['flying', 'idle', 'charging', 'maintenance', 'returning'] as const)[i % 5],
  lat: 37.77 + (Math.random() - 0.5) * 0.08, lng: -122.42 + (Math.random() - 0.5) * 0.08,
  altitude: 50 + Math.random() * 150, speed: Math.random() * 40, battery: 20 + Math.random() * 80,
  heading: Math.random() * 360, currentMission: i % 3 === 0 ? `mission-${i + 1}` : null,
}))

const missions: Mission[] = [
  { id: 'm1', name: 'Power Line Survey Route A', type: 'inspection', status: 'in_progress', droneId: 'drone-1', waypoints: [[-122.42, 37.77], [-122.41, 37.78], [-122.40, 37.78]], altitude: 80, startTime: new Date().toISOString(), endTime: null, progress: 65 },
  { id: 'm2', name: 'Building Exterior Scan', type: 'inspection', status: 'planned', droneId: null, waypoints: [[-122.43, 37.79]], altitude: 120, startTime: null, endTime: null, progress: 0 },
  { id: 'm3', name: 'Construction Site Mapping', type: 'mapping', status: 'in_progress', droneId: 'drone-4', waypoints: [[-122.39, 37.76], [-122.38, 37.76], [-122.38, 37.77], [-122.39, 37.77]], altitude: 100, startTime: new Date().toISOString(), endTime: null, progress: 40 },
  { id: 'm4', name: 'Solar Farm Monitoring', type: 'monitoring', status: 'completed', droneId: 'drone-7', waypoints: [[-122.44, 37.75]], altitude: 60, startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date().toISOString(), progress: 100 },
  { id: 'm5', name: 'Coastal Erosion Survey', type: 'survey', status: 'planned', droneId: null, waypoints: [[-122.50, 37.78], [-122.49, 37.78]], altitude: 90, startTime: null, endTime: null, progress: 0 },
]

const inspections: Inspection[] = [
  { id: 'insp-1', name: 'Downtown Power Grid', type: 'powerline', status: 'in_progress', droneId: 'drone-1', findings: 3, priority: 'high', date: new Date().toISOString() },
  { id: 'insp-2', name: '555 Market Building', type: 'building', status: 'review', droneId: null, findings: 7, priority: 'medium', date: new Date().toISOString() },
  { id: 'insp-3', name: 'Bay Bridge Section C', type: 'bridge', status: 'scheduled', droneId: null, findings: 0, priority: 'urgent', date: new Date(Date.now() + 86400000).toISOString() },
  { id: 'insp-4', name: 'Sunset Solar Array', type: 'solar_farm', status: 'completed', droneId: 'drone-7', findings: 2, priority: 'low', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'insp-5', name: 'Gas Pipeline Route 7', type: 'pipeline', status: 'pending', droneId: null, findings: 0, priority: 'high', date: new Date(Date.now() + 172800000).toISOString() },
]

interface AppState {
  activeTab: string; drones: Drone[]; missions: Mission[]; inspections: Inspection[]
  selectedDrone: Drone | null
  setActiveTab: (t: string) => void; selectDrone: (d: Drone | null) => void
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'planner', drones, missions, inspections, selectedDrone: null,
  setActiveTab: (t) => set({ activeTab: t }),
  selectDrone: (d) => set({ selectedDrone: d }),
}))
