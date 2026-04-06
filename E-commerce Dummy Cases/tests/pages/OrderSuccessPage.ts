import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class OrderSuccessPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async waitForSuccess() {
    await expect(this.page.getByTestId('order-success')).toBeVisible({ timeout: 10000 })
  }

  async getOrderId(): Promise<string> {
    return (await this.page.getByTestId('order-id').textContent()) ?? ''
  }

  async getOrderTotal(): Promise<number> {
    const text = await this.page.getByTestId('order-total').textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.page.getByTestId('confirmation-message').textContent()) ?? ''
  }

  async continueShopping() {
    await this.page.getByRole('link', { name: 'Continue Shopping' }).click()
    await this.page.waitForURL('**/')
  }

  async isSuccessBlockVisible(): Promise<boolean> {
    return this.page.getByTestId('order-success').isVisible()
  }
}
