import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'

export default function CartPage() {
  const { state, totalItems, totalPrice } = useCart()
  const { items } = state

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div data-testid="empty-cart">
          <svg
            className="w-20 h-20 text-gray-200 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Cart{' '}
        <span data-testid="cart-item-count" className="text-gray-400 font-normal text-lg">
          ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div data-testid="cart-items-list">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({totalItems} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span data-testid="cart-total">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Checkout
          </Link>
        </div>
      </div>
    </main>
  )
}
