import { Link } from 'react-router-dom'
import { formatCurrency, NO_IMAGE_FALLBACK } from '../../utils/helpers'

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative">
      {product.is_featured && (
        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full z-10">
          Featured
        </span>
      )}
      <img
        src={product.image_url || NO_IMAGE_FALLBACK}
        alt={product.name}
        loading="lazy"
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
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
