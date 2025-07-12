/**
 * Bitcoin Payment Status Hook
 * Test Lab Development - Isolated from Production
 * 
 * React hook for monitoring Bitcoin payment status with real-time updates
 * Similar to usePaymentStatus but specifically for Bitcoin blockchain monitoring
 */

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { BitcoinPaymentStatus, BitcoinAddressInfo } from '../types/bitcoin-monitoring'

export interface UseBitcoinStatusProps {
  address?: string
  expectedAmount?: number // in satoshis
  usdAmount?: number
  autoStart?: boolean
  onPaymentReceived?: (status: BitcoinPaymentStatus) => void
  onPaymentConfirmed?: (status: BitcoinPaymentStatus) => void
  onPaymentFailed?: (error: string) => void
  onStatusUpdate?: (status: BitcoinPaymentStatus) => void
}

export interface BitcoinStatusHookReturn {
  status: BitcoinPaymentStatus | null
  isMonitoring: boolean
  error: string | null
  addressInfo: BitcoinAddressInfo | null
  startMonitoring: () => Promise<void>
  stopMonitoring: () => void
  checkAddress: () => Promise<void>
  retry: () => Promise<void>
}

export const useBitcoinStatus = ({
  address,
  expectedAmount,
  usdAmount,
  autoStart = false,
  onPaymentReceived,
  onPaymentConfirmed,
  onPaymentFailed,
  onStatusUpdate
}: UseBitcoinStatusProps): BitcoinStatusHookReturn => {
  const [status, setStatus] = useState<BitcoinPaymentStatus | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressInfo, setAddressInfo] = useState<BitcoinAddressInfo | null>(null)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousStatusRef = useRef<string | null>(null)

  /**
   * Start monitoring Bitcoin address
   */
  const startMonitoring = useCallback(async () => {
    if (!address || !expectedAmount) {
      setError('Address and expected amount are required')
      return
    }

    try {
      setIsMonitoring(true)
      setError(null)
      
      console.log(`🧪 Test Lab: Starting Bitcoin monitoring for ${address}`)
      
      // Start monitoring via API
      const response = await fetch('/api/testlab/bitcoin/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          expectedAmount,
          usdAmount,
          config: {
            targetConfirmations: 1,
            pollInterval: 30000, // 30 seconds
            timeout: 1800000 // 30 minutes
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to start monitoring: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start monitoring')
      }

      setStatus(result.data.status)
      console.log('✅ Test Lab: Bitcoin monitoring started successfully')
      
      // Start polling for status updates
      startPolling()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Test Lab: Bitcoin monitoring start error:', errorMessage)
      setError(errorMessage)
      setIsMonitoring(false)
      onPaymentFailed?.(errorMessage)
    }
  }, [address, expectedAmount, usdAmount, onPaymentFailed])

  /**
   * Stop monitoring Bitcoin address
   */
  const stopMonitoring = useCallback(() => {
    if (!address) return

    console.log(`🧪 Test Lab: Stopping Bitcoin monitoring for ${address}`)
    
    setIsMonitoring(false)
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Stop monitoring via API
    fetch(`/api/testlab/bitcoin/stop/${address}`, {
      method: 'POST',
    }).catch(err => {
      console.error('❌ Test Lab: Bitcoin monitoring stop error:', err)
    })
  }, [address])

  /**
   * Check Bitcoin address (one-time check)
   */
  const checkAddress = useCallback(async () => {
    if (!address) {
      setError('Address is required')
      return
    }

    try {
      setError(null)
      
      console.log(`🧪 Test Lab: Checking Bitcoin address ${address}`)
      
      const response = await fetch(`/api/testlab/bitcoin/check/${address}`)
      
      if (!response.ok) {
        throw new Error(`Failed to check address: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check address')
      }

      setAddressInfo(result.data.addressInfo)
      console.log('✅ Test Lab: Bitcoin address checked successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Test Lab: Bitcoin address check error:', errorMessage)
      setError(errorMessage)
    }
  }, [address])

  /**
   * Retry failed monitoring
   */
  const retry = useCallback(async () => {
    setError(null)
    await startMonitoring()
  }, [startMonitoring])

  /**
   * Start polling for status updates
   */
  const startPolling = useCallback(() => {
    if (!address || pollingIntervalRef.current) return

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/testlab/bitcoin/status/${address}`)
        
        if (!response.ok) {
          // If monitoring session not found, stop polling
          if (response.status === 404) {
            stopMonitoring()
            return
          }
          throw new Error(`Status check failed: ${response.status}`)
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to get status')
        }

        const newStatus = result.data.status
        setStatus(newStatus)
        
        // Call status update callback
        onStatusUpdate?.(newStatus)
        
        // Check for status changes
        if (previousStatusRef.current !== newStatus.status) {
          console.log(`🧪 Test Lab: Bitcoin status changed: ${previousStatusRef.current} → ${newStatus.status}`)
          
          // Call appropriate callbacks
          if (newStatus.status === 'unconfirmed' && previousStatusRef.current === 'pending') {
            onPaymentReceived?.(newStatus)
          } else if (newStatus.status === 'confirmed') {
            onPaymentConfirmed?.(newStatus)
            stopMonitoring() // Stop monitoring after confirmation
          } else if (newStatus.status === 'failed') {
            onPaymentFailed?.('Payment failed or timed out')
            stopMonitoring()
          }
          
          previousStatusRef.current = newStatus.status
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Test Lab: Bitcoin status polling error:', errorMessage)
        setError(errorMessage)
      }
    }, 30000) // Poll every 30 seconds
  }, [address, onStatusUpdate, onPaymentReceived, onPaymentConfirmed, onPaymentFailed, stopMonitoring])

  /**
   * Auto-start monitoring if enabled
   */
  useEffect(() => {
    if (autoStart && address && expectedAmount && !isMonitoring) {
      startMonitoring()
    }
  }, [autoStart, address, expectedAmount, isMonitoring, startMonitoring])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    status,
    isMonitoring,
    error,
    addressInfo,
    startMonitoring,
    stopMonitoring,
    checkAddress,
    retry
  }
} 