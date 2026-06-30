import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { productService } from '../../services/product.service'
import { orderService } from '../../services/order.service'
import { reviewService } from '../../services/review.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import ProductCard from '../../components/common/ProductCard'
import SearchComponent from '../../components/common/SearchComponent'
import { formatCurrency, formatDate } from '../../utils/helpers'

const steps = [
  { title: 'Browse Products', description: 'Explore our collection of customizable and ready-made gifts.', icon: '🔍' },
  { title: 'Customize Your Gift', description: 'Choose templates, upload images, and add personal touches.', icon: '🎨' },
  { title: 'Place Order', description: 'Complete payment and we will start crafting your gift.', icon: '📦' },
  { title: 'Get It Delivered', description: 'We create and deliver your personalized gift to your door.', icon: '🚚' },
]

const ACTIVE_STATUSES = ['payment_pending_verification', 'payment_verified', 'designing', 'approval_pending', 'approved', 'printing', 'packing', 'shipped']

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)

  const search = searchParams.get('search') || ''

  useEffect(() => {
    const load = async () => {
      try {
        const productsData = await productService.getProducts(undefined, undefined, search || undefined, undefined, true)
        setFeaturedProducts(productsData)
      } catch {
        // silently fail - landing page still renders
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') return
    const loadOrders = async () => {
      setOrdersLoading(true)
      try {
        const data = await orderService.getOrders()
        const active = data.filter(o => ACTIVE_STATUSES.includes(o.order_status))
        setActiveOrders(active.slice(0, 3))
      } catch {
        // silently fail
      } finally {
        setOrdersLoading(false)
      }
    }
    loadOrders()
  }, [isAuthenticated, user])

  const isCustomer = isAuthenticated && user?.role === 'customer'

  const handleSearch = (searchValue) => {
    setSearchParams({ search: searchValue })
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl overflow-hidden mb-12">
        <div className="max-w-4xl mx-auto text-center py-20 px-6">
          <h1 className="text-5xl font-bold mb-4">Personalized Gifts, Crafted with Love</h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Create unique, personalized gifts that leave a lasting impression.
            Choose from our collection and add your personal touch.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/products"
              className="inline-block bg-white text-primary-700 px-8 py-3 rounded-md font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Products
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-primary-700 transition-colors"
              >
                Get Started
              </Link>
            )}
            {isCustomer && (
              <Link
                to="/orders"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-primary-700 transition-colors"
              >
                My Orders
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="mb-12">
        <div className="max-w-3xl mx-auto">
          <SearchComponent
            value={search}
            onSearch={handleSearch}
            placeholder="Search products by name, description, or tags..."
            className="w-full"
          />
        </div>
      </section>

      {/* Continue Your Orders - for returning customers */}
      {isCustomer && !ordersLoading && activeOrders.length > 0 && (
        <section className="mb-12 bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Continue Your Orders</h2>
            <Link to="/orders" className="text-primary-600 hover:underline text-sm font-medium">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg">{order.product_name || 'Product'}</span>
                  <span className="text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                  <OrderStatusBadge status={order.order_status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-colors text-gray-700 font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:underline font-medium">
            View All &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse h-72" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg mb-2">No products available yet.</p>
            <p className="text-gray-400 text-sm">Check back soon for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mb-12 bg-white rounded-2xl p-10 shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-10">How TagOn Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        <ReviewList />
      </section>

      {/* Contact / CTA */}
      <section className="bg-gray-800 text-white rounded-2xl p-10 text-center mb-6">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Something Special?</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Browse our products and start customizing your perfect gift today.
        </p>
        <Link
          to="/products"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
        >
          Explore Products
        </Link>
      </section>
    </div>
  )
}

function ReviewList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reviewService.getLatest(5)
        setReviews(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <p className="text-gray-400">No reviews yet. Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {reviews.slice(0, 3).map((r) => (
        <div key={r.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex text-yellow-400 mb-3">
            {Array.from({ length: r.rating }).map((_, j) => (
              <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-600 mb-3">&ldquo;{r.review}&rdquo;</p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">- {r.customer_name || 'Customer'}</p>
            {r.verified_purchase && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified Purchase
              </span>
            )}
          </div>
          {r.product_name && (
            <p className="text-xs text-gray-400 mt-2">on {r.product_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
        </div>
      ))}
    </div>
  )
}