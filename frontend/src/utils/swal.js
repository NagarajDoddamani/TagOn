import Swal from 'sweetalert2'

const baseConfig = {
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
  buttonsStyling: true,
  reverseButtons: true,
}

export function confirmDelete(itemName = 'this item') {
  return Swal.fire({
    ...baseConfig,
    title: 'Delete?',
    text: `This action cannot be undone.`,
    html: `<p>Are you sure you want to delete <strong>${itemName}</strong>?</p><p class="text-sm text-gray-500 mt-1">This action cannot be undone.</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })
}

export function confirmLogout() {
  return Swal.fire({
    ...baseConfig,
    title: 'Logout?',
    text: 'Are you sure you want to logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel',
  })
}

export function confirmStatusChange(newStatus) {
  return Swal.fire({
    ...baseConfig,
    title: 'Update Status?',
    html: `<p>Change order status to <strong>${newStatus}</strong>?</p>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Update',
    cancelButtonText: 'Cancel',
  })
}

export function confirmPayment(action) {
  const isApprove = action === 'verified'
  return Swal.fire({
    ...baseConfig,
    title: isApprove ? 'Approve Payment?' : 'Reject Payment?',
    text: isApprove
      ? 'This will mark the payment as verified.'
      : 'This will reject the payment.',
    icon: isApprove ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
    confirmButtonText: isApprove ? 'Yes, Approve' : 'Yes, Reject',
    cancelButtonText: 'Cancel',
  })
}

export function confirmBlockToggle(currentStatus) {
  const isBlocking = currentStatus === 'active'
  return Swal.fire({
    ...baseConfig,
    title: isBlocking ? 'Block Customer?' : 'Unblock Customer?',
    text: isBlocking
      ? 'This customer will no longer be able to place orders.'
      : 'This customer will regain access to their account.',
    icon: isBlocking ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: isBlocking ? '#dc2626' : '#16a34a',
    confirmButtonText: isBlocking ? 'Yes, Block' : 'Yes, Unblock',
    cancelButtonText: 'Cancel',
  })
}

export function confirmAction(title, text, confirmText = 'Confirm') {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  })
}

export function success(title, text = '') {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
  })
}

export function error(title, text = 'Something went wrong. Please try again.') {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
  })
}

export function warning(title, text) {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
  })
}

export function loading(title = 'Processing...') {
  Swal.fire({
    title,
    html: 'Please wait...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })
}

export function close() {
  Swal.close()
}

export function inputWithConfirm({ title, input, inputPlaceholder, inputValue = '', confirmText = 'Save' }) {
  return Swal.fire({
    ...baseConfig,
    title,
    input,
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value || !value.trim()) return 'This field is required'
    },
  })
}
