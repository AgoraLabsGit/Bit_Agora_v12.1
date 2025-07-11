// /components/pos/payment/PaymentStatusBar.tsx
// Horizontal payment status bar for checkout flow

"use client"

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Clock, 
  Loader2,
  Zap,
  XCircle
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { PaymentStatus } from '@/app/pos/hooks/use-payment-status'

interface StatusStep {
  id: string
  label: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed' | 'failed'
}

interface PaymentStatusBarProps {
  paymentStatus: PaymentStatus
  paymentMethod?: string
  timeRemaining?: number | null
  className?: string
}

export const PaymentStatusBar = ({
  paymentStatus,
  paymentMethod,
  timeRemaining,
  className
}: PaymentStatusBarProps) => {
  const [steps, setSteps] = useState<StatusStep[]>([])

  // Define payment progression steps
  const defineSteps = (status: PaymentStatus): StatusStep[] => {
    const baseSteps: StatusStep[] = [
      {
        id: 'invoice',
        label: 'Invoice Generated',
        icon: <CheckCircle className="h-4 w-4" />,
        status: 'pending'
      },
      {
        id: 'waiting',
        label: 'Awaiting Payment',
        icon: <Clock className="h-4 w-4" />,
        status: 'pending'
      },
      {
        id: 'received',
        label: 'Payment Received',
        icon: <CheckCircle className="h-4 w-4" />,
        status: 'pending'
      }
    ]

    // Update step statuses based on payment status
    switch (status) {
      case 'idle':
        return baseSteps

      case 'initializing':
        baseSteps[0].status = 'active'
        baseSteps[0].icon = <Loader2 className="h-4 w-4 animate-spin" />
        return baseSteps

      case 'waiting':
        baseSteps[0].status = 'completed'
        baseSteps[1].status = 'active'
        baseSteps[1].icon = <Loader2 className="h-4 w-4 animate-spin" />
        return baseSteps

      case 'confirming':
      case 'processing':
        // Show confirming as an active awaiting payment state
        baseSteps[0].status = 'completed'
        baseSteps[1].status = 'active'
        baseSteps[1].icon = <Zap className="h-4 w-4 animate-pulse" />
        baseSteps[1].label = 'Confirming Payment'
        return baseSteps

      case 'completed':
        baseSteps[0].status = 'completed'
        baseSteps[1].status = 'completed'
        baseSteps[2].status = 'completed'
        return baseSteps

      case 'failed':
      case 'expired':
      case 'cancelled':
        // Mark the appropriate step as failed
        baseSteps[0].status = 'completed' // Invoice was generated
        baseSteps[1].status = 'failed'
        baseSteps[1].icon = <XCircle className="h-4 w-4" />
        return baseSteps

      default:
        return baseSteps
    }
  }

  // Update steps when payment status changes
  useEffect(() => {
    setSteps(defineSteps(paymentStatus))
  }, [paymentStatus])

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      'lightning': '⚡',
      'bitcoin': '₿',
      'usdt-eth': '$',
      'usdt-tron': '$',
      'qr-code': '📱',
      'cash': '💵'
    }
    return icons[method as keyof typeof icons] || '💳'
  }

  return (
    <div className={cn("border-t bg-background/50 p-6 rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {paymentMethod && (
            <span className="text-sm">
              {getPaymentMethodIcon(paymentMethod)}
            </span>
          )}
          <span className="text-sm font-medium text-foreground">
            Payment Status
          </span>
        </div>
        
        {timeRemaining && timeRemaining > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress Steps - Wider with better spacing */}
      <div className="flex items-center justify-between relative px-2">
        {/* Progress Line */}
        <div className="absolute top-6 left-8 right-8 h-1 bg-muted rounded-full z-0" />
        
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed'
          const isActive = step.status === 'active'
          const isFailed = step.status === 'failed'
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center max-w-[80px]">
              {/* Step Circle - Larger with better green indicators */}
              <div className={cn(
                "w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300 shadow-lg",
                isCompleted && "bg-green-500 border-green-400 text-white shadow-green-200",
                isActive && "bg-primary border-primary text-white animate-pulse shadow-primary/30",
                isFailed && "bg-red-500 border-red-400 text-white shadow-red-200",
                !isCompleted && !isActive && !isFailed && "bg-background border-muted text-muted-foreground shadow-muted/50"
              )}>
                <div className={cn(
                  "transition-all duration-300",
                  isCompleted && "scale-110",
                  isActive && "scale-105"
                )}>
                  {step.icon}
                </div>
              </div>
              
              {/* Step Label - Better spacing */}
              <div className={cn(
                "text-xs text-center transition-colors duration-300 px-1 leading-tight",
                isCompleted && "text-green-600 font-semibold",
                isActive && "text-primary font-semibold",
                isFailed && "text-red-600 font-semibold",
                !isCompleted && !isActive && !isFailed && "text-muted-foreground"
              )}>
                {step.label}
              </div>
            </div>
          )
        })}
        
        {/* Animated Progress Line - Enhanced with green color */}
        <div 
          className="absolute top-6 left-8 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 z-0 shadow-sm"
          style={{ 
            width: `${Math.min((steps.filter(s => s.status === 'completed').length / Math.max(steps.length - 1, 1)) * 100, 100)}%` 
          }}
        />
      </div>

      {/* Status Message - Enhanced */}
      {paymentStatus !== 'idle' && (
        <div className="mt-4 text-center">
          <div className={cn(
            "text-sm px-4 py-2 rounded-full inline-block font-medium shadow-sm",
            paymentStatus === 'completed' && "bg-green-100 text-green-800 border border-green-200",
            ['failed', 'expired', 'cancelled'].includes(paymentStatus) && "bg-red-100 text-red-800 border border-red-200",
            ['waiting', 'confirming', 'processing'].includes(paymentStatus) && "bg-blue-100 text-blue-800 border border-blue-200",
            paymentStatus === 'initializing' && "bg-yellow-100 text-yellow-800 border border-yellow-200"
          )}>
            {paymentStatus === 'initializing' && 'Generating invoice...'}
            {paymentStatus === 'waiting' && 'Scan QR code to pay'}
            {paymentStatus === 'confirming' && 'Payment detected, confirming...'}
            {paymentStatus === 'processing' && 'Processing payment...'}
            {paymentStatus === 'completed' && 'Payment successful!'}
            {paymentStatus === 'failed' && 'Payment failed'}
            {paymentStatus === 'expired' && 'Payment expired'}
            {paymentStatus === 'cancelled' && 'Payment cancelled'}
          </div>
        </div>
      )}
    </div>
  )
} 