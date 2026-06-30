import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (filter) params.status = filter
        const data = await orderService.getOrders(params)
        setOrders(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
          aria-label="Filter orders by status"
        >
          <option value="">All Orders</option>
          <option value="payment_pending_verification">Pending Verification</option>
          <option value="payment_verified">Payment Verified</option>
          <option value="designing">Designing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-5xl mb-4 text-gray-300">📦</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">
            {filter ? 'No orders match this filter.' : 'You have not placed any orders yet. Browse our products and place your first order!'}
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {order.product_name || 'Product'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                  <OrderStatusBadge status={order.order_status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
