import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin.service'
import type { DashboardStats } from '../../types'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getDashboard()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return <p>Failed to load dashboard</p>

  const cards = [
    { label: 'Total Orders', value: stats.total_orders, color: 'bg-blue-500' },
    { label: 'Pending Payments', value: stats.pending_payments, color: 'bg-yellow-500' },
    { label: 'Active Orders', value: stats.active_orders, color: 'bg-purple-500' },
    { label: 'Completed Orders', value: stats.completed_orders, color: 'bg-green-500' },
    { label: 'Total Products', value: stats.total_products, color: 'bg-indigo-500' },
    { label: 'Customers', value: stats.customer_count, color: 'bg-teal-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-md p-6">
            <div className={`inline-block w-3 h-3 rounded-full ${card.color} mr-2`}></div>
            <span className="text-gray-600">{card.label}</span>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
          <h3 className="font-semibold text-lg">Order Management</h3>
          <p className="text-gray-600 mt-2">View and manage all orders</p>
        </Link>
        <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
          <h3 className="font-semibold text-lg">Product Management</h3>
          <p className="text-gray-600 mt-2">Manage products, categories, and templates</p>
        </Link>
      </div>
    </div>
  )
}
