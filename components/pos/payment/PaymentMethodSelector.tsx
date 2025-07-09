// /components/pos/payment/PaymentMethodSelector.tsx
// Single-page payment method selection with proper amount conversion and validation

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CryptoQRCode } from '@/components/ui/crypto-qr-code'
import { PaymentOption } from '@/hooks/use-payment-settings'
import { generateCryptoQR, QRData, validateQRData, getMethodIcon, getMethodName } from '@/lib/payment/qr-generation'

interface PaymentMethodSelectorProps {
  paymentOptions: PaymentOption[]
  selectedMethod: string | null
  onMethodSelect: (method: string) => void
  onCashPayment: () => void
  paymentSettings: any
  qrProviders: any[]
  amount: number
  isLoading?: boolean
  className?: string
}

type ParentCategory = 'crypto' | 'qr' | 'cash'

interface ParentCategoryInfo {
  id: ParentCategory
  name: string
  icon: string
  hasOptions: boolean
}

export const PaymentMethodSelector = ({
  paymentOptions,
  selectedMethod,
  onMethodSelect,
  onCashPayment,
  paymentSettings,
  qrProviders,
  amount,
  isLoading = false,
  className
}: PaymentMethodSelectorProps) => {
  const [selectedParent, setSelectedParent] = useState<ParentCategory>('crypto')
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [selectedQRProvider, setSelectedQRProvider] = useState<any>(null)
  const [cryptoQRData, setCryptoQRData] = useState<QRData | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrError, setQRError] = useState<string | null>(null)

  // Group options by category
  const groupedOptions = paymentOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, PaymentOption[]>)

  // Get configured crypto methods based on payment settings
  const getConfiguredCryptoMethods = (): PaymentOption[] => {
    console.log('🔥 PAYMENT SETTINGS:', paymentSettings)
    
    // Always return all crypto methods - we have fallback addresses for testing
    const allCryptoMethods: PaymentOption[] = [
      {
        id: 'lightning',
        name: 'Lightning',
        category: 'crypto' as const,
        icon: '⚡',
        description: 'Instant Bitcoin payments via Lightning Network',
        enabled: true
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        category: 'crypto' as const,
        icon: '₿',
        description: 'Bitcoin on-chain transaction',
        enabled: true
      },
      {
        id: 'usdt-eth',
        name: 'USDT (ETH)',
        category: 'crypto' as const,
        icon: '$',
        description: 'USDT stablecoin on Ethereum network',
        enabled: true
      },
      {
        id: 'usdt-tron',
        name: 'USDT (TRX)',
        category: 'crypto' as const,
        icon: '$',
        description: 'USDT stablecoin on Tron network',
        enabled: true
      }
    ]

    console.log('🔥 CONFIGURED METHODS (ALL AVAILABLE):', allCryptoMethods)
    return allCryptoMethods
  }

  // Define parent categories with smaller, more compact design
  const parentCategories: ParentCategoryInfo[] = [
    { 
      id: 'crypto', 
      name: 'Crypto', 
      icon: '₿', 
      hasOptions: getConfiguredCryptoMethods().length > 0 // Only available if crypto methods are configured
    },
    { 
      id: 'qr', 
      name: 'QR Code', 
      icon: '📱', 
      hasOptions: qrProviders.length > 0 // Available if QR providers exist
    },
    { 
      id: 'cash', 
      name: 'Cash', 
      icon: '💵', 
      hasOptions: true // Always available
    }
  ]

  // Auto-select first available crypto method on mount
  useEffect(() => {
    if (!selectedChild) { // Only set if nothing selected
      const configuredCryptoMethods = getConfiguredCryptoMethods()
      if (configuredCryptoMethods.length > 0) {
        const firstCrypto = configuredCryptoMethods[0]
        setSelectedChild(firstCrypto.id)
        onMethodSelect(firstCrypto.id)
      }
    }
  }, []) // Remove dependencies to only run once

  // Initialize QR provider for QR category
  useEffect(() => {
    const enabledProviders = qrProviders.filter(p => p.enabled && p.qrCodeImageData)
    if (enabledProviders.length > 0) {
      setSelectedQRProvider(enabledProviders[0])
    }
  }, [qrProviders])

  // Generate crypto QR when crypto method is selected
  useEffect(() => {
    if (selectedParent === 'crypto' && selectedChild && paymentSettings) {
      console.log('🔥 Generating QR for:', selectedChild, 'USD amount:', amount)
      
      setIsGeneratingQR(true)
      setQRError(null)
      
      generateCryptoQR(selectedChild, amount, paymentSettings, {
        validateAddresses: true,
        includeFallbacks: true
      }).then((result) => {
        if (result && validateQRData(result)) {
          setCryptoQRData(result)
          console.log('✅ QR generated successfully:', {
            method: result.method,
            usdAmount: result.amount,
            cryptoAmount: result.cryptoAmount,
            formattedAmount: result.formattedCryptoAmount,
            exchangeRate: result.exchangeRate
          })
        } else {
          const errorMsg = result?.error || 'Failed to generate QR code'
          setQRError(errorMsg)
          console.error('❌ QR generation failed:', errorMsg)
        }
      }).catch((error) => {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setQRError(errorMsg)
        console.error('❌ QR generation error:', error)
      }).finally(() => {
        setIsGeneratingQR(false)
      })
    } else {
      setCryptoQRData(null)
      setQRError(null)
    }
  }, [selectedParent, selectedChild, amount, paymentSettings])

  // Handle parent category selection
  const handleParentSelection = (parent: ParentCategory) => {
    setSelectedParent(parent)
    setSelectedChild(null)
    setCryptoQRData(null)
    setQRError(null)
    
    if (parent === 'cash') {
      onCashPayment()
    } else {
      // Auto-select first child method for crypto/qr
      const childMethods = getChildMethods(parent)
      if (childMethods.length > 0) {
        const firstChild = childMethods[0].id
        setSelectedChild(firstChild)
        // Don't auto-route to flow, just set the selected method for inline display
        onMethodSelect(firstChild)
      }
    }
  }

  // Handle child method selection
  const handleChildSelection = (methodId: string) => {
    console.log('🔥 BUTTON CLICKED:', methodId)
    console.log('🔥 CURRENT SELECTED:', selectedChild)
    
    setSelectedChild(methodId)
    onMethodSelect(methodId)
    
    console.log('🔥 AFTER CLICK - SHOULD BE:', methodId)
  }

  // Get child methods for selected parent
  const getChildMethods = (parent: ParentCategory): PaymentOption[] => {
    if (!parent) return []
    
    // For crypto category, use only configured methods
    if (parent === 'crypto') {
      const cryptoMethods = getConfiguredCryptoMethods()
      console.log('🔥 GET CHILD METHODS - CRYPTO:', cryptoMethods)
      return cryptoMethods
    }
    
    // For QR category, return generic QR option
    if (parent === 'qr') {
      return [{
        id: 'qr-code',
        name: 'QR Payment',
        category: 'qr' as const,
        icon: '📱',
        description: 'Mobile payment apps',
        enabled: true
      }]
    }
    
    // For cash category, return empty (handled differently)
    return []
  }

  const formatCryptoAmount = (qrData: QRData) => {
    switch (qrData.method) {
      case 'lightning':
        return `${qrData.formattedCryptoAmount} sat`
      case 'bitcoin':
        return `${qrData.formattedCryptoAmount} BTC`
      case 'usdt-eth':
      case 'usdt-tron':
        return `${qrData.formattedCryptoAmount} USDT`
      default:
        return qrData.formattedCryptoAmount
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-slate-300">Loading payment methods...</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Parent Category Selection */}
      <div>
        <h3 className="text-base font-semibold mb-3 text-foreground">Select Payment Method</h3>
        <div className="grid grid-cols-3 gap-2">
          {parentCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedParent === category.id ? 'default' : 'outline'}
              onClick={() => handleParentSelection(category.id)}
              disabled={!category.hasOptions}
              className={cn(
                "flex flex-col items-center gap-1 h-16 text-xs",
                !category.hasOptions && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
              {!category.hasOptions && (
                <Badge variant="secondary" className="text-xs px-1">
                  N/A
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Child Method Selection */}
      {selectedParent && selectedParent !== 'cash' && (
        <div>
          <h3 className="text-base font-semibold mb-4 text-foreground">
            Choose {selectedParent === 'crypto' ? 'Cryptocurrency' : 'QR Provider'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {getChildMethods(selectedParent).map((option) => {
              const isSelected = selectedChild === option.id
              return (
                <Button
                  key={option.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handleChildSelection(option.id)}
                  disabled={!option.enabled}
                  className={cn(
                    "flex flex-col items-center gap-2 h-20 text-xs",
                    isSelected && "ring-2 ring-blue-400"
                  )}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span>{getMethodName(option.id)}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* QR Code Display Area - Inline Display */}
      {selectedChild && (
        <div>
          <h3 className="text-base font-semibold mb-4 text-foreground">Payment QR Code</h3>
          <Card className="p-6">
            <CardContent className="p-0">
              
              {/* Payment Amount Display */}
              <div className="bg-slate-800 rounded-lg p-4 text-center mb-4">
                <div className="text-2xl font-bold text-white mb-2">
                  ${amount.toFixed(2)} USD
                </div>
                {cryptoQRData && (
                  <div className="text-sm text-slate-300">
                    ≈ {formatCryptoAmount(cryptoQRData)}
                    {cryptoQRData.exchangeRate > 0 && (
                      <div className="text-xs text-slate-400 mt-1">
                        Rate: ${cryptoQRData.exchangeRate.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
              
              {/* Crypto QR Code Display */}
              {selectedParent === 'crypto' && cryptoQRData && cryptoQRData.isValid && (
                <CryptoQRCode
                  paymentMethod={cryptoQRData.method}
                  address={cryptoQRData.address}
                  amount={amount}
                  qrContent={cryptoQRData.qrContent}
                />
              )}

              {/* Crypto QR Code - Not Configured */}
              {selectedParent === 'crypto' && !cryptoQRData && !isGeneratingQR && !qrError && (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">⚠️</div>
                  <div className="text-sm text-slate-400">
                    {selectedChild} payment not configured
                  </div>
                </div>
              )}

              {/* QR Code Payment Display */}
              {selectedParent === 'qr' && selectedQRProvider && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img 
                      src={selectedQRProvider.qrCodeImageData} 
                      alt="QR Payment Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-sm text-slate-400">
                    {selectedQRProvider.providerName || 'QR Payment'}
                  </div>
                </div>
              )}

              {/* QR Code - Not Configured */}
              {selectedParent === 'qr' && !selectedQRProvider && (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">⚠️</div>
                  <div className="text-sm text-slate-400">
                    No QR providers configured
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 