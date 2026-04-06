/**
 * STRESS TEST
 * Purpose : Push beyond normal load to find the system's breaking point.
 * Profile : Ramp 0 → 200 VUs in steps — observe when errors appear.
 * Pass     : Not expected to pass all thresholds — failure point is the data.
 */
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const latency = new Trend('latency', true)

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '3m', target: 150 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
}

const BASE = 'http://localhost:3001'

export default function () {
  group('Stress — Product List', () => {
    const res = http.get(`${BASE}/products`)
    latency.add(res.timings.duration)
    check(res, {
      'status 200': (r) => r.status === 200,
    }) || errorRate.add(1)
  })

  sleep(Math.random() * 1 + 0.3)

  group('Stress — Product Detail', () => {
    const id = Math.floor(Math.random() * 20) + 1
    const res = http.get(`${BASE}/products/${id}`)
    latency.add(res.timings.duration)
    check(res, {
      'status 200': (r) => r.status === 200,
    }) || errorRate.add(1)
  })

  sleep(Math.random() * 1 + 0.3)

  group('Stress — Place Order', () => {
    const payload = JSON.stringify({
      id: `ORD-STRESS-${Date.now()}-${__VU}`,
      customer: {
        firstName: 'Stress', lastName: 'Tester', email: `stress${__VU}@test.com`,
        phone: '+1 555 000 0002', address: '99 Stress Rd', city: 'StressCity', zipCode: '20002',
      },
      items: [{ product: { id: 2, name: 'Smart TV', price: 749.99 }, quantity: 1 }],
      total: 749.99,
      createdAt: new Date().toISOString(),
    })
    const res = http.post(`${BASE}/orders`, payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    latency.add(res.timings.duration)
    check(res, { 'order 201': (r) => r.status === 201 }) || errorRate.add(1)
  })

  sleep(Math.random() * 0.5 + 0.2)
}
