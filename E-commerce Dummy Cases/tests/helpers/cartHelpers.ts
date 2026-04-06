import { Page } from '@playwright/test'
import { ProductListingPage } from '../pages/ProductListingPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { CartPage } from '../pages/CartPage'

/**
 * Add a product to cart from the listing page and return to listing.
 */
export async function addProductFromListing(page: Page, productId: number): Promise<void> {
  const listing = new ProductListingPage(page)
  await listing.goto()
  await listing.addToCartById(productId)
}

/**
 * Add a product to cart from the details page with a specific quantity.
 */
export async function addProductFromDetails(
  page: Page,
  productId: number,
  quantity = 1
): Promise<void> {
  const details = new ProductDetailsPage(page)
  await details.goto(productId)
  if (quantity > 1) {
    await details.increaseQuantity(quantity - 1)
  }
  await details.addToCart()
}

/**
 * Add multiple products from listing and navigate to cart.
 */
export async function addMultipleAndGoToCart(
  page: Page,
  productIds: number[]
): Promise<CartPage> {
  const listing = new ProductListingPage(page)
  await listing.goto()
  for (const id of productIds) {
    await listing.addToCartById(id)
    await page.waitForTimeout(200)
  }
  const cart = new CartPage(page)
  await cart.goto()
  return cart
}

/**
 * Navigate to cart from wherever we are.
 */
export async function goToCart(page: Page): Promise<CartPage> {
  const cart = new CartPage(page)
  await cart.goto()
  return cart
}
