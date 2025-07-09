// /components/pos/payment/PaymentMethodSelector.tsx
// Single-page payment method selection with proper amount conversion and validation

"use client"

import { useState, useEffect, useCallback } from 'react'
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

  // Get configured crypto methods based on payment settings
  const getConfiguredCryptoMethods = useCallback((): PaymentOption[] => {
    console.log('🔥 PAYMENT SETTINGS:', paymentSettings)
    
    // Temporarily disable Lightning until LNBits is configured
    const allCryptoMethods: PaymentOption[] = [
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
      },
      {
        id: 'lightning',
        name: 'Lightning',
        category: 'crypto' as const,
        icon: '⚡',
        description: 'Setting up LNBits...',
        enabled: false // Temporarily disabled until LNBits setup
      }
    ]

    console.log('🔥 CONFIGURED METHODS:', allCryptoMethods)
    return allCryptoMethods.filter(method => method.enabled) // Only return enabled methods
  }, [paymentSettings])

  // Define parent categories with smaller, more compact design
  const parentCategories: ParentCategoryInfo[] = [
    { 
      id: 'crypto', 
      name: 'Crypto', 
      icon: '₿', 
      hasOptions: getConfiguredCryptoMethods().length > 0
    },
    { 
      id: 'qr', 
      name: 'QR Code', 
      icon: '📱', 
      hasOptions: qrProviders.length > 0
    },
    { 
      id: 'cash', 
      name: 'Cash', 
      icon: '💵', 
      hasOptions: true
    }
  ]

  // Auto-select first available crypto method on mount
  useEffect(() => {
    if (!selectedChild) {
      const configuredCryptoMethods = getConfiguredCryptoMethods()
      if (configuredCryptoMethods.length > 0) {
        const firstCrypto = configuredCryptoMethods[0]
        setSelectedChild(firstCrypto.id)
        onMethodSelect(firstCrypto.id)
      }
    }
  }, [selectedChild, getConfiguredCryptoMethods, onMethodSelect])

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

  // Get child methods for selected parent
  const getChildMethods = useCallback((parent: ParentCategory): PaymentOption[] => {
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
  }, [getConfiguredCryptoMethods])

  // Handle parent category selection
  const handleParentSelection = useCallback((parent: ParentCategory) => {
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
        onMethodSelect(firstChild)
      }
    }
  }, [onCashPayment, onMethodSelect, getChildMethods])

  // Handle child method selection
  const handleChildSelection = useCallback((methodId: string) => {
    console.log('🔥 BUTTON CLICKED:', methodId)
    console.log('🔥 CURRENT SELECTED:', selectedChild)
    
    setSelectedChild(methodId)
    onMethodSelect(methodId)
    
    console.log('🔥 AFTER CLICK - SHOULD BE:', methodId)
  }, [selectedChild, onMethodSelect])

  const formatCryptoAmount = useCallback((qrData: QRData) => {
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
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-slate-300">Loading payment methods...</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Parent Category Selection */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">Select Payment Method</h3>
        <div className="grid grid-cols-3 gap-2">
          {parentCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedParent === category.id ? 'default' : 'outline'}
              onClick={() => handleParentSelection(category.id)}
              disabled={!category.hasOptions}
              className={cn(
                "flex items-center justify-center gap-2 h-12 text-xs shadow-md border-2",
                selectedParent === category.id 
                  ? "border-primary shadow-lg" 
                  : "border-border hover:border-primary/50 hover:shadow-lg",
                !category.hasOptions && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.name}</span>
              {!category.hasOptions && (
                <Badge variant="secondary" className="text-xs px-1 ml-1">
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
          <h3 className="text-sm font-semibold mb-2 text-foreground">
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
                    "flex items-center justify-center gap-1.5 h-12 text-xs shadow-md border-2",
                    isSelected 
                      ? "ring-2 ring-blue-400 border-primary shadow-lg" 
                      : "border-border hover:border-primary/50 hover:shadow-lg"
                  )}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span>{getMethodName(option.id)}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* QR Code Display Area - Inline Display */}
      {selectedChild && (
        <Card className="p-2">
          <CardContent className="p-0">
            
            {/* Payment Amount Display - More Compact */}
            <div className="bg-slate-800 rounded-lg p-2 text-center mb-2">
              <div className="text-lg font-bold text-white mb-1">
                ${amount.toFixed(2)} USD
              </div>
              {cryptoQRData && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                  <span>≈ {formatCryptoAmount(cryptoQRData)}</span>
                  {cryptoQRData.exchangeRate > 0 && (
                    <span className="text-slate-400">
                      • Rate: ${cryptoQRData.exchangeRate.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* QR Code Generation Status */}
            {isGeneratingQR && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-sm text-slate-300">Generating QR code...</span>
              </div>
            )}

            {/* QR Generation Error */}
            {qrError && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-3">
                <div className="flex items-center">
                  <div className="text-red-400 mr-2">❌</div>
                  <div>
                    <div className="text-red-400 font-semibold text-sm">QR Generation Error</div>
                    <div className="text-red-300 text-xs">{qrError}</div>
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
              <div className="text-center py-6">
                <div className="text-slate-400 mb-2">⚠️</div>
                <div className="text-sm text-slate-400">
                  {selectedChild} payment not configured
                </div>
              </div>
            )}

            {/* QR Code Payment Display */}
            {selectedParent === 'qr' && selectedQRProvider && (
              <div className="text-center">
                <div className="bg-white p-3 rounded-lg inline-block mb-3">
                  <img 
                    src={selectedQRProvider.qrCodeImageData} 
                    alt="QR Payment Code"
                    className="w-40 h-40"
                  />
                </div>
                <div className="text-sm text-slate-400">
                  {selectedQRProvider.providerName || 'QR Payment'}
                </div>
              </div>
            )}

            {/* QR Code - Not Configured */}
            {selectedParent === 'qr' && !selectedQRProvider && (
              <div className="text-center py-6">
                <div className="text-slate-400 mb-2">⚠️</div>
                <div className="text-sm text-slate-400">
                  No QR providers configured
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 