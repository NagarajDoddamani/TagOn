import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ChatWindow from '../../components/customer/ChatWindow'
import DesignPreviewPanel from '../../components/customer/DesignPreviewPanel'
import OrderTimeline from '../../components/customer/OrderTimeline'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!order) return <p className="text-center py-12">Order not found</p>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <OrderStatusBadge status={order.order_status} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Order info + Payment + Uploads */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Details & Delivery Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <OrderStatusBadge status={order.order_status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="font-medium capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
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

          {/* Customization Notes */}
          {order.customization_notes && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Customization Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{order.customization_notes}</p>
            </div>
          )}

          {/* Uploaded Images */}
          {order.uploaded_images && order.uploaded_images.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
              <div className="flex flex-wrap gap-3">
                {order.uploaded_images.map((url, i) => (
                  <img key={i} src={url} alt={`Upload ${i}`} className="w-32 h-32 object-cover rounded" />
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
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

          {/* Design Preview */}
          <DesignPreviewPanel
            orderId={order.id}
            isCustomized={order.is_customized}
            orderStatus={order.order_status}
          />
        </div>

        {/* Right column - Chat + Timeline */}
        <div className="space-y-6">
          <ChatWindow orderId={order.id} orderStatus={order.order_status} />
          <OrderTimeline orderId={order.id} />
        </div>
      </div>
    </div>
  )
}
