// /components/pos/payment/CardPaymentFlow.tsx
// Future card payment implementation

"use client"

import { Button } from "@/components/ui/button"

interface CardPaymentFlowProps {
  amount: number
  cartItems: any[]
  onPaymentComplete: () => void
  onBack: () => void
}

export const CardPaymentFlow = ({
  amount,
  onBack
}: CardPaymentFlowProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <p className="text-lg font-medium">Credit Card Payment</p>
        <p className="text-muted-foreground">Coming Soon - Phase 3</p>
        <p className="text-sm text-muted-foreground mt-2">
          Stripe integration will be available in the next release
        </p>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        Back to Payment Selection
      </Button>
    </div>
  )
} 