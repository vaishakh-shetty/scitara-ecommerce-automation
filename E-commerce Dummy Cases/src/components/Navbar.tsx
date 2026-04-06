import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const location = useLocation()

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-blue-600 ${
        location.pathname === to ? 'text-blue-600' : 'text-gray-700'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">ShopEase</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-8">
            {navLink('/', 'Products')}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              data-testid="cart-icon"
              className="relative flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              {totalItems > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
