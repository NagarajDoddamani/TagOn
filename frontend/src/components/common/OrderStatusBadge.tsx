import { getStatusColor, getStatusLabel } from '../../utils/helpers'

interface Props {
  status: string
}

export default function OrderStatusBadge({ status }: Props) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}
