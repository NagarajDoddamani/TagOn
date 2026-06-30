import { useState, useEffect } from 'react'
import { orderService } from '../../services/order.service'
import { formatDate } from '../../utils/helpers'

const TIMELINE_ICONS = {
  status_change: '🔄',
  design_preview: '🎨',
  design_approved: '✅',
  design_changes_requested: '✏️',
  chat_message: '💬',
}

export default function OrderTimeline({ orderId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
    const interval = setInterval(loadTimeline, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  async function loadTimeline() {
    try {
      const data = await orderService.getTimeline(orderId)
      setEntries(data)
    } catch { } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-700">Order Timeline</h3>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-4">Loading timeline...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No timeline events yet.</div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"
                       style={{ top: 4 }} />
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>{TIMELINE_ICONS[entry.type] || '📌'}</span>
                      <span className="font-medium text-gray-700">{entry.title}</span>
                    </div>
                    {entry.description && (
                      <p className="text-gray-500 text-xs mt-0.5">{entry.description}</p>
                    )}
                    {entry.image_url && (
                      <img src={entry.image_url} alt="design preview" className="mt-1 max-w-[150px] rounded border" />
                    )}
                    <p className="text-gray-400 text-xs mt-0.5">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
