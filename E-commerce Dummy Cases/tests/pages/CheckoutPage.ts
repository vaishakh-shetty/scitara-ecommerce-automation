import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export interface CustomerDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.navigate('/checkout')
  }

  async waitForForm() {
    await expect(this.page.getByTestId('checkout-form')).toBeVisible({ timeout: 8000 })
  }

  async fillField(field: keyof CustomerDetails, value: string) {
    await this.page.getByTestId(`field-${field}`).fill(value)
    await this.page.getByTestId(`field-${field}`).blur()
  }

  async fillForm(details: CustomerDetails) {
    for (const [key, value] of Object.entries(details)) {
      await this.fillField(key as keyof CustomerDetails, value)
    }
  }

  async submitOrder() {
    await this.page.getByRole('button', { name: 'Place Order' }).click()
  }

  async getValidationError(field: keyof CustomerDetails): Promise<string> {
    const el = this.page.getByTestId(`error-${field}`)
    await expect(el).toBeVisible()
    return (await el.textContent()) ?? ''
  }

  async isFieldErrorVisible(field: keyof CustomerDetails): Promise<boolean> {
    return this.page.getByTestId(`error-${field}`).isVisible()
  }

  async getCheckoutTotal(): Promise<number> {
    const text = await this.page.getByTestId('checkout-total').textContent()
    return parseFloat(text?.replace('$', '') ?? '0')
  }

  async isOrderSummaryVisible(): Promise<boolean> {
    return this.page.getByTestId('order-summary').isVisible()
  }
}
