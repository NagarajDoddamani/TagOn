import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(undefined, undefined, undefined, true, true),
          productService.getCategories(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err) {
        console.error('Failed to load data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to TagOn</h1>
        <p className="mt-4 text-lg text-gray-600">
          Personalized gifts crafted with love. Browse our collection and create something unique.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
        >
          Browse Products
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white px-4 py-2 rounded-full shadow-sm border hover:border-primary-500"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
