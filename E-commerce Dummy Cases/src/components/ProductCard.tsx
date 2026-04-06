import { Link } from 'react-router-dom'
import { Product } from '../types'
import { useCart } from '../context/CartContext'
import StarRating from './StarRating'

interface Props {
  product: Product
  onAddToCart?: () => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    onAddToCart?.()
  }

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-52 bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-2 left-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3
            data-testid={`product-name-${product.id}`}
            className="font-semibold text-gray-900 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2 mb-1"
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviewCount.toLocaleString()})</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span
            data-testid={`product-price-${product.id}`}
            className="text-lg font-bold text-gray-900"
          >
            ${product.price.toFixed(2)}
          </span>
          <button
            data-testid={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
