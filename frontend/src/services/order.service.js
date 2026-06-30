import api from './api'

export const orderService = {
  async createOrder(orderData) {
    const { data } = await api.post('/orders', orderData)
    return data
  },

  async getOrders(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.payment_status) params.append('payment_status', filters.payment_status)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.min_amount) params.append('min_amount', filters.min_amount)
    if (filters.max_amount) params.append('max_amount', filters.max_amount)
    const { data } = await api.get(`/orders?${params}`)
    return data
  },

  async getOrdersPaginated(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.append(k, v) })
    const { data } = await api.get(`/orders?${params}`)
    return data
  },

  async getOrder(id) {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  async getStatusHistory(orderId) {
    const { data } = await api.get(`/orders/${orderId}/status-history`)
    return data
  },

  async getTimeline(orderId) {
    const { data } = await api.get(`/orders/${orderId}/timeline`)
    return data
  },
}
