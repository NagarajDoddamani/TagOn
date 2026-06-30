import { useState, useEffect } from 'react'
import { designService } from '../../services/design.service'
import { formatDate } from '../../utils/helpers'

export default function AdminDesignManager({ orderId, isCustomized, orderStatus, onStatusChange }) {
  const [previews, setPreviews] = useState([])
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState('')
  const [selectedPreview, setSelectedPreview] = useState(null)
  const canUpload = orderStatus === 'designing' || orderStatus === 'approval_pending'

  useEffect(() => {
    if (!isCustomized) return
    loadData()
  }, [orderId, isCustomized])

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

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await designService.uploadPreview(orderId, file, notes || undefined)
      setNotes('')
      await loadData()
      if (onStatusChange) onStatusChange()
    } catch (err) { console.error(err) } finally { setUploading(false) }
    e.target.value = ''
  }

  if (!isCustomized) return null

  return (
    <div className="bg-white rounded-lg shadow space-y-4">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-700">Design Management</h3>
      </div>

      {/* Upload new preview */}
      <div className="px-4">
        {canUpload && (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Design notes (optional)..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
            <label className={`inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? 'Uploading...' : 'Upload Design Preview'}
              <input type="file" onChange={handleUpload} className="hidden" accept="image/*" disabled={uploading} />
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Version selector */}
          {previews.length > 0 && (
            <div className="px-4 flex gap-2 flex-wrap">
              {previews.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreview(p)}
                  className={`px-3 py-1 text-sm rounded-full border ${selectedPreview?.id === p.id ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-100'}`}
                >
                  v{p.version}
                </button>
              ))}
            </div>
          )}

          {/* Preview display */}
          {selectedPreview && (
            <div className="px-4">
              <img src={selectedPreview.image_url} alt={`Design v${selectedPreview.version}`}
                   className="max-w-full max-h-[400px] rounded object-contain bg-gray-50" />
              {selectedPreview.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">{selectedPreview.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Uploaded {formatDate(selectedPreview.created_at)}
              </p>
            </div>
          )}

          {/* Revision history */}
          {revisions.length > 0 && (
            <div className="px-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Customer Responses</h4>
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

          {previews.length === 0 && (
            <div className="p-6 text-center text-gray-400">No design previews uploaded yet.</div>
          )}
        </>
      )}
    </div>
  )
}
