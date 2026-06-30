import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AdminChatWindow from '../../components/admin/AdminChatWindow'
import AdminDesignManager from '../../components/admin/AdminDesignManager'
import OrderTimeline from '../../components/customer/OrderTimeline'

export default function AdminOrderWorkspace() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusModal, setStatusModal] = useState(false)
  const [verifyModal, setVerifyModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [updating, setUpdating] = useState(false)
  const [verifyAction, setVerifyAction] = useState('verified')

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

  async function handleVerify() {
    if (!id) return
    setUpdating(true)
    try {
      const { default: api } = await import('../../services/api')
      await api.post(`/payments/verify/${id}`, { status: verifyAction, remarks })
      setVerifyModal(false)
      setRemarks('')
      loadOrder()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to verify payment')
    } finally { setUpdating(false) }
  }

  async function handleStatusUpdate() {
    if (!id || !newStatus) return
    setUpdating(true)
    try {
      const { default: api } = await import('../../services/api')
      await api.put(`/orders/${id}/status`, { status: newStatus, remarks })
      setStatusModal(false)
      setRemarks('')
      setNewStatus('')
      loadOrder()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status')
    } finally { setUpdating(false) }
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
          <button onClick={() => { setVerifyModal(true); setVerifyAction('verified') }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
            Verify Payment
          </button>
        )}
        {order.order_status === 'payment_pending_verification' && (
          <button onClick={() => { setVerifyModal(true); setVerifyAction('rejected') }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
            Reject Payment
          </button>
        )}
        {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && order.order_status !== 'archived' && (
          <button onClick={() => setStatusModal(true)}
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
              <div className="flex flex-wrap gap-3">
                {order.uploaded_images.map((url, i) => (
                  <img key={i} src={url} alt={`Upload ${i}`} className="w-32 h-32 object-cover rounded" />
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
                    <img src={payment.screenshot_url} alt="Payment Screenshot" className="max-w-xs rounded" />
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

      {/* Verify Payment Modal */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{verifyAction === 'verified' ? 'Verify Payment' : 'Reject Payment'}</h2>
            <div className="space-y-4">
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Remarks (optional)" className="w-full px-3 py-2 border rounded-md" rows={3} />
              <div className="flex gap-3">
                <button onClick={handleVerify} disabled={updating}
                        className={`px-6 py-2 text-white rounded-md ${verifyAction === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                  {updating ? 'Processing...' : 'Confirm'}
                </button>
                <button onClick={() => setVerifyModal(false)} className="bg-gray-300 px-6 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="space-y-4">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md">
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
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Remarks (optional)" className="w-full px-3 py-2 border rounded-md" rows={3} />
              <div className="flex gap-3">
                <button onClick={handleStatusUpdate} disabled={!newStatus || updating}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-primary-700">
                  {updating ? 'Updating...' : 'Update'}
                </button>
                <button onClick={() => setStatusModal(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
