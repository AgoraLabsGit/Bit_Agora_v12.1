"use client"

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  Zap,
  RefreshCw,
  Timer
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PaymentStatus, PaymentStatusUpdate } from '@/app/pos/hooks/use-payment-status'

interface PaymentStatusIndicatorProps {
  status: PaymentStatus
  lastUpdate: PaymentStatusUpdate | null
  isMonitoring: boolean
  timeRemaining?: number | null
  retryCount?: number
  maxRetries?: number
  onRetry?: () => void
  onCancel?: () => void
  className?: string
}

export const PaymentStatusIndicator = ({
  status,
  lastUpdate,
  isMonitoring,
  timeRemaining,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onCancel,
  className
}: PaymentStatusIndicatorProps) => {
  const [progress, setProgress] = useState(0)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Update progress based on status
  useEffect(() => {
    let targetProgress = 0
    
    switch (status) {
      case 'idle':
        targetProgress = 0
        break
      case 'initializing':
        targetProgress = 10
        break
      case 'waiting':
        targetProgress = 25
        break
      case 'confirming':
        targetProgress = 50
        break
      case 'processing':
        targetProgress = lastUpdate?.progressPercentage || 75
        break
      case 'completed':
        targetProgress = 100
        break
      case 'failed':
      case 'expired':
      case 'cancelled':
        targetProgress = 0
        break
      default:
        targetProgress = 0
    }
    
    // Animate progress change
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress)
        }
        if (prev > targetProgress) {
          return Math.max(prev - 2, targetProgress)
        }
        clearInterval(interval)
        return prev
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [status, lastUpdate])

  // Pulse animation for active states
  useEffect(() => {
    if (['waiting', 'confirming', 'processing'].includes(status)) {
      setPulseAnimation(true)
      const pulseInterval = setInterval(() => {
        setPulseAnimation(prev => !prev)
      }, 1000)
      
      return () => clearInterval(pulseInterval)
    } else {
      setPulseAnimation(false)
    }
  }, [status])

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <Clock className="h-6 w-6 text-muted-foreground" />,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-muted',
          title: 'Ready to Pay',
          description: 'Select payment method to continue'
        }
      case 'initializing':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          title: 'Initializing Payment',
          description: 'Setting up payment process...'
        }
      case 'waiting':
        return {
          icon: <Timer className="h-6 w-6 text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Waiting for Payment',
          description: 'Complete payment using your selected method'
        }
      case 'confirming':
        return {
          icon: <Zap className="h-6 w-6 text-yellow-500" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Confirming Payment',
          description: 'Payment detected, confirming transaction...'
        }
      case 'processing':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          title: 'Processing Payment',
          description: 'Processing your payment, please wait...'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Completed',
          description: 'Payment processed successfully!'
        }
      case 'failed':
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          description: 'Payment could not be processed'
        }
      case 'expired':
        return {
          icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Payment Expired',
          description: 'Payment session has expired'
        }
      case 'cancelled':
        return {
          icon: <XCircle className="h-6 w-6 text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Payment Cancelled',
          description: 'Payment was cancelled by user'
        }
      default:
        return {
          icon: <Clock className="h-6 w-6 text-muted-foreground" />,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-muted',
          title: 'Unknown Status',
          description: 'Payment status unknown'
        }
    }
  }

  const config = getStatusConfig()
  const isPending = ['waiting', 'confirming', 'processing'].includes(status)
  const isComplete = status === 'completed'
  const isFailed = ['failed', 'expired', 'cancelled'].includes(status)
  const canRetry = isFailed && retryCount < maxRetries

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn(
      "transition-all duration-300",
      config.borderColor,
      pulseAnimation && "animate-pulse",
      className
    )}>
      <CardContent className="p-6">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full transition-colors",
              config.bgColor
            )}>
              {config.icon}
            </div>
            <div>
              <h3 className={cn("text-lg font-semibold", config.color)}>
                {config.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lastUpdate?.message || config.description}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant={isComplete ? "default" : isFailed ? "destructive" : "secondary"}
            className="capitalize"
          >
            {status}
          </Badge>
        </div>

        {/* Progress Bar */}
        {(isPending || isComplete) && (
          <div className="mb-4">
                          <Progress 
                value={progress} 
                className={cn(
                  "h-2",
                  isComplete ? "[&>div]:bg-green-500" : "[&>div]:bg-primary"
                )}
              />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Progress: {Math.round(progress)}%</span>
              {timeRemaining && timeRemaining > 0 && (
                <span>Time left: {formatTimeRemaining(timeRemaining)}</span>
              )}
            </div>
          </div>
        )}

        {/* Transaction Details */}
        {lastUpdate && (
          <div className="space-y-2 mb-4">
            {lastUpdate.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">{lastUpdate.transactionId}</span>
              </div>
            )}
            
            {lastUpdate.paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-xs">{lastUpdate.paymentId}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="text-xs">
                {new Date(lastUpdate.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Retry Information */}
        {retryCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <RefreshCw className="h-4 w-4" />
              <span>Retry attempt {retryCount} of {maxRetries}</span>
            </div>
          </div>
        )}

        {/* Error Details */}
        {isFailed && lastUpdate?.errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {lastUpdate.errorDetails}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          {isPending && onCancel && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel Payment
            </Button>
          )}
          
          {canRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 