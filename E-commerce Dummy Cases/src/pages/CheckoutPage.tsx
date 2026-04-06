import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CheckoutForm from '../components/CheckoutForm'
import { CustomerDetails } from '../types'

const API_BASE = 'http://127.0.0.1:3001'

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (state.items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const handleSubmit = async (details: CustomerDetails) => {
    setLoading(true)
    try {
      const orderId = `ORD-${Date.now()}`
      const payload = {
        id: orderId,
        customer: details,
        items: state.items,
        total: totalPrice,
        createdAt: new Date().toISOString(),
      }

      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      clearCart()
      navigate('/order-success', { state: { orderId, total: totalPrice } })
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <CheckoutForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit" data-testid="order-summary">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {state.items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-sm text-gray-600"
                data-testid={`summary-item-${item.product.id}`}
              >
                <span className="line-clamp-1 flex-1 mr-2">
                  {item.product.name}{' '}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium whitespace-nowrap">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span data-testid="checkout-total">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
