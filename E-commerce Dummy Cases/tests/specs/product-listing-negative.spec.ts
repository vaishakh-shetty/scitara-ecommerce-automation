import { test, expect } from '@playwright/test'
import { ProductListingPage } from '../pages/ProductListingPage'
import { TOTAL_PRODUCTS } from '../fixtures/testData'

test.describe('Product Listing — Negative & Edge Cases', { tag: ['@listing', '@negative'] }, () => {

  test('PL-N01 — API returns empty array shows empty state', async ({ page }) => {
    await page.route('**/products*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )
    await page.goto('/')
    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 8000 })
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })

  test('PL-N02 — API returns products with missing optional fields renders without crash', async ({ page }) => {
    await page.route('**/products*', async (route) => {
      const res = await route.fetch()
      const products: Record<string, unknown>[] = await res.json()
      const stripped = products.map(({ description: _d, ...rest }) => rest)
      await route.fulfill({ json: stripped })
    })
    await page.goto('/')
    await expect(page.getByTestId('product-grid')).toBeVisible({ timeout: 8000 })
    await expect(page.getByTestId('error-state')).not.toBeVisible()
    const listing = new ProductListingPage(page)
    const count = await listing.getProductCount()
    expect(count).toBe(TOTAL_PRODUCTS)
  })

  test('PL-N03 — API returns extra product does not crash the grid', async ({ page }) => {
    await page.route('**/products*', async (route) => {
      const res = await route.fetch()
      const products: Record<string, unknown>[] = await res.json()
      const extra = { ...products[0], id: 9999 }
      await route.fulfill({ json: [...products, extra] })
    })
    await page.goto('/')
    await expect(page.getByTestId('product-grid')).toBeVisible({ timeout: 8000 })
    const listing = new ProductListingPage(page)
    const count = await listing.getProductCount()
    expect(count).toBe(TOTAL_PRODUCTS + 1)
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })

  test('PL-N04 — rapid search input does not crash the page', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    const input = page.getByTestId('search-input')
    await input.pressSequentially('electronics book keyboard mouse headphones', { delay: 25 })
    await expect(page.locator('#root')).toBeVisible()
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })

  test('PL-N05 — API network failure mid-navigation shows error state', async ({ page }) => {
    await page.route('**/products*', (route) => route.abort('failed'))
    await page.goto('/')
    await expect(page.getByTestId('error-state')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('product-grid')).not.toBeVisible()
  })

  test('PL-N06 — invalid category injected via DOM shows empty state without crash', async ({ page }) => {
    const listing = new ProductListingPage(page)
    await listing.goto()
    await page.evaluate(() => {
      const sel = document.querySelector('[data-testid="category-filter"]') as HTMLSelectElement
      const opt = document.createElement('option')
      opt.value = 'NonExistentCategory'
      opt.text = 'NonExistentCategory'
      sel.add(opt)
    })
    await page.selectOption('[data-testid="category-filter"]', 'NonExistentCategory')
    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('error-state')).not.toBeVisible()
  })
})
