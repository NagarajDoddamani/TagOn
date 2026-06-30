import api from './api'
import type { Product, ProductListItem, Category, ProductVariant, Template } from '../types'

export const productService = {
  async getCategories() {
    const { data } = await api.get<Category[]>('/products/categories')
    return data
  },

  async createCategory(name: string, description?: string) {
    const { data } = await api.post<Category>('/products/categories', { name, description })
    return data
  },

  async updateCategory(id: string, name: string, description?: string) {
    const { data } = await api.put<Category>(`/products/categories/${id}`, { name, description })
    return data
  },

  async deleteCategory(id: string) {
    await api.delete(`/products/categories/${id}`)
  },

  async getProducts(categoryId?: string, productType?: string, search?: string) {
    const params = new URLSearchParams()
    if (categoryId) params.append('category_id', categoryId)
    if (productType) params.append('product_type', productType)
    if (search) params.append('search', search)
    const { data } = await api.get<ProductListItem[]>(`/products?${params}`)
    return data
  },

  async getProduct(id: string) {
    const { data } = await api.get<Product>(`/products/${id}`)
    return data
  },

  async createProduct(formData: FormData) {
    const { data } = await api.post<Product>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateProduct(id: string, formData: FormData) {
    const { data } = await api.put<Product>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteProduct(id: string) {
    await api.delete(`/products/${id}`)
  },

  async getVariants(productId: string) {
    const { data } = await api.get<ProductVariant[]>(`/products/${productId}/variants`)
    return data
  },

  async createVariant(productId: string, variant: { name: string; price: number; stock: number; image_url?: string }) {
    const { data } = await api.post(`/products/${productId}/variants`, variant)
    return data
  },

  async updateVariant(variantId: string, variant: { name?: string; price?: number; stock?: number; image_url?: string }) {
    const { data } = await api.put(`/products/variants/${variantId}`, variant)
    return data
  },

  async deleteVariant(variantId: string) {
    await api.delete(`/products/variants/${variantId}`)
  },

  async getTemplates(productId: string) {
    const { data } = await api.get<Template[]>(`/products/${productId}/templates`)
    return data
  },

  async createTemplate(productId: string, formData: FormData) {
    const { data } = await api.post(`/products/${productId}/templates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteTemplate(templateId: string) {
    await api.delete(`/products/templates/${templateId}`)
  },
}
