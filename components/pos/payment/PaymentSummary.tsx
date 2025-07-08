// /components/pos/payment/PaymentSummary.tsx
// Reusable payment summary component

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      'lightning': { name: 'Bitcoin Lightning', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
      'bitcoin': { name: 'Bitcoin', icon: '₿', color: 'bg-orange-100 text-orange-800' },
      'usdt-eth': { name: 'USDT (Ethereum)', icon: '💰', color: 'bg-green-100 text-green-800' },
      'usdt-tron': { name: 'USDT (Tron)', icon: '💰', color: 'bg-green-100 text-green-800' },
      'qr-code': { name: 'QR Payment', icon: '📱', color: 'bg-blue-100 text-blue-800' },
      'cash': { name: 'Cash', icon: '💵', color: 'bg-gray-100 text-gray-800' },
      'stripe': { name: 'Credit Card', icon: '💳', color: 'bg-purple-100 text-purple-800' }
    }
    
    return methodInfo[selectedMethod as keyof typeof methodInfo] || null
  }
  
  const methodInfo = getPaymentMethodInfo()

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Payment Summary</span>
          {methodInfo && (
            <Badge className={cn("text-xs", methodInfo.color)}>
              <span className="mr-1">{methodInfo.icon}</span>
              {paymentMethodName || methodInfo.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items */}
        {showItemDetails && cartItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
            <div className="space-y-1">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {/* Tax Information */}
          {taxCalculation && taxConfig && taxCalculation.totalTax > 0 && (
            <div className="space-y-1">
              {/* Primary Tax */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {taxCalculation.breakdown.primaryTaxName} ({(taxCalculation.taxRate * 100).toFixed(1)}%)
                </span>
                <span>{formatCurrency(taxCalculation.breakdown.primaryTaxAmount)}</span>
              </div>
              
              {/* Secondary Tax (if applicable) */}
              {taxCalculation.breakdown.secondaryTaxName && taxCalculation.breakdown.secondaryTaxAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {taxCalculation.breakdown.secondaryTaxName} ({(taxCalculation.secondaryTaxRate * 100).toFixed(1)}%)
                  </span>
                  <span>{formatCurrency(taxCalculation.breakdown.secondaryTaxAmount)}</span>
                </div>
              )}
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        </div>
        
        {/* Payment Method Info */}
        {selectedMethod && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                {methodInfo && <span>{methodInfo.icon}</span>}
                <span className="font-medium">
                  Payment Method: {paymentMethodName || methodInfo?.name || selectedMethod}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {getPaymentMethodDescription(selectedMethod)}
              </p>
            </div>
          </div>
        )}
        
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • 
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total quantity
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to get payment method descriptions
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