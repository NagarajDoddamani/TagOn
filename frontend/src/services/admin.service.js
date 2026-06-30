import api from './api'

export const adminService = {
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard')
    return data
  },

  async getCustomers() {
    const { data } = await api.get('/admin/customers')
    return data
  },

  async getActivityLogs() {
    const { data } = await api.get('/admin/activity-logs')
    return data
  },
}
