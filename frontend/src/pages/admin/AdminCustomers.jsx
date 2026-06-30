import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin.service'
import { formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async (filters = {}, pageNum = 1) => {
    setLoading(true)
    try {
      const data = await adminService.getCustomersPaginated(filters, pageNum, 20)
      if (data.items) {
        setCustomers(data.items)
        setTotalPages(data.total_pages)
        setTotal(data.total)
        setPage(data.page)
      } else {
        setCustomers(data)
        setTotalPages(1)
        setTotal(data.length)
        setPage(1)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    const filters = {}
    if (search) filters.search = search
    if (statusFilter) filters.status = statusFilter
    load(filters, 1)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    const filters = {}
    if (search) filters.search = search
    if (statusFilter) filters.status = statusFilter
    load(filters, newPage)
  }

  const handleBlockToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    if (!confirm(`Set this customer to "${newStatus}"?`)) return
    try {
      await adminService.updateCustomerStatus(id, newStatus)
      toast.success(`Customer ${newStatus === 'suspended' ? 'blocked' : 'unblocked'}`)
      const filters = {}
      if (search) filters.search = search
      if (statusFilter) filters.status = statusFilter
      load(filters, page)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update customer')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
          Search
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">
                    <Link to={`/admin/customers/${c.id}`} className="text-primary-600 hover:underline font-medium">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(c.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link to={`/admin/customers/${c.id}`} className="text-sm text-primary-600 hover:underline">View</Link>
                      <button
                        onClick={() => handleBlockToggle(c.id, c.status)}
                        className={`text-sm ${c.status === 'active' ? 'text-red-600' : 'text-green-600'} hover:underline`}
                      >
                        {c.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">{total} total customers</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 bg-white hover:bg-gray-100"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 bg-white hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
