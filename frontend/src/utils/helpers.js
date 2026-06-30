export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getStatusColor = (status) => {
  const colors = {
    payment_pending_verification: 'bg-yellow-100 text-yellow-800',
    payment_verified: 'bg-blue-100 text-blue-800',
    designing: 'bg-purple-100 text-purple-800',
    approval_pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    printing: 'bg-indigo-100 text-indigo-800',
    packing: 'bg-teal-100 text-teal-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status) => {
  const labels = {
    payment_pending_verification: 'Payment Pending Verification',
    payment_verified: 'Payment Verified',
    designing: 'Designing',
    approval_pending: 'Approval Pending',
    approved: 'Approved',
    printing: 'Printing',
    packing: 'Packing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    archived: 'Archived',
  }
  return labels[status] || status
}
