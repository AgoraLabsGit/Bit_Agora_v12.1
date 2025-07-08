// /components/pos/payment/PaymentModalWrapper.tsx
// Main entry point with error boundary for modular payment system

"use client"

import React from 'react'
import { PaymentModal } from './PaymentModal'
import { CartItem } from '@/app/pos/types/product'
import { TaxCalculationResult, TaxConfiguration } from '@/lib/tax-calculation'

interface PaymentModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  cartItems: CartItem[]
  onPaymentComplete?: () => void
  taxCalculation?: TaxCalculationResult
  taxConfig?: TaxConfiguration
}

// Simple Error Boundary Component
class PaymentErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment Modal Error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Payment System Error</h2>
              <p className="text-muted-foreground mb-4">
                Something went wrong with the payment system.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const PaymentModalWrapper = (props: PaymentModalWrapperProps) => {
  if (!props.isOpen) return null

  return (
    <PaymentErrorBoundary
      onError={(error) => {
        console.error('Payment Modal Error:', error)
      }}
    >
      <PaymentModal {...props} />
    </PaymentErrorBoundary>
  )
} 