import api from './api'

export const addressService = {
  async getAddresses() {
    const { data } = await api.get('/addresses')
    return data
  },

  async createAddress(address) {
    const { data } = await api.post('/addresses', address)
    return data
  },

  async updateAddress(id, address) {
    const { data } = await api.put(`/addresses/${id}`, address)
    return data
  },

  async deleteAddress(id) {
    await api.delete(`/addresses/${id}`)
  },

  async setDefaultAddress(id) {
    const { data } = await api.put(`/addresses/${id}/default`)
    return data
  },
}
