import api from './api'

export const orderService = {
  async createOrder(orderData) {
    const { data } = await api.post('/orders', orderData)
    return data
  },

  async getOrders(status) {
    const params = status ? `?status=${status}` : ''
    const { data } = await api.get(`/orders${params}`)
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
