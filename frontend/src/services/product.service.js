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

  async getProducts(categoryId, productType, search, featured, isVisible, tags) {
    const params = new URLSearchParams()
    if (categoryId) params.append('category_id', categoryId)
    if (productType) params.append('product_type', productType)
    if (search) params.append('search', search)
    if (featured !== undefined) params.append('featured', featured)
    if (isVisible !== undefined) params.append('is_visible', isVisible)
    if (tags) params.append('tags', tags.join(','))
    const { data } = await api.get(`/products?${params}`)
    return data
  },

  async getProductsPaginated(paramsObj = {}) {
    const params = new URLSearchParams()
    Object.entries(paramsObj).forEach(([k, v]) => { if (v !== undefined && v !== null) params.append(k, v) })
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

  async addTemplateImages(templateId, formData) {
    const { data } = await api.post(`/products/templates/${templateId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteTemplateImage(imageId) {
    await api.delete(`/products/templates/images/${imageId}`)
  },

  async reorderTemplateImages(templateId, imageIds) {
    await api.put(`/products/templates/${templateId}/images/reorder`, imageIds)
  },

  async toggleFeatured(id, featured) {
    const { data } = await api.put(`/products/${id}/featured?featured=${featured}`)
    return data
  },

  async toggleVisibility(id, visible) {
    const { data } = await api.put(`/products/${id}/visibility?visible=${visible}`)
    return data
  },

  async setTags(id, tags) {
    const { data } = await api.put(`/products/${id}/tags`, tags)
    return data
  },
}
