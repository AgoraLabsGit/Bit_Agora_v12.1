// /components/pos/payment/CashPaymentFlow.tsx
// Cash payment handling with immediate modal

"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CashTenderingModal } from '@/components/ui/cash-tendering-modal'

interface CashPaymentFlowProps {
  amount: number
  cartItems: any[]
  onPaymentComplete: (transactionData?: {
    transactionId: string
    paymentMethod: string
    paymentStatus: string
    amountTendered?: number
    change?: number
  }) => void
  onBack: () => void
}

export const CashPaymentFlow = ({
  amount,
  cartItems,
  onPaymentComplete,
  onBack
}: CashPaymentFlowProps) => {
  const [showCashModal, setShowCashModal] = useState(true) // Open immediately

  const handleCashPaymentComplete = async (amountTendered: number, change: number) => {
    try {
      // Create transaction record
      const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total: amount,
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          amountTendered,
          change,
          transactionId
        })
      })
      
      setShowCashModal(false)
      onPaymentComplete({
        transactionId,
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        amountTendered,
        change
      })
      
    } catch (error) {
      console.error('Error completing cash payment:', error)
    }
  }

  const handleCashModalClose = () => {
    setShowCashModal(false)
    onBack()
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <p className="text-lg font-medium">Cash Payment</p>
        <p className="text-muted-foreground">Amount: ${amount.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Cash register is opening...
        </p>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        Cancel Cash Payment
      </Button>

      <CashTenderingModal
        isOpen={showCashModal}
        onClose={handleCashModalClose}
        totalAmount={amount}
        onPaymentComplete={handleCashPaymentComplete}
        currency="USD"
      />
    </div>
  )
} 