import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'
import type { Order } from '../../types'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [payment, setPayment] = useState<any>(null)
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
        } catch {
          // no payment yet
        }
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
      <h1 className="text-3xl font-bold mb-6">Order #{order.id.slice(0, 8)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
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

        <div className="bg-white p-6 rounded-lg shadow-md">
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
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Customization Notes</h2>
          <p className="text-gray-700">{order.customization_notes}</p>
        </div>
      )}

      {order.uploaded_images && order.uploaded_images.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          <div className="flex flex-wrap gap-3">
            {order.uploaded_images.map((url, i) => (
              <img key={i} src={url} alt={`Upload ${i}`} className="w-32 h-32 object-cover rounded" />
            ))}
          </div>
        </div>
      )}

      {payment && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-2">
            <p><strong>Verification Status:</strong> {payment.verification_status}</p>
            {payment.transaction_id && <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>}
            {payment.screenshot_url && (
              <div>
                <p className="font-medium mb-2">Payment Screenshot:</p>
                <img src={payment.screenshot_url} alt="Payment Screenshot" className="w-48 rounded" />
              </div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
          <div className="space-y-3">
            {history.map((h: any, i: number) => (
              <div key={i} className="flex items-start">
                <div className="w-3 h-3 bg-primary-500 rounded-full mt-1.5 mr-3"></div>
                <div>
                  <p className="font-medium">{getStatusLabel(h.new_status)}</p>
                  <p className="text-sm text-gray-500">{formatDate(h.timestamp)}</p>
                  {h.remarks && <p className="text-sm text-gray-600">{h.remarks}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
