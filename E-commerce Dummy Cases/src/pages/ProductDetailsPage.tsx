import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import StarRating from '../components/StarRating'
import Toast from '../components/Toast'

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(Number(id))
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState(false)

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setToast(false)
    setTimeout(() => setToast(true), 10)
  }

  if (loading) {
    return (
      <div data-testid="loading-state" className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-200 rounded-2xl h-96" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div data-testid="error-state" className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 font-medium text-lg">Product not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Back to products
        </button>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 h-96">
          <img
            src={product.image}
            alt={product.name}
            data-testid="product-image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-3">
            {product.category}
          </span>

          <h1
            data-testid="product-detail-name"
            className="text-2xl font-bold text-gray-900 leading-snug mb-3"
          >
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-gray-500">
              {product.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          <p
            data-testid="product-detail-price"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                data-testid="detail-qty-decrease"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                data-testid="detail-qty-value"
                className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-900"
              >
                {quantity}
              </span>
              <button
                data-testid="detail-qty-increase"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            data-testid="detail-add-to-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <Toast message={`${product.name} added to cart!`} show={toast} onClose={() => setToast(false)} />
    </main>
  )
}
