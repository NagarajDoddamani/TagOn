import { create } from 'zustand'
import { authService } from '../services/auth.service'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    const response = await authService.login(email, password)
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    set({ user: response.user, token: response.access_token, isAuthenticated: true })
  },

  register: async (name, email, phone, password, confirm_password) => {
    const response = await authService.register(name, email, phone, password, confirm_password)
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    set({ user: response.user, token: response.access_token, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    if (!get().token) return
    set({ isLoading: true })
    try {
      const user = await authService.getProfile()
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))
