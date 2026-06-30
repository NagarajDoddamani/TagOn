import { getStatusColor, getStatusLabel } from '../../utils/helpers'

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}
