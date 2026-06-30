import api from './api'

export const templateGroupService = {
  async getGroups() {
    const { data } = await api.get('/template-groups')
    return data
  },

  async getGroup(id) {
    const { data } = await api.get(`/template-groups/${id}`)
    return data
  },

  async createGroup(formData) {
    const { data } = await api.post('/template-groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateGroup(id, formData) {
    const { data } = await api.put(`/template-groups/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteGroup(id) {
    await api.delete(`/template-groups/${id}`)
  },

  async getGroupTemplates(groupId) {
    const { data } = await api.get(`/template-groups/${groupId}/templates`)
    return data
  },

  async createTemplatesBatch(groupId, files, maxUploadCount = 1) {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    formData.append('max_upload_count', maxUploadCount)
    const { data } = await api.post(`/template-groups/${groupId}/templates/batch`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
