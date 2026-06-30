import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminService } from '../../services/admin.service'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [c, o] = await Promise.all([
          adminService.getCustomerDetail(id),
          adminService.getCustomerOrders(id),
        ])
        setCustomer(c)
        setOrders(o)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleBlockToggle = async () => {
    if (!customer) return
    const newStatus = customer.status === 'active' ? 'suspended' : 'active'
    if (!confirm(`Set this customer to "${newStatus}"?`)) return
    try {
      const updated = await adminService.updateCustomerStatus(id, newStatus)
      setCustomer((prev) => ({ ...prev, status: updated.status }))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!customer) return <p className="text-center py-12 text-gray-500">Customer not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/customers" className="text-sm text-primary-600 hover:underline">&larr; Back to Customers</Link>
      </div>

      {/* Customer Info */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-gray-500 mt-1">{customer.email} &middot; {customer.phone}</p>
            <p className="text-xs text-gray-400 mt-1">Registered: {formatDate(customer.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {customer.status}
            </span>
            <button
              onClick={handleBlockToggle}
              className={`px-4 py-2 rounded-md text-white text-sm ${
                customer.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {customer.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
            </button>
          </div>
        </div>
      </section>

      {/* Order History */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Order History ({orders.length})</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No orders yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${o.id}`} className="text-primary-600 hover:underline text-sm">
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{o.product_name}</td>
                    <td className="px-6 py-4 text-right">{o.quantity}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(o.total_amount)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={o.order_status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
