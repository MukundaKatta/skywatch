'use client'

import { useStore } from '@/lib/store'
import { Map, Plus, Play, Pause, CheckCircle, Clock, AlertCircle, Navigation } from 'lucide-react'

const statusColors = { planned: 'text-yellow-400 bg-yellow-600/20', in_progress: 'text-sky-400 bg-sky-600/20', completed: 'text-green-400 bg-green-600/20', aborted: 'text-red-400 bg-red-600/20' }

export default function MissionPlanner() {
  const { missions, drones } = useStore()

  return (
    <div className="h-full flex">
      <div className="flex-1 relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <svg className="w-full h-full opacity-10">
            {Array.from({ length: 20 }, (_, i) => (
              <line key={i} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#0ea5e9" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#0ea5e9" strokeWidth="0.5" />
            ))}
          </svg>

          {/* Mission waypoints on map */}
          {missions.filter(m => m.status !== 'completed').map((mission, mi) => {
            const colors = { planned: '#eab308', in_progress: '#0ea5e9', completed: '#22c55e', aborted: '#ef4444' }
            return mission.waypoints.map((wp, wi) => {
              const x = 20 + mi * 18 + wi * 5
              const y = 25 + mi * 15 + wi * 3
              return (
                <div key={`${mission.id}-${wi}`} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: colors[mission.status], backgroundColor: `${colors[mission.status]}30` }}>
                    <span className="text-[6px] font-bold" style={{ color: colors[mission.status] }}>{wi + 1}</span>
                  </div>
                </div>
              )
            })
          })}

          {/* Flying drones */}
          {drones.filter(d => d.status === 'flying').map((drone, i) => {
            const x = 30 + i * 20
            const y = 35 + i * 12
            return (
              <div key={drone.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/30">
                  <Navigation className="w-4 h-4 text-white" style={{ transform: `rotate(${drone.heading}deg)` }} />
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-sky-300 whitespace-nowrap">{drone.name}</span>
              </div>
            )
          })}
        </div>

        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <p className="text-sm font-medium">Mission Planner</p>
          <p className="text-xs text-sky-400 mt-1">Mapbox GL integration ready</p>
        </div>
      </div>

      <div className="w-96 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Missions</h3>
          <button className="p-2 bg-sky-600 rounded-lg hover:bg-sky-500"><Plus className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {missions.map(mission => (
            <div key={mission.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{mission.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[mission.status]}`}>{mission.status.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400 mb-3">
                <span className="capitalize">{mission.type.replace('_', ' ')}</span>
                <span>{mission.altitude}m alt</span>
                <span>{mission.waypoints.length} waypoints</span>
              </div>
              {mission.status === 'in_progress' && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-sky-400">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${mission.progress}%` }} />
                  </div>
                </div>
              )}
              {mission.droneId && (
                <p className="text-xs text-gray-400">Drone: {mission.droneId}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
