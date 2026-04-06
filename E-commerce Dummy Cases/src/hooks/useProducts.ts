import { useState, useEffect, useMemo } from 'react'
import { Product, SortOption } from '../types'

const API_BASE = 'http://127.0.0.1:3001'

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
}

interface UseProductsOptions {
  search?: string
  category?: string
  sort?: SortOption
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { search = '', category = '', sort = 'default' } = options
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
        return res.json()
      })
      .then((data: Product[]) => {
        setAllProducts(data)
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const products = useMemo(() => {
    let result = [...allProducts]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    }

    if (category) {
      result = result.filter((p) => p.category === category)
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [allProducts, search, category, sort])

  return { products, loading, error }
}

export function useProduct(id: number): { product: Product | null; loading: boolean; error: string | null } {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`${API_BASE}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Product not found (${res.status})`)
        return res.json()
      })
      .then((data: Product) => {
        setProduct(data)
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { product, loading, error }
}
