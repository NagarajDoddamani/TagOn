import { useState, useEffect } from 'react'
import { productService } from '../../services/product.service'
import type { ProductListItem, Category, Template } from '../../types'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminProductManagement() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [productType, setProductType] = useState('customized')
  const [customizable, setCustomizable] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [maxUploadCount, setMaxUploadCount] = useState(1)

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ])
      setProducts(p)
      setCategories(c)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setBasePrice('')
    setProductType('customized')
    setCustomizable(false)
    setCategoryId('')
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('category_id', categoryId)
    formData.append('base_price', basePrice)
    formData.append('product_type', productType)
    formData.append('customizable', String(customizable))
    if (description) formData.append('description', description)

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct, formData)
      } else {
        await productService.createProduct(formData)
      }
      resetForm()
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await productService.createCategory(catName, catDesc || undefined)
      setCatName('')
      setCatDesc('')
      setShowCategoryForm(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create category')
    }
  }

  const handleCreateTemplate = async (productId: string) => {
    try {
      const formData = new FormData()
      formData.append('name', templateName)
      formData.append('max_upload_count', String(maxUploadCount))
      await productService.createTemplate(productId, formData)
      setTemplateName('')
      setMaxUploadCount(1)
      setShowTemplateForm(null)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create template')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productService.deleteProduct(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            New Category
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            New Product
          </button>
        </div>
      </div>

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name" required className="w-full px-3 py-2 border rounded-md" />
              <input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 border rounded-md" />
              <div className="flex gap-3">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Create</button>
                <button type="button" onClick={() => setShowCategoryForm(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required className="w-full px-3 py-2 border rounded-md" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded-md" />
              <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} type="number" step="0.01" placeholder="Base Price" required className="w-full px-3 py-2 border rounded-md" />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full px-3 py-2 border rounded-md">
                <option value="">Select Category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option value="customized">Customized</option>
                <option value="ready_made">Ready-Made</option>
              </select>
              <label className="flex items-center">
                <input type="checkbox" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)} className="mr-2" />
                Customizable
              </label>
              <div className="flex gap-3">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">{editingProduct ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Template</h2>
            <div className="space-y-4">
              <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template Name" className="w-full px-3 py-2 border rounded-md" />
              <input value={maxUploadCount} onChange={(e) => setMaxUploadCount(Number(e.target.value))} type="number" min="1" placeholder="Max Images" className="w-full px-3 py-2 border rounded-md" />
              <div className="flex gap-3">
                <button onClick={() => handleCreateTemplate(showTemplateForm)} className="bg-primary-600 text-white px-4 py-2 rounded-md">Create</button>
                <button onClick={() => setShowTemplateForm(null)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.category?.name}</td>
                <td className="px-6 py-4">{formatCurrency(p.base_price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.customizable ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.customizable ? 'Custom' : p.product_type}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => setShowTemplateForm(p.id)} className="text-sm text-primary-600 hover:underline">+Template</button>
                  <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
