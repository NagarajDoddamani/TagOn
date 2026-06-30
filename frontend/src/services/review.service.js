import api from './api'

export const reviewService = {
  async getLatest(limit = 5) {
    const { data } = await api.get('/reviews/latest', { params: { limit } })
    return data
  },

  async getMyReviews() {
    const { data } = await api.get('/reviews/my')
    return data
  },

  async create(orderId, rating, title, review) {
    const { data } = await api.post('/reviews', { order_id: orderId, rating, title, review })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/reviews/${id}`)
    return data
  },

  async getProfileStats() {
    const { data } = await api.get('/profile/stats')
    return data
  },

  async getAdminAll(filters = {}) {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.rating) params.rating = filters.rating
    if (filters.sort) params.sort = filters.sort
    if (filters.page) params.page = filters.page
    if (filters.per_page) params.per_page = filters.per_page
    const { data } = await api.get('/admin/reviews', { params })
    return data
  },

  async toggleVisibility(id) {
    const { data } = await api.put(`/admin/reviews/${id}/visibility`)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/admin/reviews/${id}`)
    return data
  },
}
