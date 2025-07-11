// /components/pos/payment/PaymentModal.tsx
// Single-page payment modal with parent-child categories and flow routing for payment processing

"use client"

import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { X, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { QRCodePaymentFlow } from './QRCodePaymentFlow'
import { CashPaymentFlow } from './CashPaymentFlow'
import { PaymentSummary } from './PaymentSummary'
import { usePaymentSettings } from '@/hooks/use-payment-settings'
import { CartItem } from '@/app/pos/types/product'
import { TaxCalculationResult, TaxConfiguration } from '@/lib/tax-calculation'
import { usePaymentStatus } from '@/app/pos/hooks/use-payment-status'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  cartItems: CartItem[]
  onPaymentComplete?: (transactionData?: {
    transactionId: string
    paymentMethod: string
    paymentStatus: string
    amountTendered?: number
    change?: number
  }) => void
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
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [showStatusMonitor, setShowStatusMonitor] = useState(false)
  const [paymentState, setPaymentState] = useState<{
    completed: boolean
    transaction: any
  }>({
    completed: false,
    transaction: null
  })
  
  const { paymentSettings, qrProviders, paymentOptions, isLoading } = usePaymentSettings()
  
  // Payment status monitoring
  const [lightningInvoiceData, setLightningInvoiceData] = useState<any>(null)
  
  // Create stable callback for payment completion
  const handlePaymentComplete = useCallback((transactionId: string) => {
    console.log('🎉 PaymentModal: handlePaymentComplete called with transactionId:', transactionId)
    console.log('🎉 PaymentModal: selectedMethod:', selectedMethod)
    console.log('🎉 PaymentModal: paymentState.completed:', paymentState.completed)
    
    const transactionData = {
      transactionId,
      paymentMethod: selectedMethod || 'unknown',
      paymentStatus: 'completed'
    }
    
    console.log('🎉 PaymentModal: Setting payment state to completed with transaction data:', transactionData)
    
    // Force immediate state update to ensure overlay shows immediately
    flushSync(() => {
      setPaymentState({
        completed: true,
        transaction: transactionData
      })
    })
    
    console.log('🎉 PaymentModal: Payment state updated - overlay should now be visible')
    
    // After a longer delay, trigger the external completion callback to allow users to see the success overlay
    setTimeout(() => {
      try {
        console.log('🎉 PaymentModal: Calling external onPaymentComplete callback')
        if (onPaymentComplete) {
          onPaymentComplete(transactionData)
        }
        
        console.log('🎉 PaymentModal: Closing modal')
        onClose()
        
      } catch (error) {
        console.error('❌ Error in completion callback:', error)
        // Force close anyway
        onClose()
      }
    }, 3000) // Increased delay to allow users to see the success overlay
  }, [selectedMethod, onPaymentComplete, onClose])

  const {
    status: paymentStatus,
    lastUpdate,
    isMonitoring,
    timeRemaining,
    startMonitoring,
    stopMonitoring,
    isPaymentComplete,
    isPaymentPending,
    markInvoiceGenerated
  } = usePaymentStatus({
    paymentId: paymentId || undefined,
    paymentMethod: selectedMethod || undefined,
    invoiceId: lightningInvoiceData?.invoiceId,
    expirationTime: lightningInvoiceData?.expires ? new Date(lightningInvoiceData.expires) : undefined,
    onPaymentComplete: handlePaymentComplete,
    onPaymentFailed: (error) => {
      console.error('Payment failed:', error)
      setShowStatusMonitor(false)
    },
    onInvoiceGenerated: () => {
      console.log('✅ Invoice generated callback triggered')
    }
  })

  // Reset to selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentFlow('selection')
      setSelectedMethod(null)
      setPaymentId(null)
      setShowStatusMonitor(false)
      setPaymentState({
        completed: false,
        transaction: null
      })
      setLightningInvoiceData(null)
      stopMonitoring()
    }
  }, [isOpen, stopMonitoring])

  // CRITICAL FIX: Start monitoring ONLY when Lightning invoice is generated
  useEffect(() => {
    // Only start monitoring for Lightning payments with valid Strike invoice
    if (lightningInvoiceData?.invoiceId && selectedMethod === 'lightning' && !isMonitoring) {
      console.log('⚡ Starting Lightning payment monitoring for invoice:', lightningInvoiceData.invoiceId)
      
      // Small delay to ensure React has processed the state updates
      setTimeout(() => {
        startMonitoring()
      }, 50)
    }
  }, [lightningInvoiceData?.invoiceId, selectedMethod, isMonitoring, startMonitoring])

  // Handle method selection (keep all methods in selection for inline display)
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    
    // For crypto methods, prepare payment monitoring (but don't start yet)
    if (method === 'lightning' || method === 'bitcoin' || method === 'usdt') {
      const newPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setPaymentId(newPaymentId)
      setShowStatusMonitor(true)
      // DON'T start monitoring here - wait for invoice to be generated
    }
    
    // All crypto methods (including Lightning) stay in selection mode for inline QR display
    // This allows users to see all payment options and switch between them
  }

  // Handle fiat payment method selection - placeholder for Test Lab
  const handleFiatPayment = (method: string) => {
    console.log('🧪 Fiat payment placeholder:', method)
    // Test Lab: This would route to fiat payment flows
  }

  // Handle cash payment (route to cash flow immediately)
  const handleCashPayment = () => {
    setSelectedMethod('cash')
    setCurrentFlow('cash')
  }

  // Handle actual payment initiation (now route to appropriate flow)
  const handleStartPayment = () => {
    if (!selectedMethod) return
    
    // Generate payment ID and start monitoring
    const newPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setPaymentId(newPaymentId)
    setShowStatusMonitor(true)
    
    // Route to appropriate flow for payment processing
    // Crypto methods stay inline - no routing needed
    if (selectedMethod === 'qr-code' || qrProviders.some(p => p.id === selectedMethod)) {
      setCurrentFlow('qr')
    }
  }





  // Handle back navigation
  const handleBack = () => {
    setCurrentFlow('selection')
    setSelectedMethod(null)
    setShowStatusMonitor(false)
    stopMonitoring()
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
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1"></div>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">{getFlowTitle()}</h2>
          </div>
          <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(85vh-130px)] relative">
          {/* Payment Success Overlay */}
          {paymentState.completed && (
            <div className="absolute inset-0 bg-green-600/95 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-green-100 mb-4">
                  Transaction ID: {paymentState.transaction?.transactionId?.slice(-8)}...
                </p>
                <p className="text-green-200 text-sm">
                  Generating receipt...
                </p>
              </div>
            </div>
          )}
          
          {/* Left Column - Payment Selection and QR Display OR Flow */}
          <div className="lg:col-span-2 p-6 bg-background overflow-y-auto max-h-full">
            {currentFlow === 'selection' && (
              <PaymentMethodSelector
                paymentOptions={paymentOptions}
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                onCashPayment={handleCashPayment}
                onFiatPayment={handleFiatPayment}
                paymentSettings={paymentSettings}
                qrProviders={qrProviders}
                amount={amount}
                isLoading={isLoading}
                paymentStatus={paymentStatus}
                timeRemaining={timeRemaining}
                showPaymentStatus={showStatusMonitor}
                onLightningInvoiceGenerated={(invoiceData) => {
                  console.log('⚡ Lightning invoice generated:', invoiceData?.invoiceId)
                  setLightningInvoiceData(invoiceData)
                  
                  // The useEffect above will handle starting monitoring when invoice data is available
                }}
              />
            )}

            {currentFlow === 'qr' && (
              <QRCodePaymentFlow
                amount={amount}
                cartItems={cartItems}
                qrProviders={qrProviders}
                onPaymentComplete={onPaymentComplete || (() => {})}
                onBack={() => setCurrentFlow('selection')}
              />
            )}

            {currentFlow === 'cash' && (
              <CashPaymentFlow
                amount={amount}
                cartItems={cartItems}
                onPaymentComplete={onPaymentComplete || (() => {})}
                onBack={() => setCurrentFlow('selection')}
              />
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1 border-l bg-muted/30 p-6 overflow-y-auto max-h-full">
            <PaymentSummary
              cartItems={cartItems}
              amount={amount}
              selectedMethod={selectedMethod}
              paymentMethodName={paymentOptions.find(opt => opt.id === selectedMethod)?.name}
              taxCalculation={taxCalculation}
              taxConfig={taxConfig}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 pb-6 bg-muted/20">
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
              
              {currentFlow === 'selection' && (
                // Only show Start Payment for QR code methods that need routing
                // Crypto methods work inline, cash routes immediately
                selectedMethod && 
                (selectedMethod === 'qr-code' || qrProviders.some(p => p.id === selectedMethod)) && (
                  <Button 
                    onClick={handleStartPayment}
                    size="sm"
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