import { useLocation, Link, Navigate } from 'react-router-dom'

interface LocationState {
  orderId: string
  total: number
}

export default function OrderSuccessPage() {
  const location = useLocation()
  const state = location.state as LocationState | null

  if (!state?.orderId) {
    return <Navigate to="/" replace />
  }

  const { orderId, total } = state

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div data-testid="order-success">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order is confirmed.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Order ID</span>
            <span data-testid="order-id" className="font-mono font-semibold text-gray-900">
              {orderId}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Paid</span>
            <span data-testid="order-total" className="font-bold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <p data-testid="confirmation-message" className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to your registered email address.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
