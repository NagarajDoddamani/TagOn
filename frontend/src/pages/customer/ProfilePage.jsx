import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { reviewService } from '../../services/review.service'
import { orderService } from '../../services/order.service'
import { formatDate } from '../../utils/helpers'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'

const SECTIONS = [
  { key: 'profile', label: 'Profile Information' },
  { key: 'orders', label: 'My Orders' },
  { key: 'tracking', label: 'Order Tracking' },
  { key: 'reviews', label: 'My Reviews' },
  { key: 'settings', label: 'Settings' },
]

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('profile')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reviewService.getProfileStats()
        setStats(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xl font-bold text-primary-600">{stats.total_orders}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xl font-bold text-yellow-600">{stats.active_orders}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xl font-bold text-green-600">{stats.delivered_orders}</div>
                  <div className="text-xs text-gray-500">Delivered</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xl font-bold text-red-600">{stats.cancelled_orders}</div>
                  <div className="text-xs text-gray-500">Cancelled</div>
                </div>
              </div>
            )}
          </div>

          <nav className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${
                  activeSection === s.key
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'profile' && <ProfileInfoSection user={user} stats={stats} />}
          {activeSection === 'orders' && <MyOrdersSection />}
          {activeSection === 'tracking' && <OrderTrackingSection />}
          {activeSection === 'reviews' && <MyReviewsSection />}
          {activeSection === 'settings' && <SettingsPlaceholder />}
        </div>
      </div>
    </div>
  )
}

function ProfileInfoSection({ user, stats }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Profile Information</h2>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Name</span>
          <span className="font-medium">{user?.name}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Email</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium">{user?.phone}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Joined</span>
          <span className="font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}

function MyOrdersSection() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getOrders()
        setOrders(data)
      } catch {
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmitReview = async () => {
    if (!reviewTitle.trim() || !reviewText.trim()) {
      toast.error('Please fill in title and review')
      return
    }
    setSubmitting(true)
    try {
      await reviewService.create(reviewModal.id, reviewRating, reviewTitle, reviewText)
      toast.success('Review submitted successfully!')
      setReviewModal(null)
      setReviewRating(5)
      setReviewTitle('')
      setReviewText('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">No orders yet.</p>
          <Link to="/products" className="text-primary-600 hover:underline font-medium">
            Browse Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <Link to={`/orders/${order.id}`} className="font-medium text-primary-600 hover:underline">
                  {order.product_name || 'Product'}
                </Link>
                <div className="text-sm text-gray-500 mt-1">#{order.id.slice(0, 8)}</div>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.order_status} />
                {order.order_status === 'delivered' && (
                  <button
                    onClick={() => setReviewModal(order)}
                    className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                  >
                    Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
            <p className="text-sm text-gray-500 mb-4">{reviewModal.product_name || 'Product'}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Great product!"
                maxLength={200}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Share your experience with this product..."
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setReviewModal(null); setReviewRating(5); setReviewTitle(''); setReviewText('') }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderTrackingSection() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getOrders()
        setOrders(data.filter((o) => !['delivered', 'cancelled', 'archived'].includes(o.order_status)))
      } catch {
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Order Tracking</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No active orders to track.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <span className="font-medium">{order.product_name || 'Product'}</span>
                <span className="text-sm text-gray-500 ml-2">#{order.id.slice(0, 8)}</span>
              </div>
              <OrderStatusBadge status={order.order_status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function MyReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reviewService.getMyReviews()
        setReviews(data)
      } catch {
        toast.error('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">My Reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">No reviews yet.</p>
          <p className="text-sm text-gray-400">Write a review for delivered orders to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{r.product_name || 'Product'}</span>
                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
              </div>
              <div className="flex text-yellow-400 mb-2">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <h4 className="font-semibold">{r.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{r.review}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                r.status === 'visible' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {r.status === 'visible' ? 'Visible' : 'Hidden'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsPlaceholder() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p className="text-gray-500">Account settings will be available here in a future update.</p>
    </div>
  )
}
