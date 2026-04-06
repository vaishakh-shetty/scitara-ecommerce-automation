import { test, expect } from '@playwright/test'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductListingPage } from '../pages/ProductListingPage'
import { PRODUCTS } from '../fixtures/testData'

test.describe('Product Details Page', { tag: ['@details'] }, () => {
  let details: ProductDetailsPage

  test.beforeEach(async ({ page }) => {
    details = new ProductDetailsPage(page)
    await details.goto(PRODUCTS.electronics.id)
  })

  test.describe('Page content', () => {
    test('PD-01 — product name is displayed', async () => {
      const name = await details.getProductName()
      expect(name).toBe(PRODUCTS.electronics.name)
    })

    test('PD-02 — product price is correct', async () => {
      const price = await details.getProductPrice()
      expect(price).toBe(PRODUCTS.electronics.price)
    })

    test('PD-03 — product image is visible', async () => {
      expect(await details.isImageVisible()).toBe(true)
    })

    test('PD-04 — star rating is visible', async () => {
      expect(await details.isStarRatingVisible()).toBe(true)
    })

    test('PD-05 — product category badge is visible', async ({ page }) => {
      await expect(page.getByText(PRODUCTS.electronics.category)).toBeVisible()
    })

    test('PD-06 — product description is visible', async ({ page }) => {
      const description = page.locator('p.text-gray-600')
      await expect(description).toBeVisible()
    })
  })

  test.describe('Quantity selector', () => {
    test('PD-07 — default quantity is 1', async () => {
      const qty = await details.getCurrentQuantity()
      expect(qty).toBe(1)
    })

    test('PD-07a — increasing quantity works', async () => {
      await details.increaseQuantity(2)
      const qty = await details.getCurrentQuantity()
      expect(qty).toBe(3)
    })

    test('PD-07b — decreasing quantity works', async () => {
      await details.increaseQuantity(3)
      await details.decreaseQuantity(1)
      const qty = await details.getCurrentQuantity()
      expect(qty).toBe(3)
    })

    test('PD-07c — quantity cannot go below 1', async () => {
      await details.decreaseQuantity(5)
      const qty = await details.getCurrentQuantity()
      expect(qty).toBe(1)
    })

    test('PD-08 — large quantity (20) is handled correctly, badge reflects full qty', async () => {
      await details.increaseQuantity(19)
      const qty = await details.getCurrentQuantity()
      expect(qty).toBe(20)
      await details.addToCart()
      const count = await details.getCartCount()
      expect(count).toBe(20)
    })
  })

  test.describe('Add to Cart', () => {
    test('PD-09 — adding product updates cart badge to 1', async () => {
      await details.addToCart()
      const count = await details.getCartCount()
      expect(count).toBe(1)
    })

    test('PD-09a — adding qty 3 updates cart badge to 3', async () => {
      await details.increaseQuantity(2)
      await details.addToCart()
      const count = await details.getCartCount()
      expect(count).toBe(3)
    })

    test('PD-09b — toast appears after adding to cart', async ({ page }) => {
      await details.addToCart()
      await expect(page.getByTestId('toast')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('PD-10 — back button returns to product listing', async ({ page }) => {
      const listing = new ProductListingPage(page)
      await listing.goto()
      await listing.clickProductCard(PRODUCTS.electronics.id)
      await details.waitForDetail()
      await details.goBack()
      await expect(page).toHaveURL('/')
    })

    test('PD-11 — direct URL navigation to product works', async ({ page }) => {
      await page.goto(`/product/${PRODUCTS.book.id}`)
      const name = await details.getProductName()
      expect(name).toBe(PRODUCTS.book.name)
    })

    test('PD-11a — navigating from listing to detail shows correct product', async ({ page }) => {
      const listing = new ProductListingPage(page)
      await listing.goto()
      await listing.clickProductCard(PRODUCTS.book.id)
      const name = await details.getProductName()
      expect(name).toBe(PRODUCTS.book.name)
    })

    test('PD-12 — invalid product ID shows error state', async ({ page }) => {
      await page.goto('/product/99999')
      await expect(page.getByTestId('error-state')).toBeVisible()
    })
  })
})
