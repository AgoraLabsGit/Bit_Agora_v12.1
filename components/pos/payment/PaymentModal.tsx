// /components/pos/payment/PaymentModal.tsx
// Main orchestration modal - keeps only high-level state and routing

"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CryptoPaymentFlow } from './CryptoPaymentFlow'
import { QRCodePaymentFlow } from './QRCodePaymentFlow'
import { CashPaymentFlow } from './CashPaymentFlow'
import { CardPaymentFlow } from './CardPaymentFlow'
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

type PaymentFlow = 'selection' | 'crypto' | 'qr' | 'cash' | 'card'
type PaymentMethod = 'lightning' | 'bitcoin' | 'usdt-eth' | 'usdt-tron' | 'qr-code' | 'stripe' | 'cash'

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  
  const { paymentSettings, qrProviders, paymentOptions, isLoading } = usePaymentSettings()

  // Reset to selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentFlow('selection')
      setSelectedMethod(null)
    }
  }, [isOpen])

  // Handle payment method selection
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method as PaymentMethod)
    
    // Route to appropriate flow
    switch (method) {
      case 'lightning':
      case 'bitcoin':
      case 'usdt-eth':
      case 'usdt-tron':
        setCurrentFlow('crypto')
        break
      case 'qr-code':
        setCurrentFlow('qr')
        break
      case 'cash':
        setCurrentFlow('cash')
        break
      case 'stripe':
        setCurrentFlow('card')
        break
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
        return 'Select Payment Method'
      case 'crypto':
        return 'Crypto Payment'
      case 'qr':
        return 'QR Code Payment'
      case 'cash':
        return 'Cash Payment'
      case 'card':
        return 'Card Payment'
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
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{getFlowTitle()}</h2>
            {selectedMethod && (
              <span className="text-sm text-muted-foreground">
                • {getSelectedMethodName()}
              </span>
            )}
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
        <div className="flex h-[calc(90vh-80px)]">
          {/* Main Flow Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentFlow === 'selection' && (
              <PaymentMethodSelector
                paymentOptions={paymentOptions}
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
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

            {currentFlow === 'card' && (
              <CardPaymentFlow
                amount={amount}
                cartItems={cartItems}
                onPaymentComplete={handlePaymentComplete}
                onBack={handleBack}
              />
            )}
          </div>

          {/* Payment Summary Sidebar */}
          <div className="w-80 border-l bg-muted/20 p-6 overflow-y-auto">
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

        {/* Footer */}
        {currentFlow === 'selection' && (
          <div className="border-t p-6 bg-muted/20">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {paymentOptions.length} payment method{paymentOptions.length !== 1 ? 's' : ''} available
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedMethod && handleMethodSelect(selectedMethod)}
                  disabled={!selectedMethod}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 