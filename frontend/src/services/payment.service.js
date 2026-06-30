import api from './api'

export const paymentService = {
  async getQRCode() {
    const { data } = await api.get('/payments/qr')
    return data
  },

  async uploadScreenshot(orderId, screenshot, transactionId) {
    const formData = new FormData()
    formData.append('screenshot', screenshot)
    if (transactionId) formData.append('transaction_id', transactionId)
    const { data } = await api.post(`/payments/upload/${orderId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getPayment(orderId) {
    const { data } = await api.get(`/orders/${orderId}/payment`)
    return data
  },
}
