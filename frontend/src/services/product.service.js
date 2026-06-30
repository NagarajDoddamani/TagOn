import api from './api'

export const productService = {
  async getCategories() {
    const { data } = await api.get('/products/categories')
    return data
  },

  async createCategory(name, description) {
    const { data } = await api.post('/products/categories', { name, description })
    return data
  },

  async updateCategory(id, name, description) {
    const { data } = await api.put(`/products/categories/${id}`, { name, description })
    return data
  },

  async deleteCategory(id) {
    await api.delete(`/products/categories/${id}`)
  },

  async getProducts(categoryId, productType, search) {
    const params = new URLSearchParams()
    if (categoryId) params.append('category_id', categoryId)
    if (productType) params.append('product_type', productType)
    if (search) params.append('search', search)
    const { data } = await api.get(`/products?${params}`)
    return data
  },

  async getProduct(id) {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  async createProduct(formData) {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateProduct(id, formData) {
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteProduct(id) {
    await api.delete(`/products/${id}`)
  },

  async getVariants(productId) {
    const { data } = await api.get(`/products/${productId}/variants`)
    return data
  },

  async createVariant(productId, variant) {
    const { data } = await api.post(`/products/${productId}/variants`, variant)
    return data
  },

  async updateVariant(variantId, variant) {
    const { data } = await api.put(`/products/variants/${variantId}`, variant)
    return data
  },

  async deleteVariant(variantId) {
    await api.delete(`/products/variants/${variantId}`)
  },

  async getTemplates(productId) {
    const { data } = await api.get(`/products/${productId}/templates`)
    return data
  },

  async createTemplate(productId, formData) {
    const { data } = await api.post(`/products/${productId}/templates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteTemplate(templateId) {
    await api.delete(`/products/templates/${templateId}`)
  },
}
