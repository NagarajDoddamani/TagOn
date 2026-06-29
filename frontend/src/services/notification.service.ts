import api from './api'
import type { Notification } from '../types'

export const notificationService = {
  async getNotifications() {
    const { data } = await api.get<Notification[]>('/notifications')
    return data
  },

  async getUnreadCount() {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count')
    return data
  },

  async markAsRead(id: string) {
    await api.put(`/notifications/${id}/read`)
  },

  async markAllRead() {
    await api.put('/notifications/read-all')
  },
}
