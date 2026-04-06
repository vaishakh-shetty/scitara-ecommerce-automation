import { test, expect } from '@playwright/test'
import { ProductListingPage } from '../pages/ProductListingPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderSuccessPage } from '../pages/OrderSuccessPage'
import { PRODUCTS } from '../fixtures/testData'
import { VALID_USER } from '../fixtures/users'

test.describe('E2E — Full Purchase Flows', { tag: ['@e2e'] }, () => {

  test('E2E-01 — Browse listing → Add to cart → Checkout → Confirm (single item)', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible()

    await listing.addToCartById(PRODUCTS.electronics.id)
    expect(await listing.getCartCount()).toBe(1)

    const cart = new CartPage(page)
    await cart.goto()
    expect(await cart.isItemVisible(PRODUCTS.electronics.id)).toBe(true)

    await cart.proceedToCheckout()
    await expect(page).toHaveURL('/checkout')

    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    const orderId = await success.getOrderId()
    expect(orderId).toMatch(/^ORD-/)
    expect(await success.getCartCount()).toBe(0)
  })

  test('E2E-02 — Add multiple items → Update qty → Checkout → Confirm', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()

    await listing.addToCartById(PRODUCTS.electronics.id)
    await listing.addToCartById(PRODUCTS.book.id)
    expect(await listing.getCartCount()).toBe(2)

    const cart = new CartPage(page)
    await cart.goto()
    await cart.increaseQuantity(PRODUCTS.electronics.id)
    const qty = await cart.getItemQuantity(PRODUCTS.electronics.id)
    expect(qty).toBe(2)

    const expectedTotal = PRODUCTS.electronics.price * 2 + PRODUCTS.book.price
    const total = await cart.getTotal()
    expect(total).toBeCloseTo(expectedTotal, 2)

    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    const orderTotal = await success.getOrderTotal()
    expect(orderTotal).toBeCloseTo(expectedTotal, 2)
  })

  test('E2E-03 — Add item → Remove in cart → Add again → Checkout', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    await listing.addToCartById(PRODUCTS.electronics.id)

    const cart = new CartPage(page)
    await cart.goto()
    await cart.removeItem(PRODUCTS.electronics.id)
    expect(await cart.isEmptyCartVisible()).toBe(true)

    await listing.goto()
    await listing.addToCartById(PRODUCTS.electronics.id)

    await cart.goto()
    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    expect(await success.getOrderId()).toMatch(/^ORD-/)
  })

  test('E2E-04 — Search product → Open detail → Add → Cart → Checkout', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    await listing.search('keyboard')
    const count = await listing.getProductCount()
    expect(count).toBeGreaterThan(0)

    await listing.clickProductCard(3)

    const details = new ProductDetailsPage(page)
    await details.waitForDetail()
    await details.addToCart()
    expect(await details.getCartCount()).toBe(1)

    const cart = new CartPage(page)
    await cart.goto()
    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    expect(await success.isSuccessBlockVisible()).toBe(true)
  })

  test('E2E-05 — Filter by category → Add to cart → Checkout', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()

    await listing.filterByCategory('Books')
    const count = await listing.getProductCount()
    expect(count).toBe(5)

    await listing.addToCartById(PRODUCTS.book.id)
    expect(await listing.getCartCount()).toBe(1)

    const cart = new CartPage(page)
    await cart.goto()
    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    expect(await success.getOrderTotal()).toBeCloseTo(PRODUCTS.book.price, 2)
  })

  test('E2E-06 — Detail page with qty > 1 → Cart total is correct', async ({ page }) => {
    const details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.homeKitchen.id)
    await details.increaseQuantity(2)
    await details.addToCart()
    expect(await details.getCartCount()).toBe(3)

    const cart = new CartPage(page)
    await cart.goto()
    const total = await cart.getTotal()
    expect(total).toBeCloseTo(PRODUCTS.homeKitchen.price * 3, 2)
  })

  test('E2E-07 — Continue shopping from success page lands on listing', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    await listing.addToCartById(PRODUCTS.electronics.id)

    const cart = new CartPage(page)
    await cart.goto()
    await cart.proceedToCheckout()
    const checkout = new CheckoutPage(page)
    await checkout.fillForm(VALID_USER)
    await checkout.submitOrder()

    const success = new OrderSuccessPage(page)
    await success.waitForSuccess()
    await success.continueShopping()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible()
  })
})
