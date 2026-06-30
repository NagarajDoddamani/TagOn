import api from './api'

export const chatService = {
  async getMessages(orderId) {
    const { data } = await api.get(`/chat/${orderId}/messages`)
    return data
  },

  async sendMessage(orderId, message) {
    const { data } = await api.post(`/chat/${orderId}/messages`, { message })
    return data
  },

  async uploadAttachment(orderId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/chat/${orderId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getUnreadCount(orderId) {
    const { data } = await api.get(`/chat/${orderId}/unread`)
    return data.unread_count
  },

  async markRead(messageId) {
    await api.put(`/chat/messages/${messageId}/read`)
  },
}
