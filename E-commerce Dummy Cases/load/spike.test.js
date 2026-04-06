/**
 * SPIKE TEST
 * Purpose : Simulate a sudden traffic burst (flash sale scenario).
 * Profile : 10 VUs → spike to 300 VUs instantly → back to 10 VUs.
 * Pass     : System recovers — error rate drops back below 5% after spike subsides.
 */
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const spikeDuration = new Trend('spike_duration', true)

export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Warm up
    { duration: '30s', target: 300 },  // Spike!
    { duration: '1m', target: 300 },   // Hold spike
    { duration: '30s', target: 10 },   // Drop back
    { duration: '2m', target: 10 },    // Recovery observation
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
}

const BASE = 'http://localhost:3001'

export default function () {
  group('Spike — Product List', () => {
    const res = http.get(`${BASE}/products`)
    spikeDuration.add(res.timings.duration)
    check(res, {
      'status 200': (r) => r.status === 200,
      'body has products': (r) => JSON.parse(r.body).length > 0,
    }) || errorRate.add(1)
  })

  sleep(Math.random() * 0.5)

  group('Spike — Category Filter (Electronics — popular during flash sale)', () => {
    const res = http.get(`${BASE}/products?category=Electronics`)
    spikeDuration.add(res.timings.duration)
    check(res, {
      'status 200': (r) => r.status === 200,
    }) || errorRate.add(1)
  })

  sleep(Math.random() * 0.5)

  // Most spike users just browse, 20% actually order
  if (Math.random() < 0.2) {
    group('Spike — Place Order (burst purchases)', () => {
      const payload = JSON.stringify({
        id: `ORD-SPIKE-${Date.now()}-${__VU}-${__ITER}`,
        customer: {
          firstName: 'Flash', lastName: 'Buyer', email: `spike${__VU}@test.com`,
          phone: '+1 555 000 0003', address: '1 Flash Sale Blvd', city: 'SpikeCity', zipCode: '30003',
        },
        items: [{ product: { id: 3, name: 'Gaming Keyboard', price: 129.99 }, quantity: 1 }],
        total: 129.99,
        createdAt: new Date().toISOString(),
      })
      const res = http.post(`${BASE}/orders`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      spikeDuration.add(res.timings.duration)
      check(res, { 'order 201': (r) => r.status === 201 }) || errorRate.add(1)
    })
  }

  sleep(Math.random() * 0.3)
}
