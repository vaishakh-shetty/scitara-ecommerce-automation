import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderSuccessPage } from '../pages/OrderSuccessPage'
import { addProductFromListing } from '../helpers/cartHelpers'
import { PRODUCTS } from '../fixtures/testData'
import { VALID_USER, INVALID_USERS } from '../fixtures/users'

test.describe('Checkout Page', { tag: ['@checkout'] }, () => {

  test.describe('Access control', () => {
    test('CH-01 — accessing checkout with empty cart redirects to cart', async ({ page }) => {
      await page.goto('/checkout')
      await expect(page).toHaveURL('/cart')
    })
  })

  test.describe('Page content', () => {
    test.beforeEach(async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
    })

    test('CH-02 — checkout heading is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
    })

    test('CH-03 — order summary shows added product', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      expect(await checkout.isOrderSummaryVisible()).toBe(true)
      await expect(page.getByTestId(`summary-item-${PRODUCTS.electronics.id}`)).toBeVisible()
    })

    test('CH-04 — checkout total matches product price', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      const total = await checkout.getCheckoutTotal()
      expect(total).toBeCloseTo(PRODUCTS.electronics.price, 2)
    })

    test('CH-05 — all form fields are present', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.waitForForm()
      await expect(page.getByLabel('First Name')).toBeVisible()
      await expect(page.getByLabel('Last Name')).toBeVisible()
      await expect(page.getByLabel('Email Address')).toBeVisible()
      await expect(page.getByLabel('Phone Number')).toBeVisible()
      await expect(page.getByLabel('Street Address')).toBeVisible()
      await expect(page.getByLabel('City')).toBeVisible()
      await expect(page.getByLabel('ZIP Code')).toBeVisible()
    })
  })

  test.describe('Form validation', () => {
    test.beforeEach(async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
    })

    test('CH-06 — submitting empty form shows all required field errors', async ({ page }) => {
      await page.getByRole('button', { name: 'Place Order' }).click()
      const checkout = new CheckoutPage(page)
      expect(await checkout.isFieldErrorVisible('firstName')).toBe(true)
      expect(await checkout.isFieldErrorVisible('lastName')).toBe(true)
      expect(await checkout.isFieldErrorVisible('email')).toBe(true)
      expect(await checkout.isFieldErrorVisible('phone')).toBe(true)
      expect(await checkout.isFieldErrorVisible('address')).toBe(true)
      expect(await checkout.isFieldErrorVisible('city')).toBe(true)
      expect(await checkout.isFieldErrorVisible('zipCode')).toBe(true)
    })

    test('CH-06a — invalid email shows email error', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(INVALID_USERS.badEmail)
      await page.getByRole('button', { name: 'Place Order' }).click()
      const error = await checkout.getValidationError('email')
      expect(error).toContain('valid email')
    })

    test('CH-06b — invalid phone shows phone error', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(INVALID_USERS.badPhone)
      await page.getByRole('button', { name: 'Place Order' }).click()
      const error = await checkout.getValidationError('phone')
      expect(error).toContain('valid phone')
    })

    test('CH-06c — invalid ZIP code shows ZIP error', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(INVALID_USERS.badZip)
      await page.getByRole('button', { name: 'Place Order' }).click()
      const error = await checkout.getValidationError('zipCode')
      expect(error).toContain('valid ZIP')
    })

    test('CH-06d — valid form has no validation errors', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await page.getByRole('button', { name: 'Place Order' }).click()
      expect(await checkout.isFieldErrorVisible('email')).toBe(false)
    })

    test('CH-07 — long input values (200 chars) are handled gracefully', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      const longString = 'A'.repeat(200)
      await checkout.fillForm({
        firstName: longString,
        lastName: longString,
        email: 'valid@example.com',
        phone: '+1 555 123 4567',
        address: longString,
        city: longString,
        zipCode: '10001',
      })
      await page.getByRole('button', { name: 'Place Order' }).click()
      const url = page.url()
      expect(url).toMatch(/checkout|order-success/)
    })

    test('CH-08 — special characters in fields are handled correctly', async ({ page }) => {
      const checkout = new CheckoutPage(page)
      await checkout.fillForm({
        firstName: "O'Brien",
        lastName: 'García-López',
        email: 'valid@example.com',
        phone: '+1 555 123 4567',
        address: '123 Main St, Apt #4B',
        city: 'São Paulo',
        zipCode: '10001',
      })
      await page.getByRole('button', { name: 'Place Order' }).click()
      await expect(page).toHaveURL('/order-success')
    })
  })

  test.describe('Order submission', () => {
    test('OS-01 — valid form submission navigates to order success page', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      await expect(page).toHaveURL('/order-success')
    })

    test('OS-02 — order success page shows order ID', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      const success = new OrderSuccessPage(page)
      await success.waitForSuccess()
      const orderId = await success.getOrderId()
      expect(orderId).toMatch(/^ORD-/)
    })

    test('OS-03 — order success page shows correct total', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      const expectedTotal = await checkout.getCheckoutTotal()
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      const success = new OrderSuccessPage(page)
      await success.waitForSuccess()
      const orderTotal = await success.getOrderTotal()
      expect(orderTotal).toBeCloseTo(expectedTotal, 2)
    })

    test('OS-03a — order success shows confirmation message', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      const success = new OrderSuccessPage(page)
      await success.waitForSuccess()
      const msg = await success.getConfirmationMessage()
      expect(msg.toLowerCase()).toContain('confirmation')
    })

    test('OS-03b — cart is cleared after successful order', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      const success = new OrderSuccessPage(page)
      await success.waitForSuccess()
      const count = await success.getCartCount()
      expect(count).toBe(0)
    })

    test('OS-04 — direct access to /order-success without state redirects to home', async ({ page }) => {
      await page.goto('/order-success')
      await expect(page).toHaveURL('/')
    })

    test('OS-05 — refreshing order success page redirects gracefully', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      const success = new OrderSuccessPage(page)
      await success.waitForSuccess()
      await page.reload()
      const url = page.url()
      expect(url).toMatch(/order-success|\//)
      await expect(page.locator('#root')).toBeVisible()
    })
  })

  test.describe('Negative & Edge Cases', { tag: ['@negative'] }, () => {
    test('CH-09 — cart is preserved if order submission fails', async ({ page }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      await page.route('**/orders', (route) => route.abort('failed'))
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      await expect(page).toHaveURL('/checkout')
      const cartCount = await checkout.getCartCount()
      expect(cartCount).toBeGreaterThan(0)
    })

    test('CH-N01 — double-click submit creates only one order', async ({ page, request }) => {
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      const before: unknown[] = await (await request.get('http://127.0.0.1:3001/orders')).json()
      const beforeCount = before.length
      await page.getByRole('button', { name: 'Place Order' }).dblclick()
      await expect(page).toHaveURL('/order-success', { timeout: 10000 })
      const after: unknown[] = await (await request.get('http://127.0.0.1:3001/orders')).json()
      expect(after.length).toBe(beforeCount + 1)
    })

    test('CH-N05 — slow order API shows loading indicator and no duplicate requests', async ({ page }) => {
      let postCount = 0
      await page.route('**/orders', async (route) => {
        if (route.request().method() === 'POST') {
          postCount++
          await page.waitForTimeout(2000)
        }
        await route.continue()
      })
      await addProductFromListing(page, PRODUCTS.electronics.id)
      await page.goto('/checkout')
      const checkout = new CheckoutPage(page)
      await checkout.fillForm(VALID_USER)
      await checkout.submitOrder()
      await expect(page.getByRole('button', { name: 'Placing Order…' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Placing Order…' })).toBeDisabled()
      await expect(page).toHaveURL('/order-success', { timeout: 15000 })
      expect(postCount).toBe(1)
    })
  })
})
