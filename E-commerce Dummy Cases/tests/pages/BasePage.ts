import { Page, expect, Route } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path = '/') {
    await this.page.goto(path)
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getTitle(): Promise<string> {
    return this.page.title()
  }

  async getCartCount(): Promise<number> {
    const badge = this.page.getByTestId('cart-count')
    const visible = await badge.isVisible()
    if (!visible) return 0
    const text = await badge.textContent()
    return parseInt(text ?? '0', 10)
  }

  async goToCart() {
    await this.page.getByTestId('cart-icon').click()
    await this.page.waitForURL('**/cart')
  }

  async waitForToast() {
    await expect(this.page.getByTestId('toast')).toBeVisible()
    await expect(this.page.getByTestId('toast')).toBeHidden({ timeout: 5000 })
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` })
  }

  /**
   * Intercept a URL pattern and abort the request — simulates API failure.
   * Call BEFORE navigating to the page.
   */
  async mockApiFailure(urlPattern: string | RegExp) {
    await this.page.route(urlPattern, (route: Route) => route.abort('failed'))
  }

  /**
   * Intercept a URL pattern and delay the response — simulates slow network.
   * Call BEFORE navigating to the page.
   */
  async mockSlowResponse(urlPattern: string | RegExp, delayMs: number) {
    await this.page.route(urlPattern, async (route: Route) => {
      await this.page.waitForTimeout(delayMs)
      await route.continue()
    })
  }

  /**
   * Remove all previously registered route intercepts.
   */
  async clearNetworkMocks() {
    await this.page.unrouteAll()
  }
}
