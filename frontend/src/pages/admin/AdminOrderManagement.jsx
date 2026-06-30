import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { adminService } from '../../services/admin.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from '../../store/toast.store'
import { confirmPayment, confirmStatusChange, success as swalSuccess, error as swalError, loading as swalLoading, close as swalClose } from '../../utils/swal'
import Swal from 'sweetalert2'

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-24 flex-1" />
          <div className="h-4 bg-gray-200 rounded w-20 flex-1" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-4">📦</div>
      <p className="text-lg">{message}</p>
    </div>
  )
}

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const buildFilters = () => {
    const f = {}
    if (statusFilter) f.status = statusFilter
    if (search) f.search = search
    if (paymentStatus) f.payment_status = paymentStatus
    if (startDate) f.start_date = startDate
    if (endDate) f.end_date = endDate
    if (minAmount) f.min_amount = minAmount
    if (maxAmount) f.max_amount = maxAmount
    return f
  }

  const loadOrders = async (filters) => {
    setLoading(true)
    try {
      const data = await orderService.getOrders(filters || buildFilters())
      setOrders(data)
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders(buildFilters()) }, [statusFilter, paymentStatus])

  const handleVerify = async (orderId, action) => {
    const result = await confirmPayment(action)
    if (!result.isConfirmed) return
    swalLoading(action === 'verified' ? 'Approving...' : 'Rejecting...')
    try {
      const { default: api } = await import('../../services/api')
      await api.post(`/payments/verify/${orderId}`, { status: action, remarks: '' })
      swalClose()
      swalSuccess(action === 'verified' ? 'Payment approved' : 'Payment rejected')
      loadOrders()
    } catch (err) {
      swalClose()
      swalError('Operation Failed', err.response?.data?.detail || 'Failed to verify payment')
    }
  }

  const handleStatusUpdate = async (orderId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Update Order Status',
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select id="swal-status" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Select Status</option>
              <option value="payment_verified">Payment Verified</option>
              <option value="designing">Designing</option>
              <option value="approval_pending">Approval Pending</option>
              <option value="approved">Approved</option>
              <option value="printing">Printing</option>
              <option value="packing">Packing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea id="swal-remarks" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows="3" placeholder="Add any notes..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        const status = document.getElementById('swal-status').value
        const remarks = document.getElementById('swal-remarks').value
        if (!status) {
          Swal.showValidationMessage('Please select a status')
          return false
        }
        return { status, remarks }
      },
    })

    if (!formValues) return

    const confirmed = await confirmStatusChange(getStatusLabel(formValues.status))
    if (!confirmed.isConfirmed) return

    swalLoading('Updating status...')
    try {
      const { default: api } = await import('../../services/api')
      await api.put(`/orders/${orderId}/status`, { status: formValues.status, remarks: formValues.remarks || undefined })
      swalClose()
      swalSuccess('Order status updated')
      loadOrders()
    } catch (err) {
      swalClose()
      swalError('Operation Failed', err.response?.data?.detail || 'Failed to update status')
    }
  }

  const viewOrder = async (orderId) => {
    try {
      const order = await orderService.getOrder(orderId)
      const history = await orderService.getStatusHistory(orderId)
      setSelectedOrder({ ...order, history })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <div className="mb-6 space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); loadOrders(buildFilters()) }} className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search by ID, customer name, email..."
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md" />
          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">Search</button>
        </form>
        <div className="flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-md">
            <option value="">All Statuses</option>
            <option value="payment_pending_verification">Pending Verification</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="designing">Designing</option>
            <option value="approval_pending">Approval Pending</option>
            <option value="approved">Approved</option>
            <option value="printing">Printing</option>
            <option value="packing">Packing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="px-4 py-2 border rounded-md">
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                 className="px-3 py-2 border rounded-md" title="Start Date" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                 className="px-3 py-2 border rounded-md" title="End Date" />
          <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}
                 className="w-24 px-3 py-2 border rounded-md" />
          <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}
                 className="w-24 px-3 py-2 border rounded-md" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md"><TableSkeleton /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md"><EmptyState message="No orders found matching your filters." /></div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[768px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">#{o.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{o.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4">{o.product_name || 'N/A'}</td>
                  <td className="px-6 py-4">{formatCurrency(o.total_amount)}</td>
                  <td className="px-6 py-4"><OrderStatusBadge status={o.order_status} /></td>
                  <td className="px-6 py-4 text-sm">{formatDate(o.created_at)}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => viewOrder(o.id)} className="text-sm text-primary-600 hover:underline">View</button>
                    <Link to={`/admin/orders/${o.id}`} className="text-sm text-indigo-600 hover:underline">Workspace</Link>
                    {o.order_status === 'payment_pending_verification' && (
                      <button onClick={() => handleVerify(o.id, 'verified')} className="text-sm text-green-600 hover:underline">Verify</button>
                    )}
                    {o.order_status !== 'delivered' && o.order_status !== 'cancelled' && (
                      <button onClick={() => handleStatusUpdate(o.id)} className="text-sm text-blue-600 hover:underline">Update</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Order #{selectedOrder.id?.slice(0, 8)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <p><strong>Amount:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
              <p><strong>Status:</strong> <OrderStatusBadge status={selectedOrder.order_status} /></p>
              <p><strong>Payment:</strong> {selectedOrder.payment_status}</p>
              <p><strong>Type:</strong> {selectedOrder.is_customized ? 'Customized' : 'Ready-Made'}</p>
              {selectedOrder.customization_notes && <p><strong>Notes:</strong> {selectedOrder.customization_notes}</p>}
              {selectedOrder.delivery_address && (
                <div>
                  <p className="font-medium">Delivery Address:</p>
                  <p>{selectedOrder.delivery_address.recipient_name}</p>
                  <p>{selectedOrder.delivery_address.address_line}</p>
                  <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.postal_code}</p>
                </div>
              )}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Status History:</p>
                  <div className="space-y-2">
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        <span className="font-medium">{getStatusLabel(h.new_status)}</span>
                        <span className="text-gray-500">{formatDate(h.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
