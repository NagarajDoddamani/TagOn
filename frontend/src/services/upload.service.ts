import api from './api'

export const uploadService = {
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ url: string; public_id: string }>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteImage(publicId: string) {
    await api.post('/uploads/delete', { public_id: publicId })
  },
}
