// Product interfaces with inventory management
export interface Product {
  id: string
  name: string
  price: number
  category: string
  emoji: string
  description?: string
  stockQuantity: number
  isOutOfStock?: boolean
  lowStockThreshold?: number
  lastUpdated?: string
}

export interface CartItem extends Product {
  quantity: number
}

// Inventory status utilities
export const getInventoryStatus = (product: Product): 'healthy' | 'low' | 'out' => {
  const threshold = product.lowStockThreshold || 5
  
  if (product.isOutOfStock || product.stockQuantity <= 0) {
    return 'out'
  }
  
  if (product.stockQuantity <= threshold) {
    return 'low'
  }
  
  return 'healthy'
}

export const isProductAvailable = (product: Product): boolean => {
  return !product.isOutOfStock && product.stockQuantity > 0
}

// Category definitions
export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All Items' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'food', name: 'Food' },
  { id: 'sides', name: 'Sides' },
  { id: 'desserts', name: 'Desserts' }
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['id'] 