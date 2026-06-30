import { useState, useEffect } from 'react'
import { reviewService } from '../../services/review.service'
import { formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'
import { confirmDelete, success as swalSuccess, error as swalError } from '../../utils/swal'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async (filters = {}, pageNum = 1) => {
    setLoading(true)
    try {
      const data = await reviewService.getAdminAll({ ...filters, page: pageNum, per_page: 20 })
      setReviews(data.items || [])
      setTotalPages(data.total_pages || 1)
      setTotal(data.total || 0)
      setPage(data.page || 1)
    } catch {
      toast.error('Failed to load reviews')
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
    if (ratingFilter) filters.rating = parseInt(ratingFilter)
    if (sort) filters.sort = sort
    load(filters, 1)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    const filters = {}
    if (search) filters.search = search
    if (statusFilter) filters.status = statusFilter
    if (ratingFilter) filters.rating = parseInt(ratingFilter)
    if (sort) filters.sort = sort
    load(filters, newPage)
  }

  const handleToggleVisibility = async (id) => {
    try {
      const updated = await reviewService.toggleVisibility(id)
      toast.success(`Review ${updated.status === 'visible' ? 'shown' : 'hidden'}`)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update review')
    }
  }

  const handleDelete = async (id) => {
    const result = await confirmDelete('this review')
    if (!result.isConfirmed) return
    try {
      await reviewService.delete(id)
      swalSuccess('Review deleted')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete review')
    }
  }

  if (loading && reviews.length === 0) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Review Management</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or review text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Status</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating_desc">Highest Rating</option>
          <option value="rating_asc">Lowest Rating</option>
        </select>
        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
          Filter
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No reviews found.</td></tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.product_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.customer_name || r.customer_email || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center text-yellow-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{r.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 line-clamp-2">{r.review}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.status === 'visible' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(r.id)}
                        className={`text-sm ${r.status === 'visible' ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                      >
                        {r.status === 'visible' ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
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
            <span className="text-sm text-gray-500">{total} total reviews</span>
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
