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
  invoiceId?: string
  strikeInvoiceId?: string
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
  invoiceId?: string  // Strike invoice ID
  expirationTime?: Date  // From Strike API
  config?: PaymentMonitoringConfig
  onStatusUpdate?: (update: PaymentStatusUpdate) => void
  onPaymentComplete?: (transactionId: string) => void
  onPaymentFailed?: (error: BitAgoraError) => void
  onInvoiceGenerated?: () => void  // Called when Lightning invoice is created
}

const DEFAULT_CONFIG: PaymentMonitoringConfig = {
  timeoutMs: 15 * 60 * 1000, // 15 minutes (Strike default)
  maxRetries: 3,
  retryIntervalMs: 2000, // 2 seconds
  heartbeatIntervalMs: 5000, // 5 seconds (reduce rate limiting)
  autoCleanup: true
}

export const usePaymentStatus = ({
  paymentId,
  paymentMethod,
  invoiceId,
  expirationTime,
  config = DEFAULT_CONFIG,
  onStatusUpdate,
  onPaymentComplete,
  onPaymentFailed,
  onInvoiceGenerated
}: UsePaymentStatusProps) => {
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [lastUpdate, setLastUpdate] = useState<PaymentStatusUpdate | null>(null)
  const [error, setError] = useState<BitAgoraError | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  
  // CRITICAL FIX: Track completion state to prevent multiple callbacks
  const [hasCompleted, setHasCompleted] = useState(false)
  const [generatedTransactionId, setGeneratedTransactionId] = useState<string | null>(null)
  
  // CRITICAL FIX: Use refs to track monitoring state across renders
  const isMonitoringRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const currentInvoiceRef = useRef<string | undefined>(undefined)
  
  const monitoringConfig = { ...DEFAULT_CONFIG, ...config }
  const [currentPollingInterval, setCurrentPollingInterval] = useState(monitoringConfig.heartbeatIntervalMs || 3000)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
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
      invoiceId,
      ...additionalData
    }
  }, [paymentId, invoiceId])

  // CRITICAL FIX: Aggressive cleanup function
  const cleanupAllTimers = useCallback(() => {
    console.log('🧹 AGGRESSIVE CLEANUP: Clearing all timers and stopping monitoring')
    
    // Clear all possible timer references
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current)
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Update all state flags
    setIsMonitoring(false)
    isMonitoringRef.current = false
    
    console.log('✅ All timers cleared and monitoring stopped')
  }, [])

  // Enhanced status update with immediate callbacks and completion handling
  const updateStatus = useCallback((
    newStatus: PaymentStatus,
    message?: string,
    additionalData?: Partial<PaymentStatusUpdate>
  ) => {
    const update = createStatusUpdate(newStatus, message, additionalData)
    
    console.log(`📊 Status update: ${newStatus} - ${message || 'No message'}`)
    
    setStatus(newStatus)
    setLastUpdate(update)
    
    // Call external callback
    onStatusUpdate?.(update)
    
    // CRITICAL FIX: Handle completion immediately and prevent multiple calls
    if (newStatus === 'completed' && !hasCompletedRef.current) {
      console.log('🎉 PAYMENT COMPLETED - IMMEDIATE PROCESSING')
      
      // Set completion flags immediately
      hasCompletedRef.current = true
      setHasCompleted(true)
      
      // Stop all monitoring immediately
      cleanupAllTimers()
      
      if (update.transactionId && onPaymentComplete) {
        console.log('📞 CALLING onPaymentComplete callback with transactionId:', update.transactionId)
        try {
          onPaymentComplete(update.transactionId)
          console.log('✅ Payment completion callback executed successfully')
        } catch (error) {
          console.error('❌ Error calling completion callback:', error)
        }
      } else {
        console.warn('⚠️ Missing transaction ID or callback for completion')
      }
    }
    
    // Handle failure states
    if (['failed', 'expired', 'cancelled'].includes(newStatus)) {
      console.log(`❌ Payment ${newStatus}: ${message}`)
      cleanupAllTimers()
      if (error && onPaymentFailed) {
        onPaymentFailed(error)
      }
    }
  }, [createStatusUpdate, onStatusUpdate, onPaymentComplete, onPaymentFailed, error, cleanupAllTimers, hasCompleted])

  // Check Strike invoice status with comprehensive error handling
  const checkStrikeInvoiceStatus = useCallback(async (): Promise<PaymentStatusUpdate> => {
    if (!invoiceId) {
      throw new BitAgoraError(
        BitAgoraErrorType.PAYMENT_ERROR,
        'Missing Strike invoice ID for status check'
      )
    }

    // CRITICAL: Check if already completed to prevent redundant calls
    if (hasCompletedRef.current) {
      console.log('⚠️ Skipping status check - payment already completed')
      return createStatusUpdate('completed', 'Payment already completed', {
        transactionId: generatedTransactionId || undefined
      })
    }

    // Validate invoice ID format
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(invoiceId)) {
      throw new BitAgoraError(
        BitAgoraErrorType.PAYMENT_ERROR,
        'Invalid Strike invoice ID format'
      )
    }

    try {
      console.log(`🔍 Checking Strike invoice status: ${invoiceId}`)
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`/api/lightning/status/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Handle different HTTP error codes specifically
      if (!response.ok) {
        let errorMessage: string
        let errorType: BitAgoraErrorType
        
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid invoice ID provided'
            errorType = BitAgoraErrorType.PAYMENT_ERROR
            break
          case 404:
            errorMessage = 'Invoice not found - may have been deleted'
            errorType = BitAgoraErrorType.PAYMENT_ERROR
            break
          case 429:
            errorMessage = 'Rate limit exceeded - too many requests'
            errorType = BitAgoraErrorType.NETWORK_ERROR
            break
          case 500:
          case 502:
          case 503:
            errorMessage = 'Strike API temporarily unavailable'
            errorType = BitAgoraErrorType.NETWORK_ERROR
            break
          default:
            errorMessage = `Strike API error: ${response.status} ${response.statusText}`
            errorType = BitAgoraErrorType.NETWORK_ERROR
        }
        
        throw new BitAgoraError(errorType, errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          'Invalid response format from Strike API'
        )
      }

      // Validate response structure
      if (!data || typeof data.state !== 'string') {
        throw new BitAgoraError(
          BitAgoraErrorType.PAYMENT_ERROR,
          'Invalid response structure from Strike API'
        )
      }
      
      // Map Strike invoice states to our payment statuses
      let paymentStatus: PaymentStatus
      let message: string
      let transactionId: string | undefined
      
      switch (data.state) {
        case 'UNPAID':
          paymentStatus = 'waiting'
          message = 'Scan QR code to pay'
          break
          
        case 'PAID':
          console.log('🎉 Strike API detected PAID status! Processing completion...')
          paymentStatus = 'completed'
          message = 'Payment successful!'
          
          // CRITICAL FIX: Generate transaction ID only once
          if (!generatedTransactionId) {
            const newTransactionId = `strike_${invoiceId.split('-')[0]}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
            setGeneratedTransactionId(newTransactionId)
            transactionId = newTransactionId
            console.log(`💰 Generated NEW transaction ID: ${transactionId}`)
          } else {
            transactionId = generatedTransactionId
            console.log(`💰 Reusing existing transaction ID: ${transactionId}`)
          }
          break
          
        case 'CANCELLED':
          paymentStatus = 'cancelled'
          message = 'Payment was cancelled'
          break
          
        case 'EXPIRED':
          paymentStatus = 'expired'
          message = 'Payment expired'
          break
          
        default:
          paymentStatus = 'failed'
          message = `Unknown payment state: ${data.state}`
          console.warn(`⚠️ Unexpected Strike invoice state: ${data.state}`)
      }

      return createStatusUpdate(paymentStatus, message, {
        transactionId,
        strikeInvoiceId: invoiceId
      })
      
    } catch (error) {
      console.error('Strike invoice status check failed:', error)
      
      let bitAgoraError: BitAgoraError
      
      if (error instanceof BitAgoraError) {
        bitAgoraError = error
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        bitAgoraError = new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          'Request timeout - Strike API taking too long to respond'
        )
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        bitAgoraError = new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          'Network connection failed - check your internet connection'
        )
      } else {
        bitAgoraError = new BitAgoraError(
          BitAgoraErrorType.PAYMENT_ERROR,
          'Failed to check Strike invoice status'
        )
      }
      
      setError(bitAgoraError)
      
      return createStatusUpdate('failed', bitAgoraError.message, {
        errorDetails: bitAgoraError.message
      })
    }
  }, [invoiceId, createStatusUpdate, generatedTransactionId, setGeneratedTransactionId])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    console.log('🛑 STOPPING payment monitoring')
    cleanupAllTimers()
    setTimeRemaining(null)
  }, [cleanupAllTimers])

  // Set up countdown timer using Strike expiration time
  const setupExpirationTimer = useCallback(() => {
    if (!expirationTime) return

    const updateTimer = () => {
      const now = Date.now()
      const expiry = expirationTime.getTime()
      const remaining = Math.max(0, expiry - now)
      
      setTimeRemaining(remaining)
      
      // Check if expired
      if (remaining <= 0) {
        console.log('⏰ Lightning invoice expired')
        updateStatus('expired', 'Lightning invoice expired')
        stopMonitoring()
      }
    }

    // Update immediately
    updateTimer()
    
    // Set up interval to update every second
    timerRef.current = setInterval(updateTimer, 1000)
    
    // Set up timeout to stop monitoring when expired
    const timeUntilExpiry = expirationTime.getTime() - Date.now()
    if (timeUntilExpiry > 0) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Lightning invoice timeout reached')
        updateStatus('expired', 'Lightning invoice expired')
        stopMonitoring()
      }, timeUntilExpiry)
    }
  }, [expirationTime, updateStatus, stopMonitoring])

  // Start monitoring payment status - ONLY for Lightning payments with Strike API invoices
  const startMonitoring = useCallback(() => {
    // CRITICAL: Only monitor if we have a Strike invoice ID and it's Lightning payment
    if (!invoiceId || paymentMethod !== 'lightning') {
      console.log('🚫 Monitoring not started: No Strike invoice ID or not Lightning payment')
      return
    }

    // CRITICAL: Prevent multiple monitoring sessions
    if (isMonitoringRef.current || hasCompletedRef.current) {
      console.log('🚫 Monitoring already running or payment completed')
      return
    }

    console.log(`🔄 Starting Lightning payment monitoring for Strike invoice: ${invoiceId}`)
    
    // CRITICAL: Set all flags immediately
    isMonitoringRef.current = true
    setIsMonitoring(true)
    currentInvoiceRef.current = invoiceId
    setError(null)
    setRetryCount(0)
    setGeneratedTransactionId(null) // Reset for new session
    setHasCompleted(false)
    hasCompletedRef.current = false
    
    // Mark invoice as generated and start waiting for payment
    updateStatus('waiting', 'Lightning invoice generated. Scan QR code to pay.')
    
    // Call the invoice generated callback
    onInvoiceGenerated?.()
    
    // Set up expiration timer
    setupExpirationTimer()
    
    // Set up heartbeat monitoring
    const monitorHeartbeat = async () => {
      // CRITICAL: Check monitoring state before proceeding
      if (!isMonitoringRef.current || hasCompletedRef.current) {
        console.log('🛑 Monitoring stopped - aborting heartbeat')
        return
      }
      
      try {
        const statusUpdate = await checkStrikeInvoiceStatus()
        
        // CRITICAL: Check again after async operation
        if (!isMonitoringRef.current || hasCompletedRef.current) {
          console.log('🛑 Monitoring stopped during status check - aborting')
          return
        }
        
        updateStatus(statusUpdate.status, statusUpdate.message, statusUpdate)
        
        // Reset polling interval on successful response
        if (currentPollingInterval !== monitoringConfig.heartbeatIntervalMs!) {
          setCurrentPollingInterval(monitoringConfig.heartbeatIntervalMs!)
        }
        
        // CRITICAL: Stop monitoring immediately on terminal states
        if (['completed', 'failed', 'expired', 'cancelled'].includes(statusUpdate.status)) {
          console.log(`✅ Lightning payment ${statusUpdate.status} - TERMINATING MONITORING`)
          return // Exit immediately - cleanup handled by updateStatus
        }
        
        // Schedule next poll only if still monitoring
        if (isMonitoringRef.current && !hasCompletedRef.current) {
          heartbeatRef.current = setTimeout(monitorHeartbeat, currentPollingInterval)
        }
        
      } catch (error) {
        console.error('Lightning payment monitoring error:', error)
        
        // Check if still monitoring after error
        if (!isMonitoringRef.current || hasCompletedRef.current) {
          console.log('🛑 Monitoring stopped - skipping error retry')
          return
        }
        
        if (retryCount < monitoringConfig.maxRetries!) {
          const isRateLimit = error instanceof Error && error.message.includes('429')
          const baseDelay = isRateLimit ? 10000 : 1000
          const backoffDelay = Math.min(baseDelay * Math.pow(2, retryCount), 60000)
          
          setCurrentPollingInterval(backoffDelay)
          setRetryCount(prev => prev + 1)
          
          const errorType = isRateLimit ? 'Rate Limited' : 'Network Error'
          console.log(`🔄 ${errorType} - Retry ${retryCount + 1}/${monitoringConfig.maxRetries} with ${backoffDelay}ms delay`)
          updateStatus('waiting', `${errorType} - Retrying in ${Math.round(backoffDelay/1000)}s... (${retryCount + 1}/${monitoringConfig.maxRetries})`)
          
          if (isMonitoringRef.current && !hasCompletedRef.current) {
            heartbeatRef.current = setTimeout(monitorHeartbeat, backoffDelay)
          }
          
        } else {
          console.log('❌ Lightning payment monitoring failed after maximum retries')
          updateStatus('failed', 'Payment monitoring failed after maximum retries')
        }
      }
    }
    
    // Start monitoring immediately
    monitorHeartbeat()
    
  }, [invoiceId, paymentMethod, setupExpirationTimer, checkStrikeInvoiceStatus, updateStatus, onInvoiceGenerated, retryCount, monitoringConfig, currentPollingInterval])

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

  // Mark invoice as generated (called from QR generation)
  const markInvoiceGenerated = useCallback(() => {
    console.log('✅ Lightning invoice generated successfully')
    updateStatus('waiting', 'Lightning invoice generated. Scan QR code to pay.')
  }, [updateStatus])

  // CRITICAL FIX: Monitor invoice ID changes and restart monitoring
  useEffect(() => {
    console.log('🔥 INVOICE_ID_WATCHER: Effect triggered')
    console.log('🔥 Current invoiceId:', invoiceId)
    console.log('🔥 Previous invoiceId:', currentInvoiceRef.current)
    console.log('🔥 Is monitoring:', isMonitoringRef.current)
    
    // If invoice ID changed, restart monitoring
    if (invoiceId && invoiceId !== currentInvoiceRef.current) {
      console.log('🔄 INVOICE ID CHANGED - RESTARTING MONITORING')
      
      // Force cleanup of previous session
      cleanupAllTimers()
      setHasCompleted(false)
      hasCompletedRef.current = false
      setGeneratedTransactionId(null)
      
      // Start monitoring with new invoice
      setTimeout(() => {
        startMonitoring()
      }, 100) // Small delay to ensure cleanup completes
    }
    
    currentInvoiceRef.current = invoiceId
  }, [invoiceId, startMonitoring, cleanupAllTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringConfig.autoCleanup) {
        console.log('🧹 Component unmounting - cleaning up payment monitoring')
        cleanupAllTimers()
        setTimeRemaining(null)
        setHasCompleted(false)
        hasCompletedRef.current = false
        isMonitoringRef.current = false
        setGeneratedTransactionId(null)
        console.log('✅ Payment monitoring cleanup completed')
      }
    }
  }, [monitoringConfig.autoCleanup, cleanupAllTimers])

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
    markInvoiceGenerated,
    
    // Helpers
    isPaymentPending,
    isPaymentComplete,
    isPaymentFailed,
    canRetry,
    
    // Config
    config: monitoringConfig
  }
} 