import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin.service'
import { formatCurrency, formatDate } from '../../utils/helpers'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { toast } from '../../store/toast.store'

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-lg" />)}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const d = await adminService.getDashboard()
        setData(d)
      } catch (err) {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data) return <p className="text-center text-gray-400 py-12">Failed to load dashboard</p>

  const statusCards = [
    { label: 'Total Orders', value: data.total_orders, color: 'bg-blue-500' },
    { label: 'Pending Payments', value: data.pending_payments, color: 'bg-yellow-500' },
    { label: 'Designing', value: data.designing, color: 'bg-purple-500' },
    { label: 'Awaiting Approval', value: data.approval_pending, color: 'bg-orange-500' },
    { label: 'Printing', value: data.printing, color: 'bg-indigo-500' },
    { label: 'Shipped', value: data.shipped, color: 'bg-cyan-500' },
    { label: 'Delivered', value: data.delivered, color: 'bg-green-500' },
    { label: 'Cancelled', value: data.cancelled, color: 'bg-red-500' },
  ]

  const revenueCards = [
    { label: 'Revenue Today', value: data.revenue_daily, color: 'bg-emerald-500' },
    { label: 'Revenue This Month', value: data.revenue_monthly, color: 'bg-emerald-600' },
    { label: 'Revenue This Year', value: data.revenue_yearly, color: 'bg-emerald-700' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <div className="text-sm text-gray-500">
          {data.active_customers} active customers &middot; {data.new_customers_this_month} new this month
        </div>
      </div>

      {/* Revenue */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {revenueCards.map((c) => (
            <div key={c.label} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <span className="text-gray-600 text-sm">{c.label}</span>
              <p className="text-2xl font-bold mt-1">{formatCurrency(c.value)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order Status Breakdown */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {statusCards.map((c) => (
            <div key={c.label} className="bg-white rounded-lg shadow-sm p-4 border-t-4" style={{ borderTopColor: c.color.replace('bg-', '').replace('500', '').trim() }}>
              <span className="text-gray-600 text-sm">{c.label}</span>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {data.top_products?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.top_products.map((p, i) => (
                    <tr key={p.product_id} className={i === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3">
                        <span className="font-medium">{p.product_name}</span>
                        {i === 0 && <span className="ml-2 text-xs text-yellow-600">#1</span>}
                      </td>
                      <td className="px-4 py-3 text-right">{p.total_sold}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-400">No product sales data yet.</p>
            )}
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[400px] overflow-y-auto">
            {data.recent_orders?.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {data.recent_orders.map((o) => (
                  <Link key={o.id} to={`/admin/orders/${o.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-medium">#{o.order_id_short}</p>
                      <p className="text-xs text-gray-500">{o.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(o.total_amount)}</p>
                      <OrderStatusBadge status={o.order_status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-gray-400">No orders yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[300px] overflow-y-auto">
          {data.recent_activity?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.recent_activity.map((a) => (
                <div key={a.id} className="px-4 py-2.5 text-sm flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">{a.user_name}</span>
                    <span className="text-gray-500"> {a.details || a.action}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-center text-gray-400">No activity yet.</p>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/orders" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
          <h3 className="font-semibold">Order Management</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage all orders</p>
        </Link>
        <Link to="/admin/products" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
          <h3 className="font-semibold">Product Management</h3>
          <p className="text-sm text-gray-600 mt-1">Manage products, categories, and templates</p>
        </Link>
        <Link to="/admin/customers" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
          <h3 className="font-semibold">Customers</h3>
          <p className="text-sm text-gray-600 mt-1">View customer profiles and history</p>
        </Link>
      </div>
    </div>
  )
}
