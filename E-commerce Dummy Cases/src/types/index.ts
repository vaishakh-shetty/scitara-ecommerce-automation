export interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
  rating: number
  reviewCount: number
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export interface OrderPayload {
  customer: CustomerDetails
  items: CartItem[]
  total: number
}

export interface CustomerDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
}

export interface Order {
  id: string
  customer: CustomerDetails
  items: CartItem[]
  total: number
  createdAt: string
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc'
