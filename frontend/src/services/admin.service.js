import api from './api'

export const adminService = {
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard')
    return data
  },

  async getCustomers(filters = {}) {
    const { data } = await api.get('/admin/customers', { params: filters })
    return data
  },

  async getCustomersPaginated(filters = {}, page = 1, perPage = 20) {
    const params = { ...filters, page, per_page: perPage }
    const { data } = await api.get('/admin/customers', { params })
    return data
  },

  async getCustomerDetail(id) {
    const { data } = await api.get(`/admin/customers/${id}`)
    return data
  },

  async getCustomerOrders(id) {
    const { data } = await api.get(`/admin/customers/${id}/orders`)
    return data
  },

  async updateCustomerStatus(id, status) {
    const { data } = await api.put(`/admin/customers/${id}/status`, null, {
      params: { status },
    })
    return data
  },

  async getSettingsGroup(group) {
    const { data } = await api.get(`/admin/settings/${group}`)
    return data
  },

  async updateSettingsGroup(group, values) {
    const { data } = await api.put(`/admin/settings/${group}`, values)
    return data
  },

  async uploadSettingsImage(group, key, file) {
    const formData = new FormData()
    formData.append('group', group)
    formData.append('key', key)
    formData.append('file', file)
    const { data } = await api.post('/admin/settings/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getActivityLogs() {
    const { data } = await api.get('/admin/activity-logs')
    return data
  },

  async downloadReport(reportType, format = 'csv', filters = {}) {
    const params = { fmt: format, ...filters }
    const response = await api.get(`/admin/reports/${reportType}`, {
      params,
      responseType: 'blob',
    })
    const disposition = response.headers['content-disposition']
    let filename = `${reportType}-report.${format}`
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/)
      if (match) filename = match[1]
    }
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
