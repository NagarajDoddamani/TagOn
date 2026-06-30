import api from './api'

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteImage(publicId) {
    await api.post('/uploads/delete', { public_id: publicId })
  },
}
