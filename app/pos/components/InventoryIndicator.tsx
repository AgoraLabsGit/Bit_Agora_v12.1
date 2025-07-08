"use client"

import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryIndicatorProps {
  stockQuantity: number
  lowStockThreshold?: number
  isOutOfStock?: boolean
  className?: string
}

export const InventoryIndicator = ({
  stockQuantity,
  lowStockThreshold = 5,
  isOutOfStock = false,
  className
}: InventoryIndicatorProps) => {
  // Don't show indicator if stock is healthy
  if (!isOutOfStock && stockQuantity > lowStockThreshold) {
    return null
  }

  // Out of stock (86'd) - red indicator
  if (isOutOfStock || stockQuantity <= 0) {
    return (
      <div className={cn(
        "absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg border-2 border-background",
        className
      )}>
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
      </div>
    )
  }

  // Low stock - orange indicator with quantity
  return (
    <div className={cn(
      "absolute -top-1 -right-1 bg-orange-500 text-white rounded-full min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg border-2 border-background",
      className
    )}>
      {stockQuantity}
    </div>
  )
}

// Enhanced product card wrapper with inventory indicators
interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    emoji: string
    stockQuantity?: number
    isOutOfStock?: boolean
  }
  onAddToCart: (product: any) => void
  className?: string
  lowStockThreshold?: number
}

export const ProductCard = ({
  product,
  onAddToCart,
  className,
  lowStockThreshold = 5
}: ProductCardProps) => {
  const { stockQuantity = 0, isOutOfStock = false } = product
  
  // Determine if product is disabled (out of stock)
  const isDisabled = isOutOfStock || stockQuantity <= 0
  
  // Determine visual state
  const isLowStock = !isDisabled && stockQuantity <= lowStockThreshold
  const cardBorderColor = isDisabled 
    ? "border-destructive" 
    : isLowStock 
      ? "border-orange-500" 
      : "border-border"
  
  const cardOpacity = isDisabled ? "opacity-60" : "opacity-100"
  
  return (
    <div 
      className={cn(
        "relative bg-background rounded-lg p-3 sm:p-4 border-2 transition-all touch-manipulation min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]",
        cardBorderColor,
        cardOpacity,
        isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md active:scale-95",
        className
      )}
      onClick={() => !isDisabled && onAddToCart(product)}
    >
      {/* Inventory Indicator */}
      <InventoryIndicator
        stockQuantity={stockQuantity}
        lowStockThreshold={lowStockThreshold}
        isOutOfStock={isOutOfStock}
      />
      
      {/* Product Content */}
      <div className="text-center h-full flex flex-col justify-center">
        <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">{product.emoji}</div>
        <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-primary">
          ${product.price.toFixed(2)}
        </p>
        
        {/* Stock Status Text */}
        {isDisabled && (
          <p className="text-xs text-destructive font-medium mt-1">
            Out of Stock
          </p>
        )}
        {isLowStock && (
          <p className="text-xs text-orange-600 font-medium mt-1">
            Low Stock
          </p>
        )}
      </div>
    </div>
  )
} 