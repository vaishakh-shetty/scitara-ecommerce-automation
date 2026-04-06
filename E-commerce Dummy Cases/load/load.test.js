/**
 * LOAD TEST
 * Purpose : Simulate realistic concurrent user load — expected production traffic.
 * Profile : Ramp 0 → 50 VUs over 3 min, hold 5 min, ramp down 2 min.
 * Pass     : p(95) < 500 ms, error rate < 1%
 */
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

const errorRate = new Rate('errors')
const orderCount = new Counter('orders_placed')
const productListDuration = new Trend('product_list_duration', true)
const productDetailDuration = new Trend('product_detail_duration', true)
const categoryFilterDuration = new Trend('category_filter_duration', true)
const searchDuration = new Trend('search_duration', true)
const orderDuration = new Trend('order_duration', true)

export const options = {
  stages: [
    { duration: '3m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
}

const BASE = 'http://localhost:3001'
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen']
const SEARCH_TERMS = ['headphones', 'book', 'jacket', 'watch', 'speaker']

export default function () {
  group('Product Listing', () => {
    const res = http.get(`${BASE}/products`)
    productListDuration.add(res.timings.duration)
    check(res, { 'status 200': (r) => r.status === 200 }) || errorRate.add(1)
  })

  sleep(Math.random() * 2 + 0.5)

  group('Category Filter', () => {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    const res = http.get(`${BASE}/products?category=${encodeURIComponent(cat)}`)
    categoryFilterDuration.add(res.timings.duration)
    check(res, {
      'status 200': (r) => r.status === 200,
      'results not empty': (r) => JSON.parse(r.body).length > 0,
    }) || errorRate.add(1)
  })

  sleep(Math.random() * 1.5 + 0.5)

  group('Search', () => {
    const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)]
    const res = http.get(`${BASE}/products?q=${term}`)
    searchDuration.add(res.timings.duration)
    check(res, { 'status 200': (r) => r.status === 200 }) || errorRate.add(1)
  })

  sleep(Math.random() * 1 + 0.5)

  group('Product Detail', () => {
    const id = Math.floor(Math.random() * 20) + 1
    const res = http.get(`${BASE}/products/${id}`)
    productDetailDuration.add(res.timings.duration)
    check(res, { 'status 200': (r) => r.status === 200 }) || errorRate.add(1)
  })

  sleep(Math.random() * 2 + 1)

  // ~30% of users place an order
  if (Math.random() < 0.3) {
    group('Place Order', () => {
      const payload = JSON.stringify({
        id: `ORD-LOAD-${Date.now()}-${__VU}-${__ITER}`,
        customer: {
          firstName: 'Load', lastName: 'User', email: `load${__VU}@test.com`,
          phone: '+1 555 000 0001', address: '50 Load Ave', city: 'Loadtown', zipCode: '10002',
        },
        items: [{ product: { id: 1, name: 'Headphones', price: 299.99 }, quantity: 1 }],
        total: 299.99,
        createdAt: new Date().toISOString(),
      })
      const res = http.post(`${BASE}/orders`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      orderDuration.add(res.timings.duration)
      check(res, { 'order created 201': (r) => r.status === 201 }) || errorRate.add(1)
      if (res.status === 201) orderCount.add(1)
    })
  }

  sleep(Math.random() * 2 + 1)
}
