import { test, expect } from '@playwright/test'
import { API_BASE, TOTAL_PRODUCTS, CATEGORY_COUNTS, PRODUCTS } from '../fixtures/testData'

test.describe('API — Products', () => {

  test.describe('GET /products', () => {
    test('returns 200 with an array of products', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products`)
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
    })

    test(`returns all ${TOTAL_PRODUCTS} products`, async ({ request }) => {
      const res = await request.get(`${API_BASE}/products`)
      const body = await res.json()
      expect(body).toHaveLength(TOTAL_PRODUCTS)
    })

    test('each product has required fields', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products`)
      const products = await res.json()
      for (const p of products) {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('price')
        expect(p).toHaveProperty('category')
        expect(p).toHaveProperty('description')
        expect(p).toHaveProperty('image')
        expect(p).toHaveProperty('rating')
        expect(p).toHaveProperty('reviewCount')
        expect(p).toHaveProperty('stock')
      }
    })

    test('product price is a positive number', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products`)
      const products = await res.json()
      for (const p of products) {
        expect(typeof p.price).toBe('number')
        expect(p.price).toBeGreaterThan(0)
      }
    })

    test('product rating is between 1 and 5', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products`)
      const products = await res.json()
      for (const p of products) {
        expect(p.rating).toBeGreaterThanOrEqual(1)
        expect(p.rating).toBeLessThanOrEqual(5)
      }
    })
  })

  test.describe('GET /products/:id', () => {
    test('returns a single product by valid ID', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products/${PRODUCTS.electronics.id}`)
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.id).toBe(PRODUCTS.electronics.id)
      expect(body.name).toBe(PRODUCTS.electronics.name)
      expect(body.price).toBe(PRODUCTS.electronics.price)
    })

    test('returns 404 for non-existent product ID', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products/99999`)
      expect(res.status()).toBe(404)
    })

    test('returns correct category for known product', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products/${PRODUCTS.book.id}`)
      const body = await res.json()
      expect(body.category).toBe('Books')
    })
  })

  test.describe('GET /products?category filter', () => {
    for (const [category, expectedCount] of Object.entries(CATEGORY_COUNTS)) {
      test(`returns ${expectedCount} products for category: ${category}`, async ({ request }) => {
        const res = await request.get(`${API_BASE}/products?category=${encodeURIComponent(category)}`)
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body).toHaveLength(expectedCount)
        for (const p of body) {
          expect(p.category).toBe(category)
        }
      })
    }

    test('returns empty array for unknown category', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products?category=UnknownCategory`)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body).toHaveLength(0)
    })
  })

  test.describe('GET /products?q search', () => {
    test('search by product name returns matching results', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products?q=headphones`)
      const body = await res.json()
      expect(body.length).toBeGreaterThan(0)
      const names = body.map((p: { name: string }) => p.name.toLowerCase())
      expect(names.some((n: string) => n.includes('headphone'))).toBe(true)
    })

    test('search is case-insensitive', async ({ request }) => {
      const lower = await (await request.get(`${API_BASE}/products?q=keyboard`)).json()
      const upper = await (await request.get(`${API_BASE}/products?q=KEYBOARD`)).json()
      expect(lower).toHaveLength(upper.length)
    })

    test('search with no matches returns empty array', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products?q=zzznomatch999`)
      const body = await res.json()
      expect(body).toHaveLength(0)
    })
  })

  test.describe('GET /products sort (_sort & _order)', () => {
    test('sort by price ascending returns products in order', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products?_sort=price&_order=asc`)
      const body = await res.json()
      for (let i = 1; i < body.length; i++) {
        expect(body[i].price).toBeGreaterThanOrEqual(body[i - 1].price)
      }
    })

    test('sort by price descending returns products in order', async ({ request }) => {
      const res = await request.get(`${API_BASE}/products?_sort=price&_order=desc`)
      const body = await res.json()
      for (let i = 1; i < body.length; i++) {
        expect(body[i].price).toBeLessThanOrEqual(body[i - 1].price)
      }
    })
  })
})
