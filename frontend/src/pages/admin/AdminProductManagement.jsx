import { useState, useEffect } from 'react'
import { productService } from '../../services/product.service'
import { templateGroupService } from '../../services/template-group.service'
import { formatCurrency, NO_IMAGE_FALLBACK } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'
import { confirmDelete, success as swalSuccess } from '../../utils/swal'

export default function AdminProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [templateGroups, setTemplateGroups] = useState([])
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
  const [templateGroupId, setTemplateGroupId] = useState('')
  const [productImage, setProductImage] = useState(null)
  const [productImagePreview, setProductImagePreview] = useState('')

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
  const [maxUploadCount, setMaxUploadCount] = useState(1)
  const [templateImages, setTemplateImages] = useState([])
  const [templateImagePreviews, setTemplateImagePreviews] = useState([])
  const [uploadingTemplates, setUploadingTemplates] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, c, tg] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        templateGroupService.getGroups(),
      ])
      setProducts(p)
      setCategories(c)
      setTemplateGroups(tg)
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
    setTemplateGroupId('')
    setProductImage(null)
    setProductImagePreview('')
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
    if (templateGroupId) formData.append('template_group_id', templateGroupId)
    if (productImage) formData.append('image', productImage)
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct, formData)
      } else {
        await productService.createProduct(formData)
      }
      swalSuccess(editingProduct ? 'Product updated' : 'Product created')
      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleEditProduct = (p) => {
    setName(p.name)
    setDescription(p.description || '')
    setBasePrice(String(p.base_price))
    setProductType(p.product_type)
    setCustomizable(p.customizable)
    setCategoryId(p.category_id)
    setTemplateGroupId(p.template_group_id || '')
    setProductImage(null)
    setProductImagePreview(p.image_url || '')
    setEditingProduct(p.id)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id) => {
    const result = await confirmDelete('this product')
    if (!result.isConfirmed) return
    try {
      await productService.deleteProduct(id)
      swalSuccess('Product deleted')
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
      swalSuccess(editingCategory ? 'Category updated' : 'Category created')
      resetCategoryForm()
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category')
    }
  }

  const handleDeleteCategory = async (id) => {
    const result = await confirmDelete('this category')
    if (!result.isConfirmed) return
    try {
      await productService.deleteCategory(id)
      swalSuccess('Category deleted')
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
      toast.error(err.response?.data?.detail || 'Failed to save variant')
    }
  }

  const handleEditVariant = (v) => {
    setVariantName(v.name)
    setVariantPrice(String(v.price))
    setVariantStock(String(v.stock))
    setEditingVariant(v.id)
  }

  const handleDeleteVariant = async (id) => {
    const result = await confirmDelete('this variant')
    if (!result.isConfirmed) return
    try {
      await productService.deleteVariant(id)
      if (showVariantPanel) await loadVariants(showVariantPanel)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTemplate = async (productId) => {
    if (templateImages.length === 0) {
      toast.error('No files selected')
      return
    }
    const product = products.find(p => p.id === productId)
    const groupId = product?.template_group_id
    if (!groupId) {
      toast.error('Assign a Template Group to this product first')
      return
    }
    setUploadingTemplates(true)
    try {
      const result = await templateGroupService.createTemplatesBatch(groupId, templateImages, maxUploadCount)
      const created = result.total_created || result.templates?.length || 0
      const failed = result.total_failed || result.failed?.length || 0
      if (created > 0) {
        toast.success(`${created} template(s) created`)
      }
      if (failed > 0) {
        toast.error(`${failed} file(s) failed`)
      }
      setMaxUploadCount(1)
      setTemplateImages([])
      setTemplateImagePreviews([])
      setShowTemplateForm(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create templates')
    } finally {
      setUploadingTemplates(false)
    }
  }

  const handleTemplateImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    const validFiles = []
    const validPreviews = []
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Skipping ${file.name}: Only JPEG, PNG, WEBP allowed`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Skipping ${file.name}: Must be less than 5MB`)
        continue
      }
      if (validFiles.length + templateImages.length >= 100) {
        toast.error('Maximum 100 templates per batch')
        break
      }
      validFiles.push(file)
      validPreviews.push(URL.createObjectURL(file))
    }
    setTemplateImages((prev) => [...prev, ...validFiles])
    setTemplateImagePreviews((prev) => [...prev, ...validPreviews])
  }

  const removeTemplateImage = (index) => {
    setTemplateImages((prev) => prev.filter((_, i) => i !== index))
    setTemplateImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteTemplate = async (templateId) => {
    const result = await confirmDelete('this template')
    if (!result.isConfirmed) return
    try {
      await productService.deleteTemplate(templateId)
      swalSuccess('Template deleted')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleFeatured = async (id, current) => {
    try {
      await productService.toggleFeatured(id, !current)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleVisibility = async (id, current) => {
    try {
      await productService.toggleVisibility(id, !current)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const [editingTags, setEditingTags] = useState(null)
  const [tagsInput, setTagsInput] = useState('')

  const handleEditTags = (p) => {
    setEditingTags(p.id)
    setTagsInput((p.tags || []).join(', '))
  }

  const handleSaveTags = async () => {
    if (!editingTags) return
    try {
      const tagList = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      await productService.setTags(editingTags, tagList)
      setEditingTags(null)
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
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[500px]">
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
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-md animate-slide-up">
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
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tmpl Group</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Feat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <img src={p.image_url || NO_IMAGE_FALLBACK} alt={p.name}
                         className="w-12 h-12 rounded object-cover border"
                         onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK }} />
                  </td>
                  <td className="px-4 py-4">{p.name}</td>
                  <td className="px-4 py-4">{p.category?.name || '-'}</td>
                  <td className="px-4 py-4">{formatCurrency(p.base_price)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.customizable ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.customizable ? 'Custom' : p.product_type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{p.template_group_id ? 'Yes' : '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                            className={`text-lg ${p.is_featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                            title={p.is_featured ? 'Unmark featured' : 'Mark as featured'}>
                      ★
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => handleToggleVisibility(p.id, p.is_visible)}
                            className={`text-lg ${p.is_visible ? 'text-green-500' : 'text-red-400'}`}
                            title={p.is_visible ? 'Hide from store' : 'Show in store'}>
                      {p.is_visible ? '👁' : '🚫'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    {editingTags === p.id ? (
                      <div className="flex items-center gap-1">
                        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                               className="w-24 px-1 py-0.5 text-xs border rounded" placeholder="tag1, tag2" />
                        <button onClick={handleSaveTags} className="text-xs text-green-600 font-bold">✓</button>
                        <button onClick={() => setEditingTags(null)} className="text-xs text-red-600">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap max-w-[150px]">
                        {(p.tags || []).slice(0, 2).map((t, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                        {(p.tags || []).length > 2 && <span className="text-xs text-gray-400">+{p.tags.length - 2}</span>}
                        <button onClick={() => handleEditTags(p)} className="text-xs text-gray-400 hover:text-gray-600 ml-1">✎</button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleEditProduct(p)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      <button onClick={() => handleOpenVariants(p.id)} className="text-sm text-indigo-600 hover:underline">Var</button>
                      <button onClick={() => { setShowTemplateForm(p.id); setMaxUploadCount(1); setTemplateImages([]); setTemplateImagePreviews([]) }} className="text-sm text-purple-600 hover:underline">+Tmpl</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-sm text-red-600 hover:underline">Del</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                    {productImagePreview ? (
                      <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files[0]
                             if (file) {
                               if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
                               setProductImage(file)
                               setProductImagePreview(URL.createObjectURL(file))
                             }
                           }}
                           className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    {productImagePreview && (
                      <button type="button" onClick={() => { setProductImage(null); setProductImagePreview('') }}
                              className="mt-1 text-xs text-red-500 hover:underline">Remove</button>
                    )}
                  </div>
                </div>
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required className="w-full px-3 py-2 border rounded-md" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded-md" />
              <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} type="number" step="0.01" placeholder="Base Price" required className="w-full px-3 py-2 border rounded-md" />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full px-3 py-2 border rounded-md">
                <option value="">Select Category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select value={templateGroupId} onChange={(e) => setTemplateGroupId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option value="">No Template Group</option>
                {templateGroups.map((tg) => (<option key={tg.id} value={tg.id}>{tg.name}</option>))}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg animate-slide-up">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Upload Templates</h2>
            <p className="text-sm text-gray-500 mb-4">Each image becomes a separate Template record in this product's Template Group.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Customer Uploads per Template</label>
                <input
                  value={maxUploadCount}
                  onChange={(e) => setMaxUploadCount(Number(e.target.value))}
                  type="number" min="1" max="100"
                  className="w-32 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Images (JPEG/PNG/WEBP, max 5MB each, up to 100 files)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleTemplateImagesChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              {templateImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{templateImages.length} image(s) selected</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                    {templateImagePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img src={preview} alt={templateImages[i].name} className="w-full h-20 object-cover rounded" />
                        <button
                          onClick={() => removeTemplateImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          &times;
                        </button>
                        <p className="text-[10px] text-gray-500 truncate" title={templateImages[i].name}>{templateImages[i].name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => handleCreateTemplate(showTemplateForm)}
                  disabled={templateImages.length === 0 || uploadingTemplates}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm"
                >
                  {uploadingTemplates ? 'Uploading...' : `Upload ${templateImages.length} Template(s)`}
                </button>
                <button
                  onClick={() => { setShowTemplateForm(null); setMaxUploadCount(1); setTemplateImages([]); setTemplateImagePreviews([]) }}
                  className="bg-gray-300 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
