'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Radio, Battery, Gauge, Thermometer, Wind, Signal, MapPin, Compass } from 'lucide-react'

export default function LiveTelemetry() {
  const { drones } = useStore()
  const [selectedDrone, setSelectedDrone] = useState(drones.find(d => d.status === 'flying') || drones[0])
  const [telemetryHistory, setTelemetryHistory] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryHistory(prev => [...prev.slice(-29), 50 + Math.random() * 50])
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const metrics = [
    { label: 'Battery', value: `${selectedDrone.battery.toFixed(0)}%`, icon: Battery, color: '#22c55e' },
    { label: 'Altitude', value: `${selectedDrone.altitude.toFixed(0)}m`, icon: MapPin, color: '#0ea5e9' },
    { label: 'Speed', value: `${selectedDrone.speed.toFixed(1)} kph`, icon: Gauge, color: '#8b5cf6' },
    { label: 'Heading', value: `${selectedDrone.heading.toFixed(0)}deg`, icon: Compass, color: '#f59e0b' },
    { label: 'Signal', value: '98%', icon: Signal, color: '#22c55e' },
    { label: 'Temperature', value: '24C', icon: Thermometer, color: '#ef4444' },
    { label: 'Wind', value: '12 kph', icon: Wind, color: '#06b6d4' },
    { label: 'GPS Accuracy', value: '0.5m', icon: MapPin, color: '#10b981' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Telemetry</h2>
          <p className="text-gray-400">Real-time drone sensor data and status</p>
        </div>
        <select value={selectedDrone.id} onChange={e => setSelectedDrone(drones.find(d => d.id === e.target.value) || drones[0])}
          className="bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
          {drones.map(d => <option key={d.id} value={d.id}>{d.name} ({d.status})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
            <p className="text-xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Live signal chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5 text-sky-400 animate-pulse" /> Signal Strength (Live)
        </h3>
        <div className="flex items-end gap-1 h-32">
          {telemetryHistory.map((v, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
              height: `${v}%`,
              backgroundColor: v > 80 ? '#22c55e' : v > 60 ? '#eab308' : '#ef4444',
              opacity: 0.4 + (i / telemetryHistory.length) * 0.6,
            }} />
          ))}
          {telemetryHistory.length === 0 && <p className="text-gray-500 text-sm m-auto">Waiting for data...</p>}
        </div>
      </div>

      {/* Battery discharge curve */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Battery Discharge Estimate</h3>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 30 }, (_, i) => {
            const h = Math.max(5, selectedDrone.battery - i * (selectedDrone.battery / 30) + Math.random() * 3)
            return (
              <div key={i} className="flex-1 rounded-t-sm" style={{
                height: `${h}%`,
                backgroundColor: h > 50 ? '#22c55e' : h > 25 ? '#eab308' : '#ef4444',
              }} />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Now</span><span>Est. landing: {(selectedDrone.battery / 3).toFixed(0)} min</span>
        </div>
      </div>
    </div>
  )
}
