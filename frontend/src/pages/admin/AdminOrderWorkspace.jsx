import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'
import { toast } from '../../store/toast.store'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AdminChatWindow from '../../components/admin/AdminChatWindow'
import AdminDesignManager from '../../components/admin/AdminDesignManager'
import OrderTimeline from '../../components/customer/OrderTimeline'
import { confirmPayment, confirmStatusChange, success as swalSuccess, error as swalError, loading as swalLoading, close as swalClose, inputWithConfirm } from '../../utils/swal'
import Swal from 'sweetalert2'

export default function AdminOrderWorkspace() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadOrder()
  }, [id])

  async function loadOrder() {
    try {
      const [orderData, historyData] = await Promise.all([
        orderService.getOrder(id),
        orderService.getStatusHistory(id),
      ])
      setOrder(orderData)
      setHistory(historyData)
      try {
        const paymentData = await paymentService.getPayment(id)
        setPayment(paymentData)
      } catch {}
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  async function handleVerify(action) {
    const result = await confirmPayment(action)
    if (!result.isConfirmed) return
    swalLoading(action === 'verified' ? 'Approving...' : 'Rejecting...')
    try {
      const { default: api } = await import('../../services/api')
      await api.post(`/payments/verify/${id}`, { status: action, remarks: '' })
      swalClose()
      swalSuccess(action === 'verified' ? 'Payment approved' : 'Payment rejected')
      loadOrder()
    } catch (err) {
      swalClose()
      swalError('Operation Failed', err.response?.data?.detail || 'Failed to verify payment')
    }
  }

  async function handleStatusUpdate() {
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
      customClass: { popup: 'swal2-popup-custom' },
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
      await api.put(`/orders/${id}/status`, { status: formValues.status, remarks: formValues.remarks || undefined })
      swalClose()
      swalSuccess('Order status updated')
      loadOrder()
    } catch (err) {
      swalClose()
      swalError('Operation Failed', err.response?.data?.detail || 'Failed to update status')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <p className="text-center py-12">Order not found</p>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/orders" className="text-blue-500 hover:underline text-sm">&larr; Back to Orders</Link>
        <h1 className="text-3xl font-bold">Order Workspace #{order.id.slice(0, 8)}</h1>
        <OrderStatusBadge status={order.order_status} />
      </div>

      {/* Admin action buttons */}
      <div className="flex gap-3 mb-6">
        {order.order_status === 'payment_pending_verification' && (
          <button onClick={() => handleVerify('verified')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
            Verify Payment
          </button>
        )}
        {order.order_status === 'payment_pending_verification' && (
          <button onClick={() => handleVerify('rejected')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
            Reject Payment
          </button>
        )}
        {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && order.order_status !== 'archived' && (
          <button onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            Update Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Details, Payment, Design */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <OrderStatusBadge status={order.order_status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span>{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span>{order.is_customized ? 'Customized' : 'Ready-Made'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="space-y-2">
                <p><strong>{order.delivery_address.recipient_name}</strong></p>
                <p>{order.delivery_address.address_line}</p>
                <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.postal_code}</p>
                <p>Phone: {order.delivery_address.mobile}</p>
                {order.delivery_address.landmark && <p>Landmark: {order.delivery_address.landmark}</p>}
              </div>
            </div>
          </div>

          {order.customization_notes && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Customization Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{order.customization_notes}</p>
            </div>
          )}

          {order.uploaded_images && order.uploaded_images.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Customer Uploaded Images</h2>
              <div className="flex flex-wrap gap-4">
                {order.uploaded_images.map((url, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <img src={url} alt={`Upload ${i}`} loading="lazy" className="w-32 h-32 object-cover rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                    <a
                      href={url}
                      download={`customer-upload-${i + 1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payment && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Status</span>
                  <span className={`font-medium ${payment.verification_status === 'verified' ? 'text-green-600' : payment.verification_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {payment.verification_status}
                  </span>
                </div>
                {payment.transaction_id && <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>}
                {payment.screenshot_url && (
                  <div>
                    <p className="font-medium mb-2">Payment Screenshot:</p>
                    <img src={payment.screenshot_url} alt="Payment Screenshot" loading="lazy" className="max-w-xs rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
          )}

          <AdminDesignManager
            orderId={order.id}
            isCustomized={order.is_customized}
            orderStatus={order.order_status}
            onStatusChange={loadOrder}
          />
        </div>

        {/* Right column - Chat + Timeline */}
        <div className="space-y-6">
          <AdminChatWindow orderId={order.id} />
          <OrderTimeline orderId={order.id} />
        </div>
      </div>
    </div>
  )
}
