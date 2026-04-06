import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.navigate('/cart')
  }

  async waitForCartItems() {
    await expect(this.page.getByTestId('cart-items-list')).toBeVisible({ timeout: 8000 })
  }

  async isEmptyCartVisible(): Promise<boolean> {
    return this.page.getByTestId('empty-cart').isVisible()
  }

  async getItemCount(): Promise<number> {
    const text = await this.page.getByTestId('cart-item-count').textContent()
    const match = text?.match(/\d+/)
    return parseInt(match?.[0] ?? '0', 10)
  }

  async getTotal(): Promise<number> {
    const text = await this.page.getByTestId('cart-total').textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async getItemQuantity(productId: number): Promise<number> {
    const text = await this.page.getByTestId(`qty-value-${productId}`).textContent()
    return parseInt(text ?? '1', 10)
  }

  async getItemSubtotal(productId: number): Promise<number> {
    const text = await this.page.getByTestId(`item-subtotal-${productId}`).textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async increaseQuantity(productId: number) {
    await this.page.getByTestId(`qty-increase-${productId}`).click()
    await this.page.waitForTimeout(200)
  }

  async decreaseQuantity(productId: number) {
    await this.page.getByTestId(`qty-decrease-${productId}`).click()
    await this.page.waitForTimeout(200)
  }

  async removeItem(productId: number) {
    await this.page.getByTestId(`remove-item-${productId}`).click()
    await this.page.waitForTimeout(300)
  }

  async isItemVisible(productId: number): Promise<boolean> {
    return this.page.getByTestId(`cart-item-${productId}`).isVisible()
  }

  async proceedToCheckout() {
    await this.page.getByRole('link', { name: 'Checkout' }).click()
    await this.page.waitForURL('**/checkout')
  }

  async continueShopping() {
    await this.page.getByRole('link', { name: 'Continue Shopping' }).first().click()
    await this.page.waitForURL('**/')
  }
}
