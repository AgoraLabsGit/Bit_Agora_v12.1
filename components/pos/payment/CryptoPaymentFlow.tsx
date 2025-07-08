// /components/pos/payment/CryptoPaymentFlow.tsx
// Focused crypto payment handling

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { CryptoQRCode } from '@/components/ui/crypto-qr-code'
import { PaymentStatusIndicator } from './PaymentStatusIndicator'
import { usePaymentStatus } from '@/app/pos/hooks/use-payment-status'

interface CryptoPaymentFlowProps {
  method: string
  amount: number
  cartItems: any[]
  paymentSettings: any
  onPaymentComplete: () => void
  onBack: () => void
}

export const CryptoPaymentFlow = ({
  method,
  amount,
  cartItems,
  paymentSettings,
  onPaymentComplete,
  onBack
}: CryptoPaymentFlowProps) => {
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null)
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null)
  const [showStatusMonitoring, setShowStatusMonitoring] = useState(false)

  const {
    status,
    lastUpdate,
    isMonitoring,
    timeRemaining,
    retryCount,
    startMonitoring,
    stopMonitoring,
    cancelPayment,
    retryPayment,
    isPaymentPending,
    isPaymentComplete,
    canRetry
  } = usePaymentStatus({
    paymentId: currentPaymentId || undefined,
    paymentMethod: method,
    onPaymentComplete: async (transactionId) => {
      await createTransactionRecord(transactionId)
      setTimeout(onPaymentComplete, 2000)
    },
    onPaymentFailed: (error) => {
      console.error('Crypto payment failed:', error)
    }
  })

  // Generate crypto QR code
  useEffect(() => {
    const generateQR = async () => {
      if (!paymentSettings) return

      let address = ''
      let qrContent = ''
      
      switch (method) {
        case 'lightning':
          address = paymentSettings.bitcoinLightningAddress || ''
          qrContent = address
          break
        case 'bitcoin':
          address = paymentSettings.bitcoinWalletAddress || ''
          const btcAmount = (amount / 100000000).toFixed(8)
          qrContent = `bitcoin:${address}?amount=${btcAmount}`
          break
        case 'usdt-eth':
          address = paymentSettings.usdtEthereumWalletAddress || ''
          qrContent = `ethereum:${address}?amount=${amount}&token=0xdac17f958d2ee523a2206206994597c13d831ec7`
          break
        case 'usdt-tron':
          address = paymentSettings.usdtTronWalletAddress || ''
          qrContent = `tron:${address}?amount=${amount}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
          break
      }
      
      setPaymentAddress(address)
      setPaymentQRCode(qrContent)
    }

    generateQR()
  }, [method, amount, paymentSettings])

  const handleStartPayment = () => {
    const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCurrentPaymentId(paymentId)
    setShowStatusMonitoring(true)
    startMonitoring()
  }

  const handleCancel = () => {
    if (isPaymentPending) cancelPayment()
    stopMonitoring()
    onBack()
  }

  const createTransactionRecord = async (transactionId: string) => {
    // Transaction creation logic
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        total: amount,
        paymentMethod: method,
        paymentStatus: 'completed',
        transactionId
      })
    })
    return response.json()
  }

  return (
    <div className="space-y-4">
      {/* Payment Status Monitoring */}
      {showStatusMonitoring && (
        <PaymentStatusIndicator
          status={status}
          lastUpdate={lastUpdate}
          isMonitoring={isMonitoring}
          timeRemaining={timeRemaining}
          retryCount={retryCount}
          maxRetries={3}
          onRetry={retryPayment}
          onCancel={handleCancel}
        />
      )}

      {/* QR Code Display */}
      {paymentQRCode && paymentAddress && (
        <CryptoQRCode
          paymentMethod={method}
          address={paymentAddress}
          amount={amount}
          qrContent={paymentQRCode}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        
        {!showStatusMonitoring ? (
          <Button onClick={handleStartPayment} className="flex-1">
            Start Payment
          </Button>
        ) : (
          <Button 
            onClick={handleCancel} 
            disabled={isPaymentPending}
            className="flex-1"
          >
            {isPaymentComplete ? 'Complete' : 'Cancel'}
          </Button>
        )}
      </div>
    </div>
  )
} 