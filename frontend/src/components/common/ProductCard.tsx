import { Link } from 'react-router-dom'
import type { ProductListItem } from '../../types'
import { formatCurrency } from '../../utils/helpers'

interface Props {
  product: ProductListItem
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={product.image_url || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <span className="text-xs text-primary-600 font-semibold uppercase">
          {product.category?.name}
        </span>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-gray-600 text-sm line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(product.base_price)}
          </span>
          {product.customizable && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Customizable
            </span>
          )}
        </div>
        <Link
          to={`/products/${product.id}`}
          className="mt-3 block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
