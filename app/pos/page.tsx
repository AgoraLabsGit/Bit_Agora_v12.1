"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/ui/header"
import { 
  Plus, 
  Minus, 
  X,
  DollarSign,
  Calculator,
  Package,
  Search,
  Receipt,
  ShoppingCart
} from "lucide-react"
import { PaymentModal } from '@/components/pos/payment/PaymentModal'
import { TaxCalculator, TaxConfiguration, TaxCalculationResult, formatTaxAmount } from '@/lib/tax-calculation'
import { ProductCard } from './components/InventoryIndicator'
import { Product, CartItem, PRODUCT_CATEGORIES, isProductAvailable } from './types/product'

// Real product interfaces and utilities imported from types/product.ts

// Utility functions
const calculateTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`
}

// Categories for filtering - using imported constants
const categories = PRODUCT_CATEGORIES

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null)
  const [taxCalculator, setTaxCalculator] = useState<TaxCalculator | null>(null)

  // Fetch products and tax settings from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch products and tax settings in parallel
        const [productsResponse, taxResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/tax-settings')
        ])
        
        const productsResult = await productsResponse.json()
        const taxResult = await taxResponse.json()
        
        if (productsResult.success && productsResult.data) {
          setProducts(productsResult.data)
        } else {
          setError('Failed to load products')
        }

        if (taxResult.success && taxResult.data) {
          setTaxConfig(taxResult.data)
          setTaxCalculator(new TaxCalculator(taxResult.data))
        } else {
          console.warn('Failed to load tax settings, using defaults')
          // Use default disabled configuration
          const defaultConfig: TaxConfiguration = {
            enabled: false,
            defaultRate: 0,
            taxType: 'VAT',
            country: 'Generic',
            includeTaxInPrice: false,
            roundingMethod: 'round',
            taxName: 'Tax',
            showTaxLine: true,
            allowManualTaxEntry: true,
          }
          setTaxConfig(defaultConfig)
          setTaxCalculator(new TaxCalculator(defaultConfig))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products by category and search query
  useEffect(() => {
    let filtered = [...products] // Create a copy to avoid mutations

    // Filter by category first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query with intelligent matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      
      // Escape special regex characters in the search query
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      // Create regex pattern that matches from the beginning of words
      // \b ensures word boundary, so "p" matches "pizza" but not "soup"
      const searchRegex = new RegExp(`\\b${escapedQuery}`, 'i')
      
      filtered = filtered.filter(product => {
        const name = product.name || ''
        const category = product.category || ''
        
        // Only search product names and categories, exclude descriptions
        return searchRegex.test(name) || searchRegex.test(category)
      })
    }

    // Remove any potential duplicates based on id
    const uniqueFiltered = filtered.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    )

    setFilteredProducts(uniqueFiltered)
  }, [selectedCategory, products, searchQuery])

  // Add product to cart
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // Update cart item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  // Clear entire cart
  const clearCart = () => {
    setCartItems([])
  }

  // Calculate cart total with tax
  const taxCalculation = useMemo(() => {
    if (!taxCalculator || cartItems.length === 0) {
      const subtotal = calculateTotal(cartItems)
      return {
        subtotal,
        primaryTax: 0,
        secondaryTax: 0,
        totalTax: 0,
        total: subtotal,
        taxRate: 0,
        secondaryTaxRate: 0,
        breakdown: {
          primaryTaxName: 'Tax',
          primaryTaxAmount: 0,
        },
      }
    }
    
    return taxCalculator.calculateCartTax(cartItems)
  }, [cartItems, taxCalculator])

  const total = taxCalculation.total

  const handlePaymentComplete = () => {
    setCartItems([])
    setShowPaymentModal(false)
  }

  // Handle custom amount entry
  const handleCustomAmountSubmit = () => {
    if (customAmount && parseFloat(customAmount) > 0) {
      const customProduct: Product = {
        id: `custom-${Date.now()}`,
        name: customDescription || 'Custom Amount',
        price: parseFloat(customAmount),
        category: 'custom',
        emoji: '💰',
        description: customDescription || 'Custom amount entry',
        stockQuantity: 999, // Custom products have unlimited stock
        isOutOfStock: false,
        lowStockThreshold: 0
      }
      addToCart(customProduct)
      setCustomAmount('')
      setCustomDescription('')
      setShowCustomModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header currentPage="pos" />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div className="text-center">
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg text-destructive">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Main POS Interface */}
        {!isLoading && !error && (
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-8 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
            {/* Products Panel */}
            <div className="w-full lg:w-2/3 bg-card rounded-lg border border-border p-3 sm:p-4 lg:p-6">
            {/* Search Box and Custom Amount */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Product Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-2 border-border focus:border-primary transition-colors"
                />
              </div>
              
            {/* Custom Amount Button */}
              <Button 
                variant="outline" 
                className="w-full sm:w-auto min-w-[180px] h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-border hover:bg-accent touch-manipulation active:scale-95 transition-transform"
                onClick={() => setShowCustomModal(true)}
              >
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Custom Amount
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium whitespace-nowrap touch-manipulation active:scale-95 transition-transform h-10 sm:h-12"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 overflow-y-auto h-[calc(100vh-20rem)] sm:h-[calc(100vh-22rem)] lg:h-[calc(100vh-24rem)]">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No products available</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === 'all' 
                      ? 'No products have been added to your catalog yet.'
                      : `No products found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                    }
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    lowStockThreshold={product.lowStockThreshold || 5}
                  />
                ))
              )}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="w-full lg:w-1/3 bg-card rounded-lg border border-border p-3 sm:p-4 lg:p-6 max-h-[40vh] lg:max-h-none flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Order</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 sm:h-10 touch-manipulation"
              >
                Clear
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">No items in cart</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg border border-border">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-foreground truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation active:scale-95 transition-transform"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation active:scale-95 transition-transform"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation active:scale-95 transition-transform"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Total with Tax Breakdown */}
            <div className="border-t border-border pt-4 sm:pt-6">
              {cartItems.length > 0 && taxConfig?.showTaxLine && (
                <div className="space-y-2 mb-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm sm:text-base text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(taxCalculation.subtotal)}</span>
                  </div>
                  
                  {/* Tax Breakdown */}
                  {taxConfig?.enabled && taxCalculation.totalTax > 0 && (
                    <>
                      {/* Primary Tax */}
                      <div className="flex justify-between items-center text-sm sm:text-base text-muted-foreground">
                        <span>{taxCalculation.breakdown.primaryTaxName} ({(taxCalculation.taxRate * 100).toFixed(1)}%):</span>
                        <span>{formatPrice(taxCalculation.primaryTax)}</span>
                      </div>
                      
                      {/* Secondary Tax (if applicable) */}
                      {taxCalculation.secondaryTax > 0 && taxCalculation.breakdown.secondaryTaxName && (
                        <div className="flex justify-between items-center text-sm sm:text-base text-muted-foreground">
                          <span>{taxCalculation.breakdown.secondaryTaxName} ({(taxCalculation.secondaryTaxRate * 100).toFixed(1)}%):</span>
                          <span>{formatPrice(taxCalculation.secondaryTax)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Total */}
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-lg sm:text-xl font-semibold text-foreground">Total:</span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              
              <Button 
                className="w-full h-12 sm:h-14 lg:h-16 bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base lg:text-lg font-medium touch-manipulation active:scale-95 transition-transform"
                disabled={cartItems.length === 0}
                onClick={() => setShowPaymentModal(true)}
              >
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Choose Payment Method
              </Button>
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={total}
        cartItems={cartItems}
        onPaymentComplete={handlePaymentComplete}
        taxCalculation={taxCalculation}
        taxConfig={taxConfig || undefined}
      />

      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Custom Amount</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCustomModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-medium text-foreground">
                  Amount ($)
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="mt-2 h-12 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="custom-description" className="text-sm font-medium text-foreground">
                  Description (optional)
                </Label>
                <Input
                  id="custom-description"
                  placeholder="Enter item description..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomModal(false)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCustomAmountSubmit}
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                className="flex-1 h-12"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 