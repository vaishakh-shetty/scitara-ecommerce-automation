import { CartItem as CartItemType } from '../types'
import { useCart } from '../context/CartContext'

interface Props {
  item: CartItemType
}

export default function CartItem({ item }: Props) {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity } = item
  const subtotal = (product.price * quantity).toFixed(2)

  return (
    <div
      data-testid={`cart-item-${product.id}`}
      className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
        <p className="text-sm font-semibold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <span
          data-testid={`item-subtotal-${product.id}`}
          className="text-sm font-bold text-gray-900"
        >
          ${subtotal}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              data-testid={`qty-decrease-${product.id}`}
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span
              data-testid={`qty-value-${product.id}`}
              className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-900"
            >
              {quantity}
            </span>
            <button
              data-testid={`qty-increase-${product.id}`}
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            data-testid={`remove-item-${product.id}`}
            onClick={() => removeItem(product.id)}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            aria-label="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
