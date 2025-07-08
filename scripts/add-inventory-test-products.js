// Add sample products with different inventory levels for testing visual indicators
// Using direct localStorage access since this is a development script
const fs = require('fs')
const path = require('path')

// Mock storage implementation for Node.js
const DATA_DIR = path.join(process.cwd(), '.bitagora-data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const mockStorage = {
  setItem(key, value) {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`)
      fs.writeFileSync(filePath, value, 'utf8')
    } catch (error) {
      console.warn(`Failed to save ${key}:`, error)
    }
  },
  
  getItem(key) {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`)
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8')
      }
      return null
    } catch (error) {
      console.warn(`Failed to read ${key}:`, error)
      return null
    }
  }
}

const merchantId = 'dev-merchant-001'
const storageKey = `bitagora_products_${merchantId}`

// Sample products with different inventory statuses
const testProducts = [
  {
    id: 'test-healthy-1',
    name: 'Healthy Stock Pizza',
    price: 12.99,
    category: 'food',
    emoji: '🍕',
    description: 'Product with healthy stock levels',
    inStock: true,
    stockQuantity: 25,
    isOutOfStock: false,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-low-1',
    name: 'Low Stock Burger',
    price: 8.99,
    category: 'food',
    emoji: '🍔',
    description: 'Product with low stock levels',
    inStock: true,
    stockQuantity: 3,
    isOutOfStock: false,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-low-2',
    name: 'Low Stock Fries',
    price: 4.99,
    category: 'sides',
    emoji: '🍟',
    description: 'Product with low stock levels',
    inStock: true,
    stockQuantity: 2,
    isOutOfStock: false,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-out-1',
    name: 'Out of Stock Soda',
    price: 2.99,
    category: 'drinks',
    emoji: '🥤',
    description: 'Product that is out of stock',
    inStock: false,
    stockQuantity: 0,
    isOutOfStock: true,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-86d-1',
    name: '86\'d Ice Cream',
    price: 5.99,
    category: 'desserts',
    emoji: '🍦',
    description: 'Product that is 86\'d (manually out of stock)',
    inStock: false,
    stockQuantity: 8,
    isOutOfStock: true,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-healthy-2',
    name: 'Healthy Stock Coffee',
    price: 3.99,
    category: 'drinks',
    emoji: '☕',
    description: 'Product with healthy stock levels',
    inStock: true,
    stockQuantity: 50,
    isOutOfStock: false,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-low-3',
    name: 'Low Stock Sandwich',
    price: 7.99,
    category: 'food',
    emoji: '🥪',
    description: 'Product with low stock levels',
    inStock: true,
    stockQuantity: 1,
    isOutOfStock: false,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  },
  {
    id: 'test-healthy-3',
    name: 'Healthy Stock Salad',
    price: 9.99,
    category: 'food',
    emoji: '🥗',
    description: 'Product with healthy stock levels',
    inStock: true,
    stockQuantity: 15,
    isOutOfStock: false,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId
  }
]

function addInventoryTestProducts() {
  try {
    // Get existing products
    const existingProducts = JSON.parse(mockStorage.getItem(storageKey) || '[]')
    
    // Remove any existing test products
    const cleanedProducts = existingProducts.filter(p => !p.id.startsWith('test-'))
    
    // Add new test products
    const updatedProducts = [...cleanedProducts, ...testProducts]
    
    // Save to storage
    mockStorage.setItem(storageKey, JSON.stringify(updatedProducts))
    
    console.log('✅ Successfully added inventory test products!')
    console.log('Test products added:')
    testProducts.forEach(product => {
      console.log(`  - ${product.name}: ${product.stockQuantity} in stock (${product.isOutOfStock ? 'OUT OF STOCK' : 'Available'})`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error adding inventory test products:', error)
    return false
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  addInventoryTestProducts()
}

module.exports = { addInventoryTestProducts } 