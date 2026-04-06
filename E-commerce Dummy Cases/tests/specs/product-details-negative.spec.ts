import { test, expect } from '@playwright/test'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { PRODUCTS } from '../fixtures/testData'

test.describe('Product Details — Negative & Edge Cases', { tag: ['@details', '@negative'] }, () => {

  test('PD-N01 — product missing description field renders page without crash', async ({ page }) => {
    await page.route(`**/products/${PRODUCTS.electronics.id}`, async (route) => {
      const res = await route.fetch()
      const product: Record<string, unknown> = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...stripped } = product
      await route.fulfill({ json: stripped })
    })
    const details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.electronics.id)
    await expect(page.getByTestId('product-detail-name')).toBeVisible()
    await expect(page.getByTestId('product-detail-price')).toBeVisible()
    await expect(page.getByTestId('detail-add-to-cart')).toBeVisible()
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })

  test('PD-N02 — broken product image does not crash the page', async ({ page }) => {
    await page.route(/\.(jpg|jpeg|png|webp|svg)(\?.*)?$/, (route) => route.abort())
    await page.goto(`/product/${PRODUCTS.electronics.id}`)
    await expect(page.getByTestId('product-detail-name')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('detail-add-to-cart')).toBeVisible()
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })

  test('PD-N03 — UI enforces minimum quantity of 1 via repeated decrease', async ({ page }) => {
    const details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.electronics.id)
    await details.decreaseQuantity(10)
    const qty = await details.getCurrentQuantity()
    expect(qty).toBe(1)
  })

  test('PD-N04 — UI prevents negative quantity — cart receives exactly 1 item', async ({ page }) => {
    const details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.electronics.id)
    for (let i = 0; i < 8; i++) {
      await page.getByTestId('detail-qty-decrease').click()
    }
    const qty = await details.getCurrentQuantity()
    expect(qty).toBeGreaterThanOrEqual(1)
    await details.addToCart()
    expect(await details.getCartCount()).toBe(1)
  })

  test('PD-N05 — extremely large quantity (50) keeps UI stable and badge correct', async ({ page }) => {
    const details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.electronics.id)
    await details.increaseQuantity(49)
    const qty = await details.getCurrentQuantity()
    expect(qty).toBe(50)
    await details.addToCart()
    const count = await details.getCartCount()
    expect(count).toBe(50)
    await expect(page.getByTestId('detail-add-to-cart')).toBeVisible()
  })

  test('PD-N06 — slow product API response shows loading state before content appears', async ({ page }) => {
    await page.route(`**/products/${PRODUCTS.electronics.id}`, async (route) => {
      await page.waitForTimeout(2000)
      await route.continue()
    })
    await page.goto(`/product/${PRODUCTS.electronics.id}`)
    await expect(page.getByTestId('loading-state')).toBeVisible()
    await expect(page.getByTestId('product-detail-name')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('loading-state')).not.toBeVisible()
  })
})
