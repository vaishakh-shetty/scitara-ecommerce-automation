
import { test, expect } from '@playwright/test'
import { API_BASE, PRODUCTS } from '../fixtures/testData'
import { VALID_USER } from '../fixtures/users'

// Orders write to db.json — must run serially to avoid concurrent write conflicts on json-server
test.describe.configure({ mode: 'serial' })

const buildOrder = (overrides = {}) => ({
  id: `ORD-TEST-${Date.now()}`,
  customer: VALID_USER,
  items: [{ product: PRODUCTS.electronics, quantity: 1 }],
  total: PRODUCTS.electronics.price,
  createdAt: new Date().toISOString(),
  ...overrides,
})

test.describe('API — Orders', { tag: ['@api'] }, () => {

  test.describe('POST /orders — happy path', () => {
    test('API-01 — returns 201 and the created order for valid payload', async ({ request }) => {
      const payload = buildOrder()
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      expect(res.status()).toBe(201)
      const body = await res.json()
      expect(body.id).toBe(payload.id)
      expect(body.total).toBe(payload.total)
    })

    test('API-02 — created order includes customer details', async ({ request }) => {
      const payload = buildOrder()
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      const body = await res.json()
      expect(body.customer.email).toBe(VALID_USER.email)
      expect(body.customer.firstName).toBe(VALID_USER.firstName)
    })

    test('API-03 — created order includes items array', async ({ request }) => {
      const payload = buildOrder()
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      const body = await res.json()
      expect(Array.isArray(body.items)).toBe(true)
      expect(body.items).toHaveLength(1)
      expect(body.items[0].product.id).toBe(PRODUCTS.electronics.id)
    })

    test('API-04 — created order includes createdAt timestamp', async ({ request }) => {
      const payload = buildOrder()
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      const body = await res.json()
      expect(body.createdAt).toBeTruthy()
      expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date')
    })

    test('API-05 — order with multiple items is stored correctly', async ({ request }) => {
      const payload = buildOrder({
        items: [
          { product: PRODUCTS.electronics, quantity: 2 },
          { product: PRODUCTS.book, quantity: 1 },
        ],
        total: PRODUCTS.electronics.price * 2 + PRODUCTS.book.price,
      })
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      expect(res.status()).toBe(201)
      const body = await res.json()
      expect(body.items).toHaveLength(2)
    })
  })

  test.describe('POST /orders — invalid payloads', () => {
    test('API-07a — POST with empty object body — server responds without crashing', async ({ request }) => {
      const res = await request.post(`${API_BASE}/orders`, { data: {} })
      expect([200, 201]).toContain(res.status())
    })

    test('API-07b — POST with unexpected field structure — server stores and responds', async ({ request }) => {
      const res = await request.post(`${API_BASE}/orders`, {
        data: { unexpectedField: 'test_value', anotherUnknown: 42 },
      })
      expect([200, 201]).toContain(res.status())
      const body = await res.json()
      expect(body).toHaveProperty('id')
    })

    test('API-07c — POST missing all required order fields — server remains operational', async ({ request }) => {
      const res = await request.post(`${API_BASE}/orders`, {
        data: { note: 'missing customer, items, total' },
      })
      expect([200, 201]).toContain(res.status())
      const healthCheck = await request.get(`${API_BASE}/orders`)
      expect(healthCheck.status()).toBe(200)
    })
  })

  test.describe('POST /orders — edge cases', { tag: ['@negative'] }, () => {
    test('API-N02 — invalid data types in fields are stored without crashing server', async ({ request }) => {
      const payload = buildOrder({
        total: 'not-a-number',
        items: 'not-an-array',
      })
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      expect([200, 201]).toContain(res.status())
      const health = await request.get(`${API_BASE}/orders`)
      expect(health.status()).toBe(200)
    })

    test('API-N03 — large payload with 100 items is accepted without timeout', async ({ request }) => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        product: { ...PRODUCTS.electronics, id: (i % 20) + 1 },
        quantity: i + 1,
      }))
      const payload = buildOrder({
        items: manyItems,
        total: manyItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      })
      const res = await request.post(`${API_BASE}/orders`, { data: payload })
      expect(res.status()).toBe(201)
      const body = await res.json()
      expect(body.id).toBe(payload.id)
    })

    test('API-N04 — duplicate order ID submission — server stays operational', async ({ request }) => {
      const payload = buildOrder({ id: `ORD-DUPE-${Date.now()}` })
      const first = await request.post(`${API_BASE}/orders`, { data: payload })
      expect([200, 201]).toContain(first.status())
      await request.post(`${API_BASE}/orders`, { data: payload })
      const health = await request.get(`${API_BASE}/orders`)
      expect(health.status()).toBe(200)
    })
  })

  test.describe('GET /orders', () => {
    test('API-06 — returns 200 with array of orders', async ({ request }) => {
      const res = await request.get(`${API_BASE}/orders`)
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
    })

    test('API-06a — previously created order appears in order list', async ({ request }) => {
      const payload = buildOrder({ id: `ORD-VERIFY-${Date.now()}` })
      await request.post(`${API_BASE}/orders`, { data: payload })

      const res = await request.get(`${API_BASE}/orders`)
      const orders = await res.json()
      const found = orders.find((o: { id: string }) => o.id === payload.id)
      expect(found).toBeTruthy()
      expect(found.total).toBeCloseTo(payload.total, 2)
    })
  })
})
