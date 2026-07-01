import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import SearchComponent from '../../components/common/SearchComponent'

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''

  useEffect(() => {
    productService.getCategories()
      .then(data => setCategories(data.filter(c => c.status === 'active')))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const productsData = await productService.getProducts(categoryId || undefined, undefined, search || undefined, undefined, true)
        setProducts(productsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, categoryId])

  const handleCategoryFilter = (catId) => {
    const params = {}
    if (search) params.search = search
    if (catId) params.category = catId
    setSearchParams(params)
  }

  const handleSearch = (searchValue) => {
    const params = {}
    if (searchValue) params.search = searchValue
    if (categoryId) params.category = categoryId
    setSearchParams(params)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="mb-6">
        <SearchComponent
          value={search}
          onSearch={(val) => {
            const params = {}
            if (val) params.search = val
            if (categoryId) params.category = categoryId
            setSearchParams(params)
          }}
          placeholder="Search products..."
          className="max-w-md mx-auto"
        />
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !categoryId ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                categoryId === cat.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}