import { test, expect } from '@playwright/test'
import { ProductListingPage } from '../pages/ProductListingPage'
import { PRODUCTS, TOTAL_PRODUCTS, CATEGORY_COUNTS } from '../fixtures/testData'

test.describe('Product Listing Page', { tag: ['@listing'] }, () => {
  let listing: ProductListingPage

  test.beforeEach(async ({ page }) => {
    listing = new ProductListingPage(page)
    await listing.goto()
  })

  test.describe('Page load', () => {
    test('PL-01 — page title contains ShopEase', async ({ page }) => {
      await expect(page).toHaveTitle(/ShopEase/)
    })

    test('PL-02 — heading "All Products" is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible()
    })

    test('PL-03 — all 20 products are loaded', async () => {
      const count = await listing.getProductCount()
      expect(count).toBe(TOTAL_PRODUCTS)
    })

    test('PL-04 — product grid is visible', async ({ page }) => {
      await expect(page.getByTestId('product-grid')).toBeVisible()
    })

    test('PL-05 — each product card shows name, price and add-to-cart button', async ({ page }) => {
      const card = page.getByTestId(`product-card-${PRODUCTS.electronics.id}`)
      await expect(card.getByTestId(`product-name-${PRODUCTS.electronics.id}`)).toBeVisible()
      await expect(card.getByTestId(`product-price-${PRODUCTS.electronics.id}`)).toBeVisible()
      await expect(card.getByTestId(`add-to-cart-${PRODUCTS.electronics.id}`)).toBeVisible()
    })

    test('PL-06 — product price is correctly displayed', async () => {
      const price = await listing.getProductPriceById(PRODUCTS.electronics.id)
      expect(price).toBe(PRODUCTS.electronics.price)
    })
  })

  test.describe('Search', () => {
    test('PL-07 — search by name filters products', async () => {
      await listing.search('headphones')
      const count = await listing.getProductCount()
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(TOTAL_PRODUCTS)
    })

    test('PL-07a — search result contains the searched product', async ({ page }) => {
      await listing.search('headphones')
      await expect(page.getByTestId(`product-card-${PRODUCTS.electronics.id}`)).toBeVisible()
    })

    test('PL-07b — search with no match shows empty state', async () => {
      await listing.search('zzznomatchxyz')
      expect(await listing.isEmptyStateVisible()).toBe(true)
    })

    test('PL-07c — clearing search restores all products', async () => {
      await listing.search('headphones')
      await listing.clearSearch()
      const count = await listing.getProductCount()
      expect(count).toBe(TOTAL_PRODUCTS)
    })

    test('PL-07d — search is case-insensitive', async () => {
      await listing.search('HEADPHONES')
      const count = await listing.getProductCount()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Category filter', () => {
    const categories = Object.entries(CATEGORY_COUNTS)
    const subIds = ['a', 'b', 'c', 'd']
    for (let i = 0; i < categories.length; i++) {
      const [category, expectedCount] = categories[i]
      test(`PL-08${subIds[i]} — filtering by "${category}" shows ${expectedCount} products`, async () => {
        await listing.filterByCategory(category)
        const count = await listing.getProductCount()
        expect(count).toBe(expectedCount)
      })
    }

    test('PL-08e — selecting "All" restores all products', async () => {
      await listing.filterByCategory('Electronics')
      await listing.filterByCategory('All')
      const count = await listing.getProductCount()
      expect(count).toBe(TOTAL_PRODUCTS)
    })
  })

  test.describe('Sort', () => {
    test('PL-09 — sort by price ascending orders products correctly', async () => {
      await listing.sortBy('price-asc')
      const prices = await listing.getAllVisibleProductPrices()
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
      }
    })

    test('PL-09a — sort by price descending orders products correctly', async () => {
      await listing.sortBy('price-desc')
      const prices = await listing.getAllVisibleProductPrices()
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1])
      }
    })
  })

  test.describe('Add to Cart', () => {
    test('PL-10 — adding product increments cart badge to 1', async () => {
      const before = await listing.getCartCount()
      await listing.addToCartById(PRODUCTS.electronics.id)
      const after = await listing.getCartCount()
      expect(after).toBe(before + 1)
    })

    test('PL-10a — adding same product twice increments badge to 2', async () => {
      await listing.addToCartById(PRODUCTS.electronics.id)
      await listing.addToCartById(PRODUCTS.electronics.id)
      const count = await listing.getCartCount()
      expect(count).toBe(2)
    })

    test('PL-10b — adding different products increments badge correctly', async () => {
      await listing.addToCartById(PRODUCTS.electronics.id)
      await listing.addToCartById(PRODUCTS.book.id)
      const count = await listing.getCartCount()
      expect(count).toBe(2)
    })

    test('PL-10c — toast notification appears after adding to cart', async ({ page }) => {
      await listing.addToCartById(PRODUCTS.electronics.id)
      await expect(page.getByTestId('toast')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('PL-13 — clicking product card navigates to product detail page', async ({ page }) => {
      await listing.clickProductCard(PRODUCTS.electronics.id)
      await expect(page).toHaveURL(new RegExp(`/product/${PRODUCTS.electronics.id}`))
    })
  })

  test.describe('Network / negative states', () => {
    test('PL-11 — API failure shows error state', async ({ page }) => {
      await listing.mockApiFailure('**/products*')
      await page.goto('/')
      await expect(page.getByTestId('error-state')).toBeVisible({ timeout: 10000 })
      await listing.clearNetworkMocks()
    })

    test('PL-12 — slow API response shows loading skeleton', async ({ page }) => {
      await listing.mockSlowResponse('**/products*', 2000)
      await page.goto('/')
      await expect(page.getByTestId('loading-state')).toBeVisible()
      await expect(page.getByTestId('product-grid')).toBeVisible({ timeout: 10000 })
      await listing.clearNetworkMocks()
    })
  })
})
