// /components/pos/payment/PaymentSummary.tsx
// Reusable payment summary component

"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CartItem } from '@/app/pos/types/product'
import { TaxCalculationResult, TaxConfiguration } from '@/lib/tax-calculation'

interface PaymentSummaryProps {
  amount: number
  cartItems: CartItem[]
  selectedMethod?: string | null
  paymentMethodName?: string
  taxCalculation?: TaxCalculationResult
  taxConfig?: TaxConfiguration
  showItemDetails?: boolean
  className?: string
}

export const PaymentSummary = ({
  amount,
  cartItems,
  selectedMethod,
  paymentMethodName,
  taxCalculation,
  taxConfig,
  showItemDetails = true,
  className
}: PaymentSummaryProps) => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  
  // Get payment method display info
  const getPaymentMethodInfo = () => {
    if (!selectedMethod) return null
    
    const methodInfo = {
      'lightning': { name: 'Lightning', icon: '⚡', description: 'Instant Bitcoin payments via Lightning Network' },
      'bitcoin': { name: 'Bitcoin', icon: '₿', description: 'Bitcoin on-chain transaction' },
      'usdt-eth': { name: 'USDT (ETH)', icon: '$', description: 'USDT stablecoin on Ethereum network' },
      'usdt-tron': { name: 'USDT (TRX)', icon: '$', description: 'USDT stablecoin on Tron network' },
      'qr-code': { name: 'QR Payment', icon: '📱', description: 'Scan QR code with your mobile payment app' },
      'cash': { name: 'Cash', icon: '💵', description: 'Cash payment with register' },
      'stripe': { name: 'Credit Card', icon: '💳', description: 'Credit or debit card payment' }
    }
    
    return methodInfo[selectedMethod as keyof typeof methodInfo] || null
  }
  
  const methodInfo = getPaymentMethodInfo()
  const totalItems = cartItems.length
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={cn("h-full flex flex-col min-h-0", className)}>
      {/* Header - Centered */}
      <div className="mb-4 text-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Payment Summary</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {/* Cart Items Section */}
        {showItemDetails && cartItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              ITEMS
            </h4>
          <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {item.quantity}×
                    </span>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Separator between items and calculations */}
        {showItemDetails && cartItems.length > 0 && (
          <Separator className="my-4" />
        )}
        
        {/* Pricing Breakdown Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          
          {/* Tax Information */}
          {taxCalculation && taxConfig && taxCalculation.totalTax > 0 && (
            <div className="space-y-2">
              {/* Primary Tax */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">
                  {taxCalculation.breakdown.primaryTaxName} ({(taxCalculation.taxRate * 100).toFixed(1)}%)
                </span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(taxCalculation.breakdown.primaryTaxAmount)}</span>
              </div>
              
              {/* Secondary Tax (if applicable) */}
              {taxCalculation.breakdown.secondaryTaxName && taxCalculation.breakdown.secondaryTaxAmount && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">
                    {taxCalculation.breakdown.secondaryTaxName} ({(taxCalculation.secondaryTaxRate * 100).toFixed(1)}%)
                  </span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(taxCalculation.breakdown.secondaryTaxAmount)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Separator before total */}
        <Separator className="my-4" />
          
        {/* Total Section - Enhanced */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(amount)}</span>
          </div>
        </div>
        
        {/* Payment Method Info - Simplified and Smaller */}
        {selectedMethod && methodInfo && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm">{methodInfo.icon}</span>
            <span className="text-xs font-medium text-foreground text-center">
              {methodInfo.name}
                </span>
          </div>
        )}
        
        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {totalItems} item{totalItems !== 1 ? 's' : ''} • {totalQuantity} total quantity
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get payment method descriptions (kept for compatibility)
const getPaymentMethodDescription = (method: string) => {
  const descriptions = {
    'lightning': 'Instant Bitcoin payments via Lightning Network',
    'bitcoin': 'Bitcoin on-chain transaction',
    'usdt-eth': 'USDT stablecoin on Ethereum network',
    'usdt-tron': 'USDT stablecoin on Tron network',
    'qr-code': 'Scan QR code with your mobile payment app',
    'cash': 'Cash payment with register',
    'stripe': 'Credit or debit card payment'
  }
  
  return descriptions[method as keyof typeof descriptions] || 'Payment processing'
} 