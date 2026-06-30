import api from './api'

export const authService = {
  async register(name, email, phone, password, confirm_password) {
    const { data } = await api.post('/auth/register', {
      name, email, phone, password, confirm_password,
    })
    return data
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
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
