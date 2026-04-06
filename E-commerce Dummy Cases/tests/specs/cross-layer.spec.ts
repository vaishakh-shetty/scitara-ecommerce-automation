/**
 * CROSS-LAYER VALIDATION TESTS
 *
 * These tests are the SDET's unique contribution. They validate that what the
 * API says and what the UI shows are always in sync. Neither a unit test nor a
 * pure E2E test would catch a silent price mismatch between the backend and UI.
 *
 * CL-01 — Price consistency   : API price === UI displayed price
 * CL-02 — Cart total accuracy  : UI total === sum of (API price × qty)
 * CL-03 — Order data integrity : Submitted order stored in API matches UI data
 */

import { test, expect } from '@playwright/test'
import { ProductListingPage } from '../pages/ProductListingPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderSuccessPage } from '../pages/OrderSuccessPage'
import { addProductFromListing } from '../helpers/cartHelpers'
import { API_BASE, PRODUCTS } from '../fixtures/testData'
import { VALID_USER } from '../fixtures/users'

test.describe('Cross-Layer Validation', { tag: ['@cross-layer'] }, () => {

  test('CL-01 — Price consistency: API price matches UI displayed price for all products', async ({ page, request }) => {
    const apiRes = await request.get(`${API_BASE}/products`)
    expect(apiRes.status()).toBe(200)
    const apiProducts: Array<{ id: number; price: number; name: string }> = await apiRes.json()

    const listing = new ProductListingPage(page)
    await listing.goto()

    for (const apiProduct of apiProducts) {
      const uiPrice = await listing.getProductPriceById(apiProduct.id)
      expect(uiPrice).toBeCloseTo(apiProduct.price, 2)
    }
  })

  test('CL-01b — Price consistency: API price matches UI on product details page', async ({ page, request }) => {
    const targetId = PRODUCTS.electronics.id

    const apiRes = await request.get(`${API_BASE}/products/${targetId}`)
    const apiProduct: { price: number } = await apiRes.json()

    const details = new ProductDetailsPage(page)
    await details.goto(targetId)
    const uiPrice = await details.getProductPrice()

    expect(uiPrice).toBeCloseTo(apiProduct.price, 2)
  })

  test('CL-02 — Cart total accuracy: UI total equals sum of API prices × quantities', async ({ page, request }) => {
    const itemsToAdd = [
      { id: PRODUCTS.electronics.id, qty: 2 },
      { id: PRODUCTS.book.id, qty: 3 },
      { id: PRODUCTS.homeKitchen.id, qty: 1 },
    ]

    let expectedTotal = 0
    for (const item of itemsToAdd) {
      const res = await request.get(`${API_BASE}/products/${item.id}`)
      const product: { price: number } = await res.json()
      expectedTotal += product.price * item.qty
    }

    const details = new ProductDetailsPage(page)
    for (const item of itemsToAdd) {
      await details.goto(item.id)
      if (item.qty > 1) await details.increaseQuantity(item.qty - 1)
      await details.addToCart()
    }

    const cart = new CartPage(page)
    await cart.goto()
    const uiTotal = await cart.getTotal()

    expect(uiTotal).toBeCloseTo(expectedTotal, 2)
  })

  test('CL-02b — Cart subtotal per item matches API price × quantity', async ({ page, request }) => {
    const targetId = PRODUCTS.clothing.id

    const apiRes = await request.get(`${API_BASE}/products/${targetId}`)
    const apiProduct: { price: number } = await apiRes.json()

    await addProductFromListing(page, targetId)
    const cart = new CartPage(page)
    await cart.goto()
    await cart.increaseQuantity(targetId)
    await cart.increaseQuantity(targetId)

    const uiSubtotal = await cart.getItemSubtotal(targetId)
    const expectedSubtotal = apiProduct.price * 3
    expect(uiSubtotal).toBeCloseTo(expectedSubtotal, 2)
  })

  test('CL-03 — Order data integrity: order stored in API matches what was shown in UI', async ({ page, request }) => {
    const targetId = PRODUCTS.electronics.id

    const productRes = await request.get(`${API_BASE}/products/${targetId}`)
    const apiProduct: { price: number; name: string } = await productRes.json()

    await addProductFromListing(page, targetId)

    const cart = new CartPage(page)
    await cart.goto()
    const uiCartTotal = await cart.getTotal()

    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    const uiOrderId = await success.getOrderId()
    const uiOrderTotal = await success.getOrderTotal()

    const orderRes = await request.get(`${API_BASE}/orders`)
    const orders: Array<{
      id: string
      total: number
      customer: { email: string }
      items: Array<{ product: { id: number }; quantity: number }>
    }> = await orderRes.json()

    const storedOrder = orders.find((o) => o.id === uiOrderId)
    expect(storedOrder).toBeTruthy()
    expect(storedOrder!.total).toBeCloseTo(uiOrderTotal, 2)
    expect(storedOrder!.total).toBeCloseTo(apiProduct.price, 2)
    expect(storedOrder!.customer.email).toBe(VALID_USER.email)
    expect(uiCartTotal).toBeCloseTo(storedOrder!.total, 2)
    expect(storedOrder!.items[0].product.id).toBe(targetId)
  })
})
