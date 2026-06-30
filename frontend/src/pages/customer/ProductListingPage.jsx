import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import SearchComponent from '../../components/common/SearchComponent'

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const productsData = await productService.getProducts(undefined, undefined, search || undefined, undefined, true)
        setProducts(productsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search])

  const handleSearch = (searchValue) => {
    if (searchValue) {
      setSearchParams({ search: searchValue })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="mb-6">
        <SearchComponent
          value={search}
          onSearch={handleSearch}
          placeholder="Search products..."
          className="max-w-md mx-auto"
        />
      </div>

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