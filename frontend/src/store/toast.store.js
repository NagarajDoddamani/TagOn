import { create } from 'zustand'

let nextId = 0

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 4000) => {
    const id = ++nextId
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

export const toast = {
  success: (msg) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg) => useToastStore.getState().addToast(msg, 'error', 6000),
  info: (msg) => useToastStore.getState().addToast(msg, 'info'),
}
