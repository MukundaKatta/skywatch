'use client'

import { useRef, useEffect } from 'react'
import { Layers, RotateCcw, ZoomIn, Download } from 'lucide-react'

export default function Reconstruction3D() {
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

      // Point cloud simulation
      const points = 500
      const rot = frame * 0.005
      for (let i = 0; i < points; i++) {
        const theta = (i / points) * Math.PI * 2
        const phi = Math.sin(i * 0.1 + frame * 0.01) * 0.5
        const r = 80 + Math.sin(i * 0.3) * 40

        const x3d = r * Math.cos(theta + rot) * Math.cos(phi)
        const y3d = r * Math.sin(phi) * 0.5 + Math.sin(i * 0.05) * 20
        const z3d = r * Math.sin(theta + rot) * Math.cos(phi)

        const scale = 1 / (1 + z3d / 400)
        const px = cx + x3d * scale
        const py = cy + y3d * scale

        const depth = (z3d + 120) / 240
        const size = Math.max(1, 3 * scale)

        // Color based on height (y3d)
        const hue = (y3d + 50) * 2
        ctx.fillStyle = `hsl(${200 + hue * 0.5}, 70%, ${40 + depth * 30}%)`
        ctx.fillRect(px, py, size, size)
      }

      // Building-like structures
      const buildings = [
        { x: -60, y: 20, z: 0, w: 30, h: 60 },
        { x: 40, y: 10, z: 20, w: 25, h: 45 },
        { x: -20, y: 15, z: -30, w: 35, h: 50 },
      ]
      buildings.forEach(b => {
        const rx = b.x * Math.cos(rot) - b.z * Math.sin(rot)
        const rz = b.x * Math.sin(rot) + b.z * Math.cos(rot)
        const scale = 1 / (1 + rz / 400)
        const px = cx + rx * scale
        const py = cy + b.y * scale

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(px - b.w * scale / 2, py - b.h * scale, b.w * scale, b.h * scale)

        // Wireframe details
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 + i * 0.02})`
          const yy = py - b.h * scale + (b.h * scale / 5) * i
          ctx.beginPath(); ctx.moveTo(px - b.w * scale / 2, yy); ctx.lineTo(px + b.w * scale / 2, yy); ctx.stroke()
        }
      })

      // Ground plane grid
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)'
      ctx.lineWidth = 0.5
      for (let i = -5; i <= 5; i++) {
        const sx = cx + i * 30 * Math.cos(rot)
        ctx.beginPath(); ctx.moveTo(sx - 100, cy + 60); ctx.lineTo(sx + 100, cy + 60); ctx.stroke()
      }

      // Info
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(15, 15, 200, 50)
      ctx.fillStyle = '#0ea5e9'
      ctx.font = 'bold 12px monospace'
      ctx.fillText('3D RECONSTRUCTION', 25, 35)
      ctx.fillStyle = '#888'
      ctx.font = '10px monospace'
      ctx.fillText(`Points: ${points} | Rotating`, 25, 50)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" /> 3D Reconstruction
        </h2>
        <div className="flex gap-2">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"><RotateCcw className="w-4 h-4" /></button>
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"><ZoomIn className="w-4 h-4" /></button>
          <button className="p-2 bg-sky-600 rounded-lg hover:bg-sky-500"><Download className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  )
}
