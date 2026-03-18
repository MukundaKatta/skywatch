'use client'

import { useStore } from '@/lib/store'
import { Plane, Map, Box, Radio, Layers, ClipboardCheck, BarChart3 } from 'lucide-react'
import MissionPlanner from '@/components/MissionPlanner'
import DroneViewer from '@/components/DroneViewer'
import LiveTelemetry from '@/components/LiveTelemetry'
import Reconstruction3D from '@/components/Reconstruction3D'
import FleetManagement from '@/components/FleetManagement'
import InspectionWorkflow from '@/components/InspectionWorkflow'

const tabs = [
  { id: 'planner', label: 'Mission Planner', icon: Map },
  { id: 'viewer', label: 'Drone Viewer', icon: Box },
  { id: 'telemetry', label: 'Live Telemetry', icon: Radio },
  { id: '3d', label: '3D Reconstruction', icon: Layers },
  { id: 'fleet', label: 'Fleet Management', icon: BarChart3 },
  { id: 'inspection', label: 'Inspection Workflow', icon: ClipboardCheck },
]

export default function HomePage() {
  const { activeTab, setActiveTab, drones } = useStore()
  const flyingCount = drones.filter(d => d.status === 'flying').length

  const render = () => {
    switch (activeTab) {
      case 'planner': return <MissionPlanner />
      case 'viewer': return <DroneViewer />
      case 'telemetry': return <LiveTelemetry />
      case '3d': return <Reconstruction3D />
      case 'fleet': return <FleetManagement />
      case 'inspection': return <InspectionWorkflow />
      default: return <MissionPlanner />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">SkyWatch</h1>
              <p className="text-xs text-gray-400">Drone Operations</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-sky-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Fleet</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <p className="text-lg font-bold">{drones.length} Drones</p>
            <p className="text-xs text-sky-400">{flyingCount} In Flight</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{render()}</main>
    </div>
  )
}
