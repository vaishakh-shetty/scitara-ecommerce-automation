export const PRODUCTS = {
  electronics: {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299.99,
    category: 'Electronics',
  },
  smartwatch: {
    id: 4,
    name: 'Smartwatch Pro Series 5',
    price: 399.99,
    category: 'Electronics',
  },
  book: {
    id: 11,
    name: 'Clean Code',
    price: 34.99,
    category: 'Books',
  },
  cheapest: {
    id: 13,
    name: 'Atomic Habits',
    price: 18.99,
    category: 'Books',
  },
  homeKitchen: {
    id: 17,
    name: 'Stainless Steel Water Bottle — 1L',
    price: 29.99,
    category: 'Home & Kitchen',
  },
  clothing: {
    id: 8,
    name: 'Classic White Sneakers',
    price: 79.99,
    category: 'Clothing',
  },
}

export const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen']

export const CATEGORY_COUNTS: Record<string, number> = {
  Electronics: 5,
  Clothing: 5,
  Books: 5,
  'Home & Kitchen': 5,
}

export const TOTAL_PRODUCTS = 20

export const API_BASE = 'http://127.0.0.1:3001'
