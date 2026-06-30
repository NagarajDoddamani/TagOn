import api from './api'

export const notificationService = {
  async getNotifications() {
    const { data } = await api.get('/notifications')
    return data
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count')
    return data
  },

  async markAsRead(id) {
    await api.put(`/notifications/${id}/read`)
  },

  async markAllRead() {
    await api.put('/notifications/read-all')
  },
}
