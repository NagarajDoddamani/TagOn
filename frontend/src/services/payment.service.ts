import api from './api'
import type { Payment } from '../types'

export const paymentService = {
  async getQRCode() {
    const { data } = await api.get<{ qr_image_url: string }>('/payments/qr')
    return data
  },

  async uploadScreenshot(orderId: string, screenshot: File, transactionId?: string) {
    const formData = new FormData()
    formData.append('screenshot', screenshot)
    if (transactionId) formData.append('transaction_id', transactionId)
    const { data } = await api.post<Payment>(`/payments/upload/${orderId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getPayment(orderId: string) {
    const { data } = await api.get<Payment>(`/orders/${orderId}/payment`)
    return data
  },
}
