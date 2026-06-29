import api from './api'
import type { AuthResponse } from '../types'

export const authService = {
  async register(name: string, email: string, phone: string, password: string, confirm_password: string) {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name, email, phone, password, confirm_password,
    })
    return data
  },

  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async getProfile() {
    const { data } = await api.get('/auth/me')
    return data
  },
}
