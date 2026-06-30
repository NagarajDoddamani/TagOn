import { create } from 'zustand'
import { notificationService } from '../services/notification.service'

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  loadNotifications: async () => {
    const notifications = await notificationService.getNotifications()
    set({ notifications })
  },

  loadUnreadCount: async () => {
    const { count } = await notificationService.getUnreadCount()
    set({ unreadCount: count })
  },

  markAsRead: async (id) => {
    await notificationService.markAsRead(id)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: 'read' } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await notificationService.markAllRead()
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: 'read' })),
      unreadCount: 0,
    }))
  },
}))
