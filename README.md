# SkyWatch

Drone operations platform with mission planning, live telemetry, 3D reconstruction, and fleet management.

## Features

- **Mission Planner** -- Plan autonomous drone flight paths and waypoints
- **3D Drone Viewer** -- Interactive Three.js visualization of drone models
- **Live Telemetry** -- Real-time altitude, speed, battery, and GPS data streams
- **3D Reconstruction** -- Generate 3D models from aerial imagery and LiDAR
- **Fleet Management** -- Monitor and manage multiple drones across operations
- **Inspection Workflow** -- Structured workflows for infrastructure inspection tasks
- **Mapbox Integration** -- Geographic visualization with satellite imagery

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Rendering:** Three.js, React Three Fiber, React Three Drei
- **Mapping:** Mapbox GL
- **State Management:** Zustand
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Database:** Supabase
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd skywatch
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
skywatch/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── MissionPlanner.tsx
│   │   ├── DroneViewer.tsx
│   │   ├── LiveTelemetry.tsx
│   │   ├── Reconstruction3D.tsx
│   │   ├── FleetManagement.tsx
│   │   └── InspectionWorkflow.tsx
│   └── lib/              # Utilities, store, mock data
├── public/               # Static assets
└── package.json
```

