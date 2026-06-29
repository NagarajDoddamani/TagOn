export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Category {
  id: string
  name: string
  description: string | null
  status: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
}

export interface Template {
  id: string
  name: string
  preview_image: string | null
  max_upload_count: number
  orientation: string | null
  status: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  base_price: number
  product_type: string
  customizable: boolean
  status: string
  image_url: string | null
  category: Category | null
  variants: ProductVariant[]
  templates: Template[]
}

export interface ProductListItem {
  id: string
  category_id: string
  name: string
  description: string | null
  base_price: number
  product_type: string
  customizable: boolean
  status: string
  image_url: string | null
  category: Category | null
}

export interface Order {
  id: string
  customer_id: string
  product_id: string
  variant_id: string | null
  template_id: string | null
  quantity: number
  total_amount: number
  payment_status: string
  order_status: string
  delivery_address: DeliveryAddress
  customization_notes: string | null
  is_customized: boolean
  uploaded_images: string[] | null
  created_at: string
}

export interface OrderListItem {
  id: string
  product_name: string | null
  total_amount: number
  order_status: string
  payment_status: string
  is_customized: boolean
  created_at: string
}

export interface DeliveryAddress {
  recipient_name: string
  mobile: string
  address_line: string
  city: string
  state: string
  postal_code: string
  landmark?: string
}

export interface Payment {
  id: string
  order_id: string
  screenshot_url: string | null
  transaction_id: string | null
  verification_status: string
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  status: string
  created_at: string
}

export interface DashboardStats {
  total_orders: number
  pending_payments: number
  active_orders: number
  completed_orders: number
  total_products: number
  customer_count: number
}
