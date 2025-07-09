// /components/pos/payment/PaymentMethodSelector.tsx
// Single-page payment method selection with parent-child categories and inline QR display

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CryptoQRCode } from '@/components/ui/crypto-qr-code'
import { PaymentOption } from '@/hooks/use-payment-settings'
import { generateCryptoQR, getMethodIcon, getMethodName, QRData } from '@/lib/payment/qr-generation'

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
    const configuredCryptoMethods = getConfiguredCryptoMethods()
    if (configuredCryptoMethods.length > 0) {
      const firstCrypto = configuredCryptoMethods[0]
      setSelectedChild(firstCrypto.id)
      onMethodSelect(firstCrypto.id)
    }
  }, [paymentSettings, onMethodSelect])

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
      console.log('🔥 Generating QR for:', selectedChild)
      generateCryptoQR(selectedChild, amount, paymentSettings).then((result) => {
        setCryptoQRData(result)
        if (result) {
          console.log('✅ QR generated successfully')
        } else {
          console.log('❌ QR generation failed')
        }
      }).catch((error) => {
        console.error('❌ QR generation error:', error)
        setCryptoQRData(null)
      })
    } else {
      setCryptoQRData(null)
    }
  }, [selectedParent, selectedChild, amount, paymentSettings])

  // Handle parent category selection
  const handleParentSelection = (parent: ParentCategory) => {
    setSelectedParent(parent)
    setSelectedChild(null)
    setCryptoQRData(null)
    
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
    
    setSelectedChild(methodId)
    
    // All methods now stay inline for QR display
    // No routing to separate flows needed
    console.log('🔥 INLINE QR DISPLAY MODE')
    onMethodSelect(methodId)
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
    
    return groupedOptions[parent] || []
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  const enabledParentCategories = parentCategories.filter(cat => cat.hasOptions)
  if (enabledParentCategories.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No payment methods configured</p>
          <p className="text-sm text-muted-foreground mt-2">
            Configure payment methods in settings to continue
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Parent Categories - Always Visible (Compact Design) */}
      <div>
        <h3 className="text-base font-semibold mb-4 text-foreground">Payment Category</h3>
        <div className="flex gap-2 flex-wrap">
          {parentCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedParent === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleParentSelection(category.id)}
              disabled={!category.hasOptions}
              className="h-10 px-4 flex items-center gap-2 min-w-[100px]"
            >
              <span className="text-sm">{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Child Methods - Show for Selected Parent (Compact Design) */}
      {selectedParent && selectedParent !== 'cash' && (
        <div>
          <h3 className="text-base font-semibold mb-4 text-foreground">
            {selectedParent === 'crypto' ? 'Cryptocurrency' : 'Payment Method'}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {getChildMethods(selectedParent).map((option) => {
              console.log('🔥 RENDERING BUTTON:', option.id, option)
              return (
                <Button
                  key={option.id}
                  variant={selectedChild === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    console.log('🔥 CRYPTO BUTTON CLICKED:', option.id)
                    handleChildSelection(option.id)
                  }}
                  className="h-8 px-3 flex items-center gap-2 min-w-[80px]"
                >
                  <span className="text-xs">{getMethodIcon(option.id)}</span>
                  <span className="text-xs">{getMethodName(option.id)}</span>
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
              
              {/* Crypto QR Code Display */}
              {selectedParent === 'crypto' && cryptoQRData && (
                <CryptoQRCode
                  paymentMethod={cryptoQRData.method}
                  address={cryptoQRData.address}
                  amount={amount}
                  qrContent={cryptoQRData.qrContent}
                />
              )}

              {/* Crypto QR Code - Not Configured */}
              {selectedParent === 'crypto' && !cryptoQRData && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Payment method not configured</p>
                  <p className="text-sm mt-1 text-muted-foreground/80">Configure {getMethodName(selectedChild)} in settings</p>
                </div>
              )}

              {/* QR Provider Selection and Display */}
              {selectedParent === 'qr' && (
                <div className="text-center space-y-4">
                  {/* QR Provider Selection */}
                  {qrProviders.filter(p => p.enabled && p.qrCodeImageData).length > 1 && (
                    <div className="flex gap-2 justify-center mb-4">
                      {qrProviders.filter(p => p.enabled && p.qrCodeImageData).map(provider => (
                        <Button
                          key={provider.id}
                          variant={selectedQRProvider?.id === provider.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedQRProvider(provider)}
                          className="h-8 px-3 text-xs"
                        >
                          {provider.customName || provider.providerName}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* QR Code Image Display */}
                  {selectedQRProvider?.qrCodeImageData ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <img 
                          src={selectedQRProvider.qrCodeImageData} 
                          alt={`${selectedQRProvider.providerName} QR Code`}
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground/80 space-y-1">
                        <p className="font-medium text-foreground">
                          {selectedQRProvider.customName || selectedQRProvider.providerName}
                        </p>
                        <p>Scan with mobile payment app</p>
                        <p className="font-semibold text-foreground">Amount: ${amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No QR code available</p>
                      <p className="text-sm text-muted-foreground/80">Configure QR providers in settings</p>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 