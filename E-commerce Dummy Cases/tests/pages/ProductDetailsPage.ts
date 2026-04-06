import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ProductDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto(productId: number) {
    await this.navigate(`/product/${productId}`)
    await this.waitForDetail()
  }

  async waitForDetail() {
    await expect(this.page.getByTestId('product-detail-name')).toBeVisible({ timeout: 10000 })
  }

  async getProductName(): Promise<string> {
    return (await this.page.getByTestId('product-detail-name').textContent()) ?? ''
  }

  async getProductPrice(): Promise<number> {
    const text = await this.page.getByTestId('product-detail-price').textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async getCurrentQuantity(): Promise<number> {
    const text = await this.page.getByTestId('detail-qty-value').textContent()
    return parseInt(text ?? '1', 10)
  }

  async increaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.getByTestId('detail-qty-increase').click()
    }
  }

  async decreaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.getByTestId('detail-qty-decrease').click()
    }
  }

  async addToCart() {
    await this.page.getByTestId('detail-add-to-cart').click()
  }

  async goBack() {
    await this.page.getByRole('button', { name: 'Back' }).click()
  }

  async isImageVisible(): Promise<boolean> {
    return this.page.getByTestId('product-image').isVisible()
  }

  async isStarRatingVisible(): Promise<boolean> {
    return this.page.getByTestId('star-rating').isVisible()
  }
}
