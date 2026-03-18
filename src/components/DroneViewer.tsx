'use client'

import { useRef, useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Box, Battery, Navigation, Gauge } from 'lucide-react'

export default function DroneViewer() {
  const { drones } = useStore()
  const [viewDrone, setViewDrone] = useState(drones[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.clientWidth * 2
    canvas.height = canvas.clientHeight * 2
    ctx.scale(2, 2)

    let frame = 0
    const animate = () => {
      frame++
      const w = canvas.clientWidth, h = canvas.clientHeight, cx = w / 2, cy = h / 2

      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = '#1a1a3a'
      ctx.lineWidth = 0.5
      for (let i = -10; i <= 10; i++) {
        const y = cy + 60 + i * 10
        ctx.beginPath(); ctx.moveTo(cx - 200, y); ctx.lineTo(cx + 200, y); ctx.stroke()
      }

      // Hovering effect
      const hover = Math.sin(frame * 0.03) * 5

      // Drone body
      const bodyW = 30, bodyH = 15
      ctx.fillStyle = '#334155'
      ctx.beginPath()
      ctx.roundRect(cx - bodyW / 2, cy - bodyH / 2 + hover, bodyW, bodyH, 5)
      ctx.fill()

      // Arms
      const armLen = 60
      const arms = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
      arms.forEach(([dx, dy]) => {
        const ax = cx + dx * armLen * 0.7
        const ay = cy + dy * armLen * 0.4 + hover
        // Arm
        ctx.strokeStyle = '#475569'
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(cx, cy + hover); ctx.lineTo(ax, ay); ctx.stroke()
        // Motor
        ctx.fillStyle = '#64748b'
        ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2); ctx.fill()
        // Propeller
        ctx.strokeStyle = `rgba(14, 165, 233, ${0.5 + Math.sin(frame * 0.5 + dx) * 0.3})`
        ctx.lineWidth = 2
        const propAngle = frame * 0.3 + dx * dy
        ctx.beginPath()
        ctx.arc(ax, ay, 20, propAngle, propAngle + Math.PI * 0.3)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(ax, ay, 20, propAngle + Math.PI, propAngle + Math.PI * 1.3)
        ctx.stroke()
      })

      // Camera gimbal
      ctx.fillStyle = '#1e293b'
      ctx.beginPath(); ctx.arc(cx, cy + bodyH / 2 + 5 + hover, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#0ea5e9'
      ctx.beginPath(); ctx.arc(cx, cy + bodyH / 2 + 5 + hover, 2.5, 0, Math.PI * 2); ctx.fill()

      // LED indicators
      ctx.fillStyle = viewDrone.status === 'flying' ? '#22c55e' : viewDrone.status === 'charging' ? '#3b82f6' : '#eab308'
      ctx.beginPath(); ctx.arc(cx - bodyW / 2 + 5, cy - bodyH / 2 + 3 + hover, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + bodyW / 2 - 5, cy - bodyH / 2 + 3 + hover, 2, 0, Math.PI * 2); ctx.fill()

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath(); ctx.ellipse(cx, cy + 80, 50, 10, 0, 0, Math.PI * 2); ctx.fill()

      // Info
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(viewDrone.name, cx, cy + 110)
      ctx.fillStyle = '#888'
      ctx.font = '11px system-ui'
      ctx.fillText(viewDrone.model, cx, cy + 128)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [viewDrone])

  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700 flex gap-6">
          <div className="text-center">
            <Battery className="w-5 h-5 mx-auto text-green-400 mb-1" />
            <p className="text-sm font-bold">{viewDrone.battery.toFixed(0)}%</p>
          </div>
          <div className="text-center">
            <Navigation className="w-5 h-5 mx-auto text-sky-400 mb-1" />
            <p className="text-sm font-bold">{viewDrone.altitude.toFixed(0)}m</p>
          </div>
          <div className="text-center">
            <Gauge className="w-5 h-5 mx-auto text-violet-400 mb-1" />
            <p className="text-sm font-bold">{viewDrone.speed.toFixed(0)} kph</p>
          </div>
        </div>
      </div>
      <div className="w-72 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Drones</h3>
        <div className="space-y-2">
          {drones.map(d => (
            <button key={d.id} onClick={() => setViewDrone(d)}
              className={`w-full text-left p-3 rounded-xl ${viewDrone.id === d.id ? 'bg-sky-600/20 border border-sky-500' : 'bg-gray-800 border border-transparent hover:border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.name}</span>
                <span className={`w-2 h-2 rounded-full ${d.status === 'flying' ? 'bg-green-400 animate-pulse' : d.status === 'charging' ? 'bg-blue-400' : 'bg-gray-400'}`} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{d.model} | {d.battery.toFixed(0)}%</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
