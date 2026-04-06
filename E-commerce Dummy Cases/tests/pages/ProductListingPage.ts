import { Page, expect, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class ProductListingPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.navigate('/')
    await this.waitForProducts()
  }

  async waitForProducts() {
    await expect(this.page.getByTestId('product-grid')).toBeVisible({ timeout: 10000 })
  }

  async getProductCount(): Promise<number> {
    const text = await this.page.getByTestId('product-count').textContent()
    return parseInt(text ?? '0', 10)
  }

  async search(query: string) {
    await this.page.getByTestId('search-input').fill(query)
    await this.page.waitForTimeout(300)
  }

  async clearSearch() {
    await this.page.getByTestId('search-input').clear()
    await this.page.waitForTimeout(300)
  }

  async filterByCategory(category: string) {
    await this.page.getByTestId('category-filter').selectOption(category)
    await this.page.waitForTimeout(300)
  }

  async sortBy(option: 'default' | 'price-asc' | 'price-desc' | 'name-asc') {
    const labelMap: Record<string, string> = {
      default: 'Sort: Default',
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      'name-asc': 'Name: A–Z',
    }
    await this.page.getByTestId('sort-select').selectOption({ label: labelMap[option] })
    await this.page.waitForTimeout(300)
  }

  async addToCartById(productId: number) {
    await this.page.getByTestId(`add-to-cart-${productId}`).click()
  }

  async getProductCardById(productId: number): Promise<Locator> {
    return this.page.getByTestId(`product-card-${productId}`)
  }

  async getProductNameById(productId: number): Promise<string> {
    const text = await this.page.getByTestId(`product-name-${productId}`).textContent()
    return text ?? ''
  }

  async getProductPriceById(productId: number): Promise<number> {
    const text = await this.page.getByTestId(`product-price-${productId}`).textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async clickProductCard(productId: number) {
    await this.page.getByTestId(`product-card-${productId}`).locator('a').first().click()
    await this.page.waitForURL(`**/product/${productId}`)
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.getByTestId('empty-state').isVisible()
  }

  async getAllVisibleProductPrices(): Promise<number[]> {
    const grid = this.page.getByTestId('product-grid')
    const priceElements = grid.locator('[data-testid^="product-price-"]')
    const count = await priceElements.count()
    const prices: number[] = []
    for (let i = 0; i < count; i++) {
      const text = await priceElements.nth(i).textContent()
      prices.push(parseFloat(text?.replace('$', '') ?? '0'))
    }
    return prices
  }
}
