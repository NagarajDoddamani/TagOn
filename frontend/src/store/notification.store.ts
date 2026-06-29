import { create } from 'zustand'
import { notificationService } from '../services/notification.service'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loadNotifications: () => Promise<void>
  loadUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
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

  markAsRead: async (id: string) => {
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
