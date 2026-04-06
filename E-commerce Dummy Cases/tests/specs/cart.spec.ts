import { test, expect } from '@playwright/test'
import { CartPage } from '../pages/CartPage'
import { ProductListingPage } from '../pages/ProductListingPage'
import { addProductFromListing, addMultipleAndGoToCart } from '../helpers/cartHelpers'
import { API_BASE, PRODUCTS } from '../fixtures/testData'

test.describe('Cart Page', { tag: ['@cart'] }, () => {

  test.describe('Empty cart', () => {
    test('CT-01 — empty cart message is shown when no items added', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      expect(await cart.isEmptyCartVisible()).toBe(true)
    })

    test('CT-02 — empty cart has Continue Shopping link to listing', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await page.getByRole('link', { name: 'Continue Shopping' }).click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Cart with items', () => {
    test.beforeEach(async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
    })

    test('CT-03 — added item appears in cart', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      expect(await cart.isItemVisible(PRODUCTS.electronics.id)).toBe(true)
    })

    test('CT-04 — item count reflects number of items', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      const count = await cart.getItemCount()
      expect(count).toBe(1)
    })

    test('CT-05 — item quantity defaults to 1', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      const qty = await cart.getItemQuantity(PRODUCTS.electronics.id)
      expect(qty).toBe(1)
    })

    test('CT-06 — subtotal equals price × quantity', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      const subtotal = await cart.getItemSubtotal(PRODUCTS.electronics.id)
      expect(subtotal).toBeCloseTo(PRODUCTS.electronics.price, 2)
    })

    test('CT-07 — cart total equals sum of item subtotals', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      const total = await cart.getTotal()
      expect(total).toBeCloseTo(PRODUCTS.electronics.price, 2)
    })
  })

  test.describe('Quantity update', () => {
    test.beforeEach(async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
    })

    test('CT-08 — increasing quantity updates qty value', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await cart.increaseQuantity(PRODUCTS.electronics.id)
      const qty = await cart.getItemQuantity(PRODUCTS.electronics.id)
      expect(qty).toBe(2)
    })

    test('CT-08a — increasing quantity updates subtotal', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await cart.increaseQuantity(PRODUCTS.electronics.id)
      const subtotal = await cart.getItemSubtotal(PRODUCTS.electronics.id)
      expect(subtotal).toBeCloseTo(PRODUCTS.electronics.price * 2, 2)
    })

    test('CT-08b — increasing quantity updates cart total', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await cart.increaseQuantity(PRODUCTS.electronics.id)
      const total = await cart.getTotal()
      expect(total).toBeCloseTo(PRODUCTS.electronics.price * 2, 2)
    })

    test('CT-08c — decreasing quantity updates qty value', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await cart.increaseQuantity(PRODUCTS.electronics.id)
      await cart.decreaseQuantity(PRODUCTS.electronics.id)
      const qty = await cart.getItemQuantity(PRODUCTS.electronics.id)
      expect(qty).toBe(1)
    })

    test('CT-09 — decreasing qty to 0 removes item from cart', async ({ page }) => {
      const cart = new CartPage(page)
      await cart.goto()
      await cart.decreaseQuantity(PRODUCTS.electronics.id)
      expect(await cart.isEmptyCartVisible()).toBe(true)
    })
  })

  test.describe('Remove item', () => {
    test('CT-10 — remove item button removes the item', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      const cart = new CartPage(page)
      await cart.goto()
      await cart.removeItem(PRODUCTS.electronics.id)
      expect(await cart.isItemVisible(PRODUCTS.electronics.id)).toBe(false)
    })

    test('CT-10a — removing last item shows empty cart state', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      const cart = new CartPage(page)
      await cart.goto()
      await cart.removeItem(PRODUCTS.electronics.id)
      expect(await cart.isEmptyCartVisible()).toBe(true)
    })
  })

  test.describe('Multiple products', () => {
    test('CT-11 — multiple products appear in cart', async ({ page }) => {
      const cart = await addMultipleAndGoToCart(page, [
        PRODUCTS.electronics.id,
        PRODUCTS.book.id,
      ])
      expect(await cart.isItemVisible(PRODUCTS.electronics.id)).toBe(true)
      expect(await cart.isItemVisible(PRODUCTS.book.id)).toBe(true)
    })

    test('CT-11a — total is sum of all item subtotals', async ({ page }) => {
      const cart = await addMultipleAndGoToCart(page, [
        PRODUCTS.electronics.id,
        PRODUCTS.book.id,
      ])
      const total = await cart.getTotal()
      const expected = PRODUCTS.electronics.price + PRODUCTS.book.price
      expect(total).toBeCloseTo(expected, 2)
    })

    test('CT-11b — removing one product updates total correctly', async ({ page }) => {
      const cart = await addMultipleAndGoToCart(page, [
        PRODUCTS.electronics.id,
        PRODUCTS.book.id,
      ])
      await cart.removeItem(PRODUCTS.electronics.id)
      const total = await cart.getTotal()
      expect(total).toBeCloseTo(PRODUCTS.book.price, 2)
    })
  })

  test.describe('Navigation', () => {
    test('CT-12 — Checkout button navigates to checkout page', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      const cart = new CartPage(page)
      await cart.goto()
      await cart.proceedToCheckout()
      await expect(page).toHaveURL('/checkout')
    })
  })

  test.describe('Negative & Edge Cases', { tag: ['@negative'] }, () => {
    test('CT-13 — large cart with all 20 products remains stable', async ({ page }) => {
      const allIds = Array.from({ length: 20 }, (_, i) => i + 1)
      const cart = await addMultipleAndGoToCart(page, allIds)
      await expect(page.getByTestId('cart-items-list')).toBeVisible()
      const count = await cart.getItemCount()
      expect(count).toBe(20)
      const total = await cart.getTotal()
      expect(total).toBeGreaterThan(0)
      await expect(page.getByRole('link', { name: 'Checkout' })).toBeVisible()
    })

    test('CT-N01 — price mismatch between API and cart is detectable', async ({ page, request }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)

      const originalRes = await request.get(`${API_BASE}/products/${PRODUCTS.electronics.id}`)
      const original: { price: number } = await originalRes.json()
      const originalPrice = original.price
      const mockedPrice = originalPrice + 100

      await page.route('**/products*', async (route) => {
        const res = await route.fetch()
        const products: Array<{ id: number; price: number }> = await res.json()
        const modified = products.map((p) =>
          p.id === PRODUCTS.electronics.id ? { ...p, price: mockedPrice } : p
        )
        await route.fulfill({ json: modified })
      })

      const listing = new ProductListingPage(page)
      await listing.goto()
      const listingPrice = await listing.getProductPriceById(PRODUCTS.electronics.id)
      expect(listingPrice).toBeCloseTo(mockedPrice, 2)

      const cart = new CartPage(page)
      await cart.goto()
      const cartSubtotal = await cart.getItemSubtotal(PRODUCTS.electronics.id)
      expect(cartSubtotal).toBeCloseTo(originalPrice, 2)
      expect(listingPrice).not.toBeCloseTo(cartSubtotal, 2)
    })

    test('CT-N02 — cart state persists after full page refresh', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.reload()
      const cart = new CartPage(page)
      await cart.goto()
      expect(await cart.isItemVisible(PRODUCTS.electronics.id)).toBe(true)
      expect(await cart.getItemCount()).toBe(1)
    })

    test('CT-N03 — rapid quantity increase clicks produce correct final count', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      const cart = new CartPage(page)
      await cart.goto()
      for (let i = 0; i < 5; i++) {
        await page.getByTestId(`qty-increase-${PRODUCTS.electronics.id}`).click()
      }
      const qty = await cart.getItemQuantity(PRODUCTS.electronics.id)
      expect(qty).toBe(6)
    })

    test('CT-N05 — corrupted sessionStorage cart is handled gracefully on reload', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => sessionStorage.setItem('shopease_cart', '{not valid json}'))
      await page.reload()
      await expect(page.locator('#root')).toBeVisible()
      const cart = new CartPage(page)
      await cart.goto()
      expect(await cart.isEmptyCartVisible()).toBe(true)
    })

    test('CT-N06 — cart total with many high-price items shows valid number without overflow', async ({ page }) => {
      const allIds = Array.from({ length: 20 }, (_, i) => i + 1)
      const cart = await addMultipleAndGoToCart(page, allIds)
      const total = await cart.getTotal()
      expect(isFinite(total)).toBe(true)
      expect(total).toBeGreaterThan(0)
      await expect(page.getByTestId('cart-total')).toBeVisible()
      const rawText = await page.getByTestId('cart-total').textContent()
      expect(rawText).toMatch(/^\$[\d,]+\.\d{2}$/)
    })
  })
})
