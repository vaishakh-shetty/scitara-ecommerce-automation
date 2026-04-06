import { useState, useCallback } from 'react'
import { useProducts } from '../hooks/useProducts'
import { SortOption } from '../types'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Kitchen']

export default function ProductListingPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [toast, setToast] = useState(false)

  const { products, loading, error } = useProducts({
    search,
    category,
    sort,
  })

  const showToast = useCallback(() => {
    setToast(false)
    setTimeout(() => setToast(true), 10)
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">Discover our curated collection across every category</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value === 'All' ? '' : e.target.value)}
          data-testid="category-filter"
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === 'All' ? '' : c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          data-testid="sort-select"
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p data-testid="product-count" className="text-sm text-gray-500 mb-4">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* States */}
      {loading && (
        <div data-testid="loading-state" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div data-testid="error-state" className="text-center py-16">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-1">Make sure json-server is running on port 3001.</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div data-testid="empty-state" className="text-center py-20">
          <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div
          data-testid="product-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={showToast} />
          ))}
        </div>
      )}

      <Toast message="Added to cart!" show={toast} onClose={() => setToast(false)} />
    </main>
  )
}
