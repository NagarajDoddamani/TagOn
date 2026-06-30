import api from './api'

export const designService = {
  async uploadPreview(orderId, file, notes) {
    const formData = new FormData()
    formData.append('file', file)
    if (notes) formData.append('notes', notes)
    const { data } = await api.post(`/designs/${orderId}/previews`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getPreviews(orderId) {
    const { data } = await api.get(`/designs/${orderId}/previews`)
    return data
  },

  async getLatestPreview(orderId) {
    const { data } = await api.get(`/designs/${orderId}/previews/latest`)
    return data
  },

  async submitRevision(orderId, action, comments, designId) {
    const { data } = await api.post(`/designs/${orderId}/revisions`, {
      action,
      comments,
      design_id: designId,
    })
    return data
  },

  async getRevisions(orderId) {
    const { data } = await api.get(`/designs/${orderId}/revisions`)
    return data
  },

  async isApproved(orderId) {
    const { data } = await api.get(`/designs/${orderId}/is-approved`)
    return data.is_approved
  },
}
