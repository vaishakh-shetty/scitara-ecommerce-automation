/**
 * SMOKE TEST
 * Purpose : Baseline sanity check — minimal load, zero tolerance for errors.
 * Profile : 2 VUs × 1 minute
 * Pass     : error rate = 0%, p95 < 500 ms
 */
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

const errorRate = new Rate('errors')
const productListDuration = new Trend('product_list_duration')
const productDetailDuration = new Trend('product_detail_duration')
const orderCreateDuration = new Trend('order_create_duration')

export const options = {
  vus: 2,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<500'],
    errors: ['rate==0'],
  },
}

const BASE = 'http://localhost:3001'

export default function () {
  // 1. Fetch all products
  let res = http.get(`${BASE}/products`)
  productListDuration.add(res.timings.duration)
  check(res, {
    'GET /products → 200': (r) => r.status === 200,
    'GET /products → array not empty': (r) => JSON.parse(r.body).length > 0,
  }) || errorRate.add(1)

  sleep(0.5)

  // 2. Fetch single product
  res = http.get(`${BASE}/products/1`)
  productDetailDuration.add(res.timings.duration)
  check(res, {
    'GET /products/1 → 200': (r) => r.status === 200,
    'GET /products/1 → has name': (r) => JSON.parse(r.body).name !== undefined,
  }) || errorRate.add(1)

  sleep(0.5)

  // 3. Post an order
  const payload = JSON.stringify({
    id: `ORD-SMOKE-${Date.now()}-${__VU}`,
    customer: {
      firstName: 'Test', lastName: 'User', email: 'test@smoke.com',
      phone: '+1 555 000 0000', address: '1 Test St', city: 'Testville', zipCode: '10001',
    },
    items: [{ product: { id: 1, name: 'Wireless Headphones', price: 299.99 }, quantity: 1 }],
    total: 299.99,
    createdAt: new Date().toISOString(),
  })
  res = http.post(`${BASE}/orders`, payload, { headers: { 'Content-Type': 'application/json' } })
  orderCreateDuration.add(res.timings.duration)
  check(res, {
    'POST /orders → 201': (r) => r.status === 201,
  }) || errorRate.add(1)

  sleep(1)
}
