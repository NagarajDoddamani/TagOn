import { useState, useEffect } from 'react'
import { designService } from '../../services/design.service'
import { toast } from '../../store/toast.store'
import { formatDate } from '../../utils/helpers'

export default function DesignPreviewPanel({ orderId, isCustomized, orderStatus }) {
  const [previews, setPreviews] = useState([])
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState('')
  const [selectedPreview, setSelectedPreview] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [canReview, setCanReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const hasApproved = revisions.some(r => r.action === 'approved')
  const latestRevision = revisions[revisions.length - 1]

  useEffect(() => {
    if (!isCustomized) return
    loadData()
  }, [orderId, isCustomized])

  useEffect(() => {
    setCanReview(
      isCustomized &&
      previews.length > 0 &&
      !hasApproved &&
      (orderStatus === 'approval_pending' || orderStatus === 'designing')
    )
  }, [previews, revisions, orderStatus, isCustomized])

  async function loadData() {
    try {
      const [p, r] = await Promise.all([
        designService.getPreviews(orderId),
        designService.getRevisions(orderId),
      ])
      setPreviews(p)
      setRevisions(r)
      if (p.length > 0) setSelectedPreview(p[p.length - 1])
    } catch { } finally { setLoading(false) }
  }

  async function handleApprove() {
    setSubmitting(true)
    try {
      await designService.submitRevision(orderId, 'approved', comments, selectedPreview?.id)
      await loadData()
      setComments('')
      toast.success('Design approved')
    } catch { toast.error('Failed to approve design') } finally { setSubmitting(false) }
  }

  async function handleRequestChanges() {
    if (!comments.trim()) return
    setSubmitting(true)
    try {
      await designService.submitRevision(orderId, 'changes_requested', comments, selectedPreview?.id)
      await loadData()
      setComments('')
      toast.info('Changes requested')
    } catch { toast.error('Failed to submit request') } finally { setSubmitting(false) }
  }

  if (!isCustomized) return null

  return (
    <div className="bg-white rounded-lg shadow space-y-4">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-700">Design Preview</h3>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-400">Loading design previews...</div>
      ) : previews.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No design previews uploaded yet.</div>
      ) : (
        <>
          {/* Version selector */}
          <div className="px-4 flex gap-2 flex-wrap">
            {previews.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPreview(p); setZoom(1) }}
                className={`px-3 py-1 text-sm rounded-full border ${selectedPreview?.id === p.id ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                v{p.version}
              </button>
            ))}
          </div>

          {/* Preview image */}
          {selectedPreview && (
            <div className="px-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                   style={{ minHeight: 300 }}>
                <img
                  src={selectedPreview.image_url}
                  alt={`Design v${selectedPreview.version}`}
                  loading="lazy"
                  style={{ transform: `scale(${zoom})`, maxWidth: '100%', maxHeight: 500 }}
                  className="transition-transform duration-200 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="flex gap-2 mt-2 justify-center">
                <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                        className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Zoom +</button>
                <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}
                        className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Zoom -</button>
                <a href={selectedPreview.image_url} target="_blank" rel="noopener noreferrer"
                   className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">
                  Download
                </a>
              </div>
              {selectedPreview.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">{selectedPreview.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Uploaded on {formatDate(selectedPreview.created_at)}
              </p>
            </div>
          )}

          {/* Revision history */}
          {revisions.length > 0 && (
            <div className="px-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Revision History</h4>
              <div className="space-y-1">
                {revisions.map((r) => (
                  <div key={r.id} className={`text-xs px-3 py-1.5 rounded ${r.action === 'approved' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    <span className="font-medium">{r.action === 'approved' ? 'Approved' : 'Changes Requested'}</span>
                    {r.comments && <span>: {r.comments}</span>}
                    <span className="text-gray-400 ml-2">{formatDate(r.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval actions */}
          {canReview && (
            <div className="p-4 border-t space-y-3">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your comments or feedback (required for change request)..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  Approve Design
                </button>
                <button
                  onClick={handleRequestChanges}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
                  disabled={submitting || !comments.trim()}
                >
                  Request Changes
                </button>
              </div>
            </div>
          )}

          {hasApproved && (
            <div className="p-4 border-t text-center text-green-600 font-medium">
              Design Approved ✓
            </div>
          )}
        </>
      )}
    </div>
  )
}
