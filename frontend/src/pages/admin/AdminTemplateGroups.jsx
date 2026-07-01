import { useState, useEffect } from 'react'
import { templateGroupService } from '../../services/template-group.service'
import { NO_IMAGE_FALLBACK } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'
import { confirmDelete, success as swalSuccess } from '../../utils/swal'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default function AdminTemplateGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [groupImage, setGroupImage] = useState(null)
  const [groupImagePreview, setGroupImagePreview] = useState('')
  const [designImages, setDesignImages] = useState([])
  const [designImagePreviews, setDesignImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)

  const [selectedGroup, setSelectedGroup] = useState(null)
  const [templates, setTemplates] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingPreviews, setPendingPreviews] = useState([])
  const [uploadingTemplates, setUploadingTemplates] = useState(false)
  const [maxUploadCount, setMaxUploadCount] = useState(1)

  const loadGroups = async () => {
    setLoading(true)
    try {
      const data = await templateGroupService.getGroups()
      setGroups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGroups() }, [])

  const resetForm = () => {
    setGroupName('')
    setGroupDesc('')
    setGroupImage(null)
    setGroupImagePreview('')
    setDesignImages([])
    setDesignImagePreviews([])
    setEditingGroup(null)
    setShowForm(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPEG and PNG images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setGroupImage(file)
    setGroupImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setGroupImage(null)
    setGroupImagePreview('')
  }

  const handleDesignImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    let added = 0
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Skipping ${file.name}: Only JPEG, PNG, WEBP allowed`)
        continue
      }
      if (file.size > MAX_SIZE) {
        toast.error(`Skipping ${file.name}: Must be less than 5MB`)
        continue
      }
      if (designImages.length + added >= 100) {
        toast.error('Maximum 100 design images')
        break
      }
      added++
      setDesignImages((prev) => [...prev, file])
      setDesignImagePreviews((prev) => [...prev, URL.createObjectURL(file)])
    }
  }

  const removeDesignImage = (index) => {
    setDesignImages((prev) => prev.filter((_, i) => i !== index))
    setDesignImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!groupName.trim()) {
      toast.error('Group name is required')
      return
    }
    setUploading(true)
    try {
      if (editingGroup) {
        const formData = new FormData()
        formData.append('name', groupName)
        if (groupDesc) formData.append('description', groupDesc)
        if (groupImage) formData.append('preview_image', groupImage)
        await templateGroupService.updateGroup(editingGroup.id, formData)
        swalSuccess('Template group updated')
      } else {
        const formData = new FormData()
        formData.append('name', groupName)
        if (groupDesc) formData.append('description', groupDesc)
        for (const file of designImages) {
          formData.append('design_images', file)
        }
        const result = await templateGroupService.createGroup(formData)
        const created = result.templates_created || 0
        const failed = result.templates_failed || 0
        if (created > 0) {
          swalSuccess(`Template group created with ${created} template(s)`)
        } else {
          swalSuccess('Template group created')
        }
        if (failed > 0) {
          toast.error(`${failed} image(s) failed to upload`)
        }
      }
      resetForm()
      loadGroups()
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || d.reason || String(d)).join(', ') : (detail || 'Failed to save template group')
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete('this template group')
    if (!result.isConfirmed) return
    try {
      await templateGroupService.deleteGroup(id)
      swalSuccess('Template group deleted')
      loadGroups()
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || String(d)).join(', ') : (detail || 'Failed to delete template group')
      toast.error(msg)
    }
  }

  const handleEdit = (group) => {
    setGroupName(group.name)
    setGroupDesc(group.description || '')
    setGroupImagePreview(group.preview_image || '')
    setEditingGroup(group)
    setShowForm(true)
  }

  const openTemplates = async (group) => {
    setSelectedGroup(group)
    try {
      const data = await templateGroupService.getGroupTemplates(group.id)
      setTemplates(data)
    } catch (err) {
      console.error(err)
    }
  }

  const openUploadModal = () => {
    setPendingFiles([])
    setPendingPreviews([])
    setMaxUploadCount(1)
    setShowUploadModal(true)
  }

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    let added = 0
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Skipping ${file.name}: Only JPEG, PNG, WEBP allowed`)
        continue
      }
      if (file.size > MAX_SIZE) {
        toast.error(`Skipping ${file.name}: Must be less than 5MB`)
        continue
      }
      if (pendingFiles.length + added >= 100) {
        toast.error('Maximum 100 templates per batch')
        break
      }
      added++
      setPendingFiles((prev) => [...prev, file])
      setPendingPreviews((prev) => [...prev, URL.createObjectURL(file)])
    }
  }

  const removePendingImage = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadTemplates = async () => {
    if (pendingFiles.length === 0) {
      toast.error('No files selected')
      return
    }
    setUploadingTemplates(true)
    try {
      const result = await templateGroupService.createTemplatesBatch(
        selectedGroup.id,
        pendingFiles,
        maxUploadCount
      )
      const created = result.total_created || result.templates?.length || 0
      const failed = result.total_failed || result.failed?.length || 0
      if (created > 0) {
        swalSuccess(`${created} template(s) created successfully`)
      }
      if (failed > 0) {
        toast.error(`${failed} file(s) failed`)
      }
      setShowUploadModal(false)
      setPendingFiles([])
      setPendingPreviews([])
      const data = await templateGroupService.getGroupTemplates(selectedGroup.id)
      setTemplates(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || String(d)).join(', ') : (detail || 'Failed to upload templates')
      toast.error(msg)
    } finally {
      setUploadingTemplates(false)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    const result = await confirmDelete('this template')
    if (!result.isConfirmed) return
    try {
      const { productService } = await import('../../services/product.service')
      await productService.deleteTemplate(templateId)
      toast.success('Template removed')
      const data = await templateGroupService.getGroupTemplates(selectedGroup.id)
      setTemplates(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || String(d)).join(', ') : (detail || 'Failed to delete template')
      toast.error(msg)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Template Groups</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
          New Template Group
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {groups.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No template groups yet.</td></tr>
            ) : (
              groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={g.preview_image || NO_IMAGE_FALLBACK} alt={g.name} className="w-12 h-12 object-cover rounded"
                      onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }} />
                  </td>
                  <td className="px-6 py-4 font-medium">{g.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{g.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${g.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openTemplates(g)} className="text-sm text-indigo-600 hover:underline">Templates</button>
                    <button onClick={() => handleEdit(g)} className="text-sm text-primary-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(g.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingGroup ? 'Edit Template Group' : 'Create Template Group'}</h2>
            <div className="space-y-4">
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group Name" required className="w-full px-3 py-2 border rounded-md" />
              <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 border rounded-md" />

              {editingGroup ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Preview Image</label>
                  {groupImagePreview ? (
                    <div className="relative inline-block">
                      <img src={groupImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">&times;</button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Template Design Images</label>
                  <p className="text-xs text-gray-500 mb-2">Each image becomes a separate Template record. First image is used as group thumbnail.</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleDesignImagesChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {designImages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{designImages.length} image(s) selected</p>
                  )}
                  {designImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-2">
                      {designImagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt={designImages[i].name} className="w-full h-20 object-cover rounded" />
                          <button
                            onClick={() => removeDesignImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            &times;
                          </button>
                          <p className="text-[10px] text-gray-500 truncate" title={designImages[i].name}>{designImages[i].name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={uploading} className="bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
                  {uploading ? 'Saving...' : editingGroup ? 'Update' : `Create${designImages.length > 0 ? ` (${designImages.length} template${designImages.length > 1 ? 's' : ''})` : ''}`}
                </button>
                <button onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Templates — {selectedGroup.name}</h2>
              <div className="flex items-center gap-3">
                <button onClick={openUploadModal} className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700">
                  + Upload Templates
                </button>
                <button onClick={() => { setSelectedGroup(null); setTemplates([]) }} className="text-gray-500 text-xl">&times;</button>
              </div>
            </div>

            {templates.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No templates in this group yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {templates.map((t) => (
                  <div key={t.id} className="border rounded-md p-3 relative group">
                    <button
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                    >
                      &times;
                    </button>
                    {t.images && t.images.length > 0 ? (
                      <img
                        src={t.images[0].image_url}
                        alt={t.name}
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
                      />
                    ) : (
                      <img src={NO_IMAGE_FALLBACK} alt="No image" className="w-full h-32 object-cover rounded mb-2 opacity-50" />
                    )}
                    <p className="text-xs font-medium truncate" title={t.name}>{t.name}</p>
                    <p className="text-[10px] text-gray-400">Max {t.max_upload_count} uploads</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showUploadModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Templates to {selectedGroup.name}</h2>
              <button onClick={() => { setShowUploadModal(false); setPendingFiles([]); setPendingPreviews([]) }} className="text-gray-500 text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Customer Uploads per Template</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxUploadCount}
                  onChange={(e) => setMaxUploadCount(Number(e.target.value))}
                  className="w-32 px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Images (JPEG/PNG/WEBP, max 5MB each, up to 100 files)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              {pendingFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{pendingFiles.length} image(s) selected — each will become a separate Template</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto border rounded p-2">
                    {pendingPreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img src={preview} alt={pendingFiles[i].name} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removePendingImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          &times;
                        </button>
                        <p className="text-[10px] text-gray-500 truncate mt-1" title={pendingFiles[i].name}>{pendingFiles[i].name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUploadTemplates}
                  disabled={pendingFiles.length === 0 || uploadingTemplates}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm"
                >
                  {uploadingTemplates ? 'Uploading...' : `Upload ${pendingFiles.length} Template(s)`}
                </button>
                <button
                  onClick={() => { setShowUploadModal(false); setPendingFiles([]); setPendingPreviews([]) }}
                  className="bg-gray-300 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
