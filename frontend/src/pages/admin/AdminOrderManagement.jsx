import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { adminService } from '../../services/admin.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [verifyModal, setVerifyModal] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getOrders(filter || undefined)
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleVerify = async (orderId, status) => {
    try {
      await adminService.getDashboard() // just to check admin access
      const { default: api } = await import('../../services/api')
      await api.post(`/payments/verify/${orderId}`, { status, remarks })
      setVerifyModal(null)
      setRemarks('')
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to verify payment')
    }
  }

  const handleStatusUpdate = async (orderId) => {
    try {
      const { default: api } = await import('../../services/api')
      await api.put(`/orders/${orderId}/status`, { status: newStatus, remarks })
      setStatusModal(null)
      setRemarks('')
      setNewStatus('')
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status')
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

      <div className="mb-6 flex gap-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-md">
          <option value="">All Orders</option>
          <option value="payment_pending_verification">Pending Verification</option>
          <option value="payment_verified">Payment Verified</option>
          <option value="designing">Designing</option>
          <option value="printing">Printing</option>
          <option value="packing">Packing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-6 py-4 text-sm">#{o.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">{o.product_name || 'N/A'}</td>
                  <td className="px-6 py-4">{formatCurrency(o.total_amount)}</td>
                  <td className="px-6 py-4"><OrderStatusBadge status={o.order_status} /></td>
                  <td className="px-6 py-4 text-sm">{formatDate(o.created_at)}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => viewOrder(o.id)} className="text-sm text-primary-600 hover:underline">View</button>
                    <Link to={`/admin/orders/${o.id}`} className="text-sm text-indigo-600 hover:underline">Workspace</Link>
                    {o.order_status === 'payment_pending_verification' && (
                      <button onClick={() => setVerifyModal(o.id)} className="text-sm text-green-600 hover:underline">Verify</button>
                    )}
                    {o.order_status !== 'delivered' && o.order_status !== 'cancelled' && (
                      <button onClick={() => setStatusModal(o.id)} className="text-sm text-blue-600 hover:underline">Update</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {verifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Verify Payment</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button onClick={() => handleVerify(verifyModal, 'verified')} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Approve</button>
                <button onClick={() => handleVerify(verifyModal, 'rejected')} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">Reject</button>
                <button onClick={() => setVerifyModal(null)} className="bg-gray-300 px-6 py-2 rounded-md">Cancel</button>
              </div>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks (optional)" className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="space-y-4">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md">
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
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks (optional)" className="w-full px-3 py-2 border rounded-md" />
              <div className="flex gap-3">
                <button onClick={() => handleStatusUpdate(statusModal)} disabled={!newStatus} className="bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50">Update</button>
                <button onClick={() => setStatusModal(null)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
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
