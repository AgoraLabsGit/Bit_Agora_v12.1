// /components/pos/payment/QRCodePaymentFlow.tsx
// User-uploaded QR code payment handling

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { PaymentStatusIndicator } from './PaymentStatusIndicator'
import { usePaymentStatus } from '@/app/pos/hooks/use-payment-status'

interface QRCodePaymentFlowProps {
  amount: number
  cartItems: any[]
  qrProviders: any[]
  onPaymentComplete: (transactionData?: {
    transactionId: string
    paymentMethod: string
    paymentStatus: string
    amountTendered?: number
    change?: number
  }) => void
  onBack: () => void
}

export const QRCodePaymentFlow = ({
  amount,
  cartItems,
  qrProviders,
  onPaymentComplete,
  onBack
}: QRCodePaymentFlowProps) => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null)
  const [showStatusMonitoring, setShowStatusMonitoring] = useState(false)

  const {
    status,
    lastUpdate,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    isPaymentComplete
  } = usePaymentStatus({
    paymentId: currentPaymentId || undefined,
    paymentMethod: 'qr-code',
    onPaymentComplete: async (transactionId) => {
      await createTransactionRecord(transactionId)
      setTimeout(() => {
        onPaymentComplete({
          transactionId,
          paymentMethod: 'qr-code',
          paymentStatus: 'completed'
        })
      }, 2000)
    }
  })

  useEffect(() => {
    const enabledProviders = qrProviders.filter(p => p.enabled)
    
    if (enabledProviders.length > 0) {
      // Prioritize providers that have QR code image data
      const providersWithImages = enabledProviders.filter(p => p.qrCodeImageData)
      
      if (providersWithImages.length > 0) {
        setSelectedProvider(providersWithImages[0])
      } else {
        // Fall back to any enabled provider
        setSelectedProvider(enabledProviders[0])
      }
    }
  }, [qrProviders])

  const handleStartPayment = () => {
    const paymentId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCurrentPaymentId(paymentId)
    setShowStatusMonitoring(true)
    startMonitoring()
  }

  const createTransactionRecord = async (transactionId: string) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        total: amount,
        paymentMethod: 'qr-code',
        paymentStatus: 'completed',
        transactionId
      })
    })
    return response.json()
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  if (!selectedProvider) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No QR providers configured</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to Selection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Payment Status */}
      {showStatusMonitoring && (
        <PaymentStatusIndicator
          status={status}
          lastUpdate={lastUpdate}
          isMonitoring={isMonitoring}
          onCancel={() => {
            stopMonitoring()
            onBack()
          }}
        />
      )}

      {/* Provider Selection */}
      {qrProviders.filter(p => p.enabled && p.qrCodeImageData).length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select QR Provider:</label>
          <div className="flex gap-2">
            {qrProviders.filter(p => p.enabled && p.qrCodeImageData).map(provider => (
              <Button
                key={provider.id}
                variant={selectedProvider?.id === provider.id ? "default" : "outline"}
                onClick={() => setSelectedProvider(provider)}
                className="flex-1"
              >
                {provider.customName || provider.providerName}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="bg-background rounded-lg border border-border p-4 text-center">
        <h4 className="text-sm font-medium mb-3">
          {selectedProvider.customName || selectedProvider.providerName}
        </h4>
        
        {selectedProvider.qrCodeImageData ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={selectedProvider.qrCodeImageData} 
                alt={`${selectedProvider.providerName} QR Code`}
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Scan with mobile payment app</p>
              <p className="font-medium">Amount: {formatCurrency(amount)}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>No QR code image available</p>
            <p>Please configure QR provider in settings</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        
        {!showStatusMonitoring ? (
          <Button onClick={handleStartPayment} className="flex-1">
            Start QR Payment
          </Button>
        ) : (
          <Button 
            onClick={onBack}
            className="flex-1"
          >
            {isPaymentComplete ? 'Complete' : 'Cancel'}
          </Button>
        )}
      </div>
    </div>
  )
} 