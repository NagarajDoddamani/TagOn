import { useState, useEffect } from 'react'
import { productService } from '../../services/product.service'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [productType, setProductType] = useState('customized')
  const [customizable, setCustomizable] = useState(false)
  const [categoryId, setCategoryId] = useState('')

  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')

  const [showVariantPanel, setShowVariantPanel] = useState(null)
  const [variants, setVariants] = useState([])
  const [variantName, setVariantName] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [variantStock, setVariantStock] = useState('0')
  const [editingVariant, setEditingVariant] = useState(null)

  const [showTemplateForm, setShowTemplateForm] = useState(null)
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

  const handleCreateProduct = async (e) => {
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
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleEditProduct = (p) => {
    setName(p.name)
    setDescription(p.description || '')
    setBasePrice(String(p.base_price))
    setProductType(p.product_type)
    setCustomizable(p.customizable)
    setCategoryId(p.category_id)
    setEditingProduct(p.id)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productService.deleteProduct(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const resetCategoryForm = () => {
    setCatName('')
    setCatDesc('')
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const handleOpenCategoryForm = (cat) => {
    if (cat) {
      setCatName(cat.name)
      setCatDesc(cat.description || '')
      setEditingCategory(cat.id)
    } else {
      setCatName('')
      setCatDesc('')
      setEditingCategory(null)
    }
    setShowCategoryForm(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory, catName, catDesc || undefined)
      } else {
        await productService.createCategory(catName, catDesc || undefined)
      }
      resetCategoryForm()
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save category')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category? Products in this category may break.')) return
    try {
      await productService.deleteCategory(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const loadVariants = async (productId) => {
    try {
      const data = await productService.getVariants(productId)
      setVariants(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenVariants = async (productId) => {
    setShowVariantPanel(productId)
    setVariantName('')
    setVariantPrice('')
    setVariantStock('0')
    setEditingVariant(null)
    await loadVariants(productId)
  }

  const handleSaveVariant = async (e) => {
    e.preventDefault()
    if (!showVariantPanel) return
    try {
      if (editingVariant) {
        await productService.updateVariant(editingVariant, {
          name: variantName,
          price: Number(variantPrice),
          stock: Number(variantStock),
        })
      } else {
        await productService.createVariant(showVariantPanel, {
          name: variantName,
          price: Number(variantPrice),
          stock: Number(variantStock),
        })
      }
      setVariantName('')
      setVariantPrice('')
      setVariantStock('0')
      setEditingVariant(null)
      await loadVariants(showVariantPanel)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save variant')
    }
  }

  const handleEditVariant = (v) => {
    setVariantName(v.name)
    setVariantPrice(String(v.price))
    setVariantStock(String(v.stock))
    setEditingVariant(v.id)
  }

  const handleDeleteVariant = async (id) => {
    if (!confirm('Delete this variant?')) return
    try {
      await productService.deleteVariant(id)
      if (showVariantPanel) await loadVariants(showVariantPanel)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTemplate = async (productId) => {
    try {
      const formData = new FormData()
      formData.append('name', templateName)
      formData.append('max_upload_count', String(maxUploadCount))
      await productService.createTemplate(productId, formData)
      setTemplateName('')
      setMaxUploadCount(1)
      setShowTemplateForm(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create template')
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Delete this template?')) return
    try {
      await productService.deleteTemplate(templateId)
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
        {activeTab === 'products' && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">New Product</button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-md ${activeTab === 'products' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>Products</button>
        <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-md ${activeTab === 'categories' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>Categories</button>
      </div>

      {/* ---- Category Tab ---- */}
      {activeTab === 'categories' && (
        <div>
          <div className="mb-4">
            <button onClick={() => handleOpenCategoryForm()} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">New Category</button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500">{c.description || '-'}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">{c.status}</span></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => handleOpenCategoryForm(c)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Category Form Modal ---- */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name" required className="w-full px-3 py-2 border rounded-md" />
              <input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 border rounded-md" />
              <div className="flex gap-3">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">{editingCategory ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetCategoryForm} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Product Tab ---- */}
      {activeTab === 'products' && (
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleEditProduct(p)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      <button onClick={() => handleOpenVariants(p.id)} className="text-sm text-indigo-600 hover:underline">Variants</button>
                      <button onClick={() => { setShowTemplateForm(p.id); setTemplateName(''); setMaxUploadCount(1) }} className="text-sm text-purple-600 hover:underline">+Template</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Product Form Modal ---- */}
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

      {/* ---- Variant Panel ---- */}
      {showVariantPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Variants</h2>
              <button onClick={() => setShowVariantPanel(null)} className="text-gray-500 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSaveVariant} className="flex gap-2 mb-4">
              <input value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="Name" required className="flex-1 px-3 py-2 border rounded-md" />
              <input value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} type="number" step="0.01" placeholder="Price" required className="w-24 px-3 py-2 border rounded-md" />
              <input value={variantStock} onChange={(e) => setVariantStock(e.target.value)} type="number" placeholder="Stock" className="w-20 px-3 py-2 border rounded-md" />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">{editingVariant ? 'Update' : 'Add'}</button>
              {editingVariant && <button type="button" onClick={() => { setEditingVariant(null); setVariantName(''); setVariantPrice(''); setVariantStock('0') }} className="bg-gray-300 px-3 py-2 rounded-md">Cancel</button>}
            </form>
            <table className="w-full">
              <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-2">{v.name}</td>
                    <td className="px-4 py-2">{formatCurrency(v.price)}</td>
                    <td className="px-4 py-2">{v.stock}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEditVariant(v)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteVariant(v.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Template Form Modal ---- */}
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
    </div>
  )
}
