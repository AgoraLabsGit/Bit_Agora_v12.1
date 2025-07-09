// /components/pos/payment/CryptoPaymentFlow.tsx
// Focused crypto payment handling with proper amount conversion

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { CryptoQRCode } from '@/components/ui/crypto-qr-code'
import { PaymentStatusIndicator } from '@/components/pos/payment/PaymentStatusIndicator'
import { usePaymentStatus } from '@/app/pos/hooks/use-payment-status'
import { generateCryptoQR, QRGenerationResult, validateQRResult } from '@/lib/payment/qr-generation'

interface CryptoPaymentFlowProps {
  method: string
  amount: number
  cartItems: any[]
  paymentSettings: any
  onPaymentComplete: (transactionData?: {
    transactionId: string
    paymentMethod: string
    paymentStatus: string
    amountTendered?: number
    change?: number
  }) => void
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
  const [qrData, setQRData] = useState<QRGenerationResult | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrError, setQRError] = useState<string | null>(null)
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
      setTimeout(() => {
        onPaymentComplete({
          transactionId,
          paymentMethod: method,
          paymentStatus: 'completed'
        })
      }, 2000)
    },
    onPaymentFailed: (error) => {
      console.error('Crypto payment failed:', error)
    }
  })

  // Generate crypto QR code with proper amount conversion
  useEffect(() => {
    const generateQR = async () => {
      if (!paymentSettings) return

      setIsGeneratingQR(true)
      setQRError(null)

      try {
        console.log('🔥 Generating QR for:', method, 'USD amount:', amount)
        
        const result = await generateCryptoQR(method, amount)

        if (result && validateQRResult(result)) {
          setQRData(result)
          console.log('✅ QR generated successfully:', {
            method: method,
            usdAmount: amount,
            cryptoAmount: result.conversionResult?.cryptoAmount,
            formattedAmount: result.conversionResult?.formattedAmount,
            exchangeRate: result.conversionResult?.exchangeRate
          })
        } else {
          const errorMsg = result?.error || 'Failed to generate QR code'
          setQRError(errorMsg)
          console.error('❌ QR generation failed:', errorMsg)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setQRError(errorMsg)
        console.error('❌ QR generation error:', error)
      } finally {
        setIsGeneratingQR(false)
      }
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

  const formatCryptoAmount = (qrData: QRGenerationResult) => {
    if (!qrData.conversionResult) return 'N/A'
    
    return qrData.conversionResult.formattedAmount
  }

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'lightning':
        return 'Lightning Network'
      case 'bitcoin':
        return 'Bitcoin'
      case 'usdt-eth':
        return 'USDT (Ethereum)'
      case 'usdt-tron':
        return 'USDT (Tron)'
      default:
        return method
    }
  }

  return (
    <div className="space-y-4">
      {/* Payment Amount Display */}
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-white mb-2">
          ${amount.toFixed(2)} USD
        </div>
        {qrData && (
          <div className="text-sm text-slate-300">
            ≈ {formatCryptoAmount(qrData)}
            {qrData.conversionResult?.exchangeRate && qrData.conversionResult.exchangeRate > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                Rate: ${qrData.conversionResult.exchangeRate.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* QR Code Generation Status */}
      {isGeneratingQR && (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-300">Generating QR code...</span>
        </div>
      )}

      {/* QR Generation Error */}
      {qrError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-2">❌</div>
            <div>
              <div className="text-red-400 font-semibold">QR Generation Error</div>
              <div className="text-red-300 text-sm">{qrError}</div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrData && qrData.isValid && (
        <div>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {getMethodDisplayName(method)} Payment
            </h3>
            <p className="text-sm text-slate-300">
              Scan with your {getMethodDisplayName(method)} wallet
            </p>
          </div>
          
          <CryptoQRCode
            paymentMethod={method}
            address={qrData.address}
            amount={amount}
            qrContent={qrData.qrContent}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        
        {!showStatusMonitoring && qrData && qrData.isValid ? (
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