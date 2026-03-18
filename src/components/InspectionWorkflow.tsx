'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ClipboardCheck, CheckCircle, Clock, AlertCircle, Search, Zap, Building, Construction } from 'lucide-react'

const typeIcons: Record<string, any> = { powerline: Zap, building: Building, bridge: Construction, solar_farm: Zap, pipeline: Construction }
const statusColors = { pending: 'text-gray-400 bg-gray-600/20', scheduled: 'text-yellow-400 bg-yellow-600/20', in_progress: 'text-sky-400 bg-sky-600/20', review: 'text-purple-400 bg-purple-600/20', completed: 'text-green-400 bg-green-600/20' }
const priorityColors = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-orange-400', urgent: 'text-red-400' }

export default function InspectionWorkflow() {
  const { inspections } = useStore()
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? inspections : inspections.filter(i => i.status === filter)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inspection Workflow</h2>
        <p className="text-gray-400">Track and manage drone inspection operations</p>
      </div>

      {/* Workflow kanban */}
      <div className="grid grid-cols-5 gap-4">
        {(['pending', 'scheduled', 'in_progress', 'review', 'completed'] as const).map(status => {
          const items = inspections.filter(i => i.status === status)
          return (
            <div key={status} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium capitalize ${statusColors[status].split(' ')[0]}`}>{status.replace('_', ' ')}</span>
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(item => {
                  const Icon = typeIcons[item.type] || ClipboardCheck
                  return (
                    <div key={item.id} className="bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                        <span className={`capitalize ${priorityColors[item.priority]}`}>{item.priority}</span>
                      </div>
                      {item.findings > 0 && (
                        <div className="mt-1 text-[10px] text-orange-400">{item.findings} findings</div>
                      )}
                    </div>
                  )
                })}
                {items.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No items</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Inspection detail list */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Inspection</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Findings</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {inspections.map(i => (
              <tr key={i.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm font-medium">{i.name}</td>
                <td className="px-4 py-3 text-sm capitalize text-gray-400">{i.type.replace('_', ' ')}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[i.status]}`}>{i.status.replace('_', ' ')}</span></td>
                <td className="px-4 py-3"><span className={`text-sm capitalize ${priorityColors[i.priority]}`}>{i.priority}</span></td>
                <td className="px-4 py-3 text-sm">{i.findings}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(i.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
