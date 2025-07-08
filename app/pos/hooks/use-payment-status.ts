"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { BitAgoraError, BitAgoraErrorType } from '@/lib/errors'

export type PaymentStatus = 
  | 'idle'
  | 'initializing'
  | 'waiting'
  | 'confirming'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled'

export interface PaymentStatusUpdate {
  status: PaymentStatus
  message?: string
  timestamp: number
  transactionId?: string
  paymentId?: string
  errorDetails?: string
  progressPercentage?: number
}

export interface PaymentMonitoringConfig {
  timeoutMs?: number
  maxRetries?: number
  retryIntervalMs?: number
  heartbeatIntervalMs?: number
  autoCleanup?: boolean
}

export interface UsePaymentStatusProps {
  paymentId?: string
  paymentMethod?: string
  config?: PaymentMonitoringConfig
  onStatusUpdate?: (update: PaymentStatusUpdate) => void
  onPaymentComplete?: (transactionId: string) => void
  onPaymentFailed?: (error: BitAgoraError) => void
}

const DEFAULT_CONFIG: PaymentMonitoringConfig = {
  timeoutMs: 10 * 60 * 1000, // 10 minutes
  maxRetries: 3,
  retryIntervalMs: 2000, // 2 seconds
  heartbeatIntervalMs: 5000, // 5 seconds
  autoCleanup: true
}

export const usePaymentStatus = ({
  paymentId,
  paymentMethod,
  config = DEFAULT_CONFIG,
  onStatusUpdate,
  onPaymentComplete,
  onPaymentFailed
}: UsePaymentStatusProps) => {
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [lastUpdate, setLastUpdate] = useState<PaymentStatusUpdate | null>(null)
  const [error, setError] = useState<BitAgoraError | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  
  const monitoringConfig = { ...DEFAULT_CONFIG, ...config }
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  
  // Create status update with timestamp
  const createStatusUpdate = useCallback((
    newStatus: PaymentStatus,
    message?: string,
    additionalData?: Partial<PaymentStatusUpdate>
  ): PaymentStatusUpdate => {
    return {
      status: newStatus,
      message,
      timestamp: Date.now(),
      paymentId,
      ...additionalData
    }
  }, [paymentId])

  // Update status with proper state management
  const updateStatus = useCallback((
    newStatus: PaymentStatus,
    message?: string,
    additionalData?: Partial<PaymentStatusUpdate>
  ) => {
    const update = createStatusUpdate(newStatus, message, additionalData)
    
    setStatus(newStatus)
    setLastUpdate(update)
    
    // Call external callback
    onStatusUpdate?.(update)
    
    // Handle completion states
    if (newStatus === 'completed' && update.transactionId) {
      onPaymentComplete?.(update.transactionId)
    }
    
    if (newStatus === 'failed' && error) {
      onPaymentFailed?.(error)
    }
  }, [createStatusUpdate, onStatusUpdate, onPaymentComplete, onPaymentFailed, error])

  // Simulate payment status checking (mock implementation)
  const checkPaymentStatus = useCallback(async (): Promise<PaymentStatusUpdate> => {
    if (!paymentId || !paymentMethod) {
      throw new BitAgoraError(
        BitAgoraErrorType.PAYMENT_ERROR,
        'Missing payment ID or method'
      )
    }

    try {
      // Simulate API call to check payment status
      const response = await fetch(`/api/payment-status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          `Payment status check failed: ${response.status}`
        )
      }

      const data = await response.json()
      
      // Mock different payment statuses based on time (for demonstration)
      const elapsedTime = Date.now() - (lastUpdate?.timestamp || Date.now())
      
      let mockStatus: PaymentStatus
      let mockMessage: string
      let mockTransactionId: string | undefined
      
      if (elapsedTime < 5000) {
        mockStatus = 'waiting'
        mockMessage = 'Waiting for payment confirmation...'
      } else if (elapsedTime < 10000) {
        mockStatus = 'confirming'
        mockMessage = 'Payment detected, confirming...'
      } else if (elapsedTime < 15000) {
        mockStatus = 'processing'
        mockMessage = 'Processing payment...'
      } else if (Math.random() > 0.2) { // 80% success rate
        mockStatus = 'completed'
        mockMessage = 'Payment completed successfully!'
        mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } else {
        mockStatus = 'failed'
        mockMessage = 'Payment failed. Please try again.'
      }

      return createStatusUpdate(mockStatus, mockMessage, {
        transactionId: mockTransactionId,
        progressPercentage: mockStatus === 'processing' ? 75 : undefined
      })
      
    } catch (error) {
      console.error('Payment status check failed:', error)
      
      const bitAgoraError = error instanceof BitAgoraError 
        ? error 
        : new BitAgoraError(
            BitAgoraErrorType.PAYMENT_ERROR,
            'Failed to check payment status'
          )
      
      setError(bitAgoraError)
      
      return createStatusUpdate('failed', bitAgoraError.message, {
        errorDetails: bitAgoraError.message
      })
    }
  }, [paymentId, paymentMethod, lastUpdate, createStatusUpdate])

  // Start monitoring payment status
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !paymentId) return

    setIsMonitoring(true)
    setError(null)
    setRetryCount(0)
    
    updateStatus('initializing', 'Starting payment monitoring...')
    
    // Set up timeout
    if (monitoringConfig.timeoutMs) {
      timeoutRef.current = setTimeout(() => {
        updateStatus('expired', 'Payment timeout expired')
        stopMonitoring()
      }, monitoringConfig.timeoutMs)
      
      // Update time remaining
      const updateTimer = () => {
        const remaining = monitoringConfig.timeoutMs! - (Date.now() - (lastUpdate?.timestamp || Date.now()))
        setTimeRemaining(Math.max(0, remaining))
      }
      
      updateTimer()
      const timerInterval = setInterval(updateTimer, 1000)
      
      // Cleanup timer on unmount
      return () => clearInterval(timerInterval)
    }
    
    // Set up heartbeat monitoring
    const monitorHeartbeat = async () => {
      try {
        const statusUpdate = await checkPaymentStatus()
        updateStatus(statusUpdate.status, statusUpdate.message, statusUpdate)
        
        // Stop monitoring if payment is complete or failed
        if (['completed', 'failed', 'expired', 'cancelled'].includes(statusUpdate.status)) {
          stopMonitoring()
        }
        
      } catch (error) {
        console.error('Payment monitoring error:', error)
        
        if (retryCount < monitoringConfig.maxRetries!) {
          setRetryCount(prev => prev + 1)
          updateStatus('waiting', `Retrying... (${retryCount + 1}/${monitoringConfig.maxRetries})`)
        } else {
          updateStatus('failed', 'Payment monitoring failed after maximum retries')
          stopMonitoring()
        }
      }
    }
    
    // Start immediate check
    monitorHeartbeat()
    
    // Set up recurring checks
    heartbeatRef.current = setInterval(monitorHeartbeat, monitoringConfig.heartbeatIntervalMs!)
    
  }, [isMonitoring, paymentId, monitoringConfig, updateStatus, checkPaymentStatus, retryCount])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    
    setTimeRemaining(null)
  }, [])

  // Cancel payment
  const cancelPayment = useCallback(() => {
    updateStatus('cancelled', 'Payment cancelled by user')
    stopMonitoring()
  }, [updateStatus, stopMonitoring])

  // Retry payment
  const retryPayment = useCallback(() => {
    if (retryCount >= monitoringConfig.maxRetries!) {
      return false
    }
    
    setError(null)
    setRetryCount(prev => prev + 1)
    updateStatus('waiting', 'Retrying payment...')
    
    return true
  }, [retryCount, monitoringConfig.maxRetries, updateStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringConfig.autoCleanup) {
        stopMonitoring()
      }
    }
  }, [stopMonitoring, monitoringConfig.autoCleanup])

  // Helper functions
  const isPaymentPending = ['initializing', 'waiting', 'confirming', 'processing'].includes(status)
  const isPaymentComplete = status === 'completed'
  const isPaymentFailed = ['failed', 'expired', 'cancelled'].includes(status)
  const canRetry = isPaymentFailed && retryCount < monitoringConfig.maxRetries!
  
  return {
    // State
    status,
    lastUpdate,
    error,
    isMonitoring,
    retryCount,
    timeRemaining,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    cancelPayment,
    retryPayment,
    
    // Helpers
    isPaymentPending,
    isPaymentComplete,
    isPaymentFailed,
    canRetry,
    
    // Config
    config: monitoringConfig
  }
} 