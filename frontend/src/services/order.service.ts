import api from './api'
import type { Order, OrderListItem } from '../types'

export const orderService = {
  async createOrder(orderData: {
    product_id: string
    variant_id?: string
    template_id?: string
    quantity: number
    delivery_address: {
      recipient_name: string
      mobile: string
      address_line: string
      city: string
      state: string
      postal_code: string
      landmark?: string
    }
    customization_notes?: string
    uploaded_images?: string[]
  }) {
    const { data } = await api.post<Order>('/orders', orderData)
    return data
  },

  async getOrders(status?: string) {
    const params = status ? `?status=${status}` : ''
    const { data } = await api.get<OrderListItem[]>(`/orders${params}`)
    return data
  },

  async getOrder(id: string) {
    const { data } = await api.get<Order>(`/orders/${id}`)
    return data
  },

  async getStatusHistory(orderId: string) {
    const { data } = await api.get(`/orders/${orderId}/status-history`)
    return data
  },
}
