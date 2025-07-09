// /components/pos/payment/PaymentModal.tsx
// Single-page payment modal with parent-child categories and flow routing for payment processing

"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CryptoPaymentFlow } from './CryptoPaymentFlow'
import { QRCodePaymentFlow } from './QRCodePaymentFlow'
import { CashPaymentFlow } from './CashPaymentFlow'
import { PaymentSummary } from './PaymentSummary'
import { usePaymentSettings } from '@/hooks/use-payment-settings'
import { CartItem } from '@/app/pos/types/product'
import { TaxCalculationResult, TaxConfiguration } from '@/lib/tax-calculation'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  cartItems: CartItem[]
  onPaymentComplete?: () => void
  taxCalculation?: TaxCalculationResult
  taxConfig?: TaxConfiguration
}

type PaymentFlow = 'selection' | 'crypto' | 'qr' | 'cash'

export const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  cartItems,
  onPaymentComplete,
  taxCalculation,
  taxConfig
}: PaymentModalProps) => {
  const [currentFlow, setCurrentFlow] = useState<PaymentFlow>('selection')
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  
  const { paymentSettings, qrProviders, paymentOptions, isLoading } = usePaymentSettings()

  // Reset to selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentFlow('selection')
      setSelectedMethod(null)
    }
  }, [isOpen])

  // Handle method selection (stay in selection mode for inline QR display)
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    // Stay in selection mode - don't route to flows yet
  }

  // Handle cash payment (route to cash flow immediately)
  const handleCashPayment = () => {
    setSelectedMethod('cash')
    setCurrentFlow('cash')
  }

  // Handle actual payment initiation (now route to appropriate flow)
  const handleStartPayment = () => {
    if (!selectedMethod) return
    
    // Route to appropriate flow for payment processing
    // Crypto methods stay inline - no routing needed
    if (selectedMethod === 'qr-code' || qrProviders.some(p => p.id === selectedMethod)) {
      setCurrentFlow('qr')
    }
  }

  // Handle payment completion
  const handlePaymentComplete = () => {
    onPaymentComplete?.()
    onClose()
  }

  // Handle back navigation
  const handleBack = () => {
    setCurrentFlow('selection')
    setSelectedMethod(null)
  }

  // Get current flow title
  const getFlowTitle = () => {
    switch (currentFlow) {
      case 'selection':
        return 'Payment Checkout'
      case 'crypto':
        return 'Crypto Payment'
      case 'qr':
        return 'QR Code Payment'
      case 'cash':
        return 'Cash Payment'
      default:
        return 'Payment'
    }
  }

  // Get selected method name
  const getSelectedMethodName = () => {
    if (!selectedMethod) return null
    const option = paymentOptions.find(opt => opt.id === selectedMethod)
    return option?.name || selectedMethod
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{getFlowTitle()}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(90vh-120px)]">
          {/* Left Column - Payment Selection and QR Display OR Flow */}
          <div className="lg:col-span-2 p-6 bg-background overflow-y-auto max-h-full">
            {currentFlow === 'selection' && (
              <PaymentMethodSelector
                paymentOptions={paymentOptions}
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                onCashPayment={handleCashPayment}
                paymentSettings={paymentSettings}
                qrProviders={qrProviders}
                amount={amount}
                isLoading={isLoading}
              />
            )}

            {currentFlow === 'crypto' && selectedMethod && paymentSettings && (
              <CryptoPaymentFlow
                method={selectedMethod}
                amount={amount}
                cartItems={cartItems}
                paymentSettings={paymentSettings}
                onPaymentComplete={handlePaymentComplete}
                onBack={handleBack}
              />
            )}

            {currentFlow === 'qr' && (
              <QRCodePaymentFlow
                amount={amount}
                cartItems={cartItems}
                qrProviders={qrProviders}
                onPaymentComplete={handlePaymentComplete}
                onBack={handleBack}
              />
            )}

            {currentFlow === 'cash' && (
              <CashPaymentFlow
                amount={amount}
                cartItems={cartItems}
                onPaymentComplete={handlePaymentComplete}
                onBack={handleBack}
              />
            )}
          </div>

          {/* Right Column - Payment Summary (Full-Height Grey Background) */}
          <div className="lg:col-span-1 bg-muted/20 border-l border-border p-6 min-h-full flex items-start justify-center">
            <div className="w-full max-w-sm">
              <PaymentSummary
                amount={amount}
                cartItems={cartItems}
                selectedMethod={selectedMethod}
                paymentMethodName={getSelectedMethodName() || undefined}
                taxCalculation={taxCalculation}
                taxConfig={taxConfig}
                showItemDetails={true}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {currentFlow === 'selection' ? (
                selectedMethod ? `${getSelectedMethodName()} selected` : 'Select a payment method'
              ) : (
                `Processing ${getSelectedMethodName()} payment`
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentFlow === 'selection' && (
                // Only show Start Payment for QR code methods that need routing
                // Crypto methods work inline, cash routes immediately
                selectedMethod && 
                (selectedMethod === 'qr-code' || qrProviders.some(p => p.id === selectedMethod)) && (
                  <Button 
                    onClick={handleStartPayment}
                    className="min-w-[120px]"
                  >
                    Start Payment
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 