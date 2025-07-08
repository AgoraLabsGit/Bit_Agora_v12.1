import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Zap, Bitcoin, DollarSign, CreditCard, QrCode, Smartphone, Wifi, WifiOff } from 'lucide-react'
import QRPaymentGateway, { 
  type PaymentGateway, 
  type PaymentStatus, 
  type QRPaymentResult, 
  type PaymentStatusUpdate, 
  type TransactionMetadata 
} from '@/lib/payments/qr-gateway'
import { TaxCalculator, TaxConfiguration, TaxCalculationResult } from '@/lib/tax-calculation'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  emoji?: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  cartItems: CartItem[]
  onPaymentComplete?: () => void
  taxCalculation?: TaxCalculationResult
  taxConfig?: TaxConfiguration
}

type PaymentCategory = 'crypto' | 'qr' | 'processor' | 'cash'
type PaymentMethod = 'lightning' | 'bitcoin' | 'usdt' | 'qr-code' | 'venmo' | 'paypal' | 'stripe' | 'cash' | string

interface PaymentOption {
  id: PaymentMethod
  name: string
  category: PaymentCategory
  icon: React.ReactNode
  enabled: boolean
  description: string
}

interface PaymentSettings {
  acceptCash: boolean
  acceptCards: boolean
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUsdtEthereum: boolean
  acceptUsdtTron: boolean
  stripeEnabled: boolean
  paypalEnabled: boolean
  squareEnabled: boolean
}

interface PaymentCredential {
  id: string
  processorName: string
  active: boolean
  environment: string
}

export function PaymentModal({ isOpen, onClose, amount, cartItems, onPaymentComplete, taxCalculation, taxConfig }: PaymentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>('crypto')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('lightning')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting')
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Dynamic QR system state
  const [qrPaymentResult, setQrPaymentResult] = useState<QRPaymentResult | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [paymentMonitorCleanup, setPaymentMonitorCleanup] = useState<(() => void) | null>(null)
  
  // Custom QR provider state
  const [qrProviders, setQrProviders] = useState<any[]>([])
  const [isLoadingQRProvider, setIsLoadingQRProvider] = useState(false)
  
  // Connectivity monitoring
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState<PaymentStatusUpdate | null>(null)

  // Load payment settings and credentials
  useEffect(() => {
    const loadPaymentOptions = async () => {
      if (!isOpen) return
      
      try {
        setIsLoading(true)
        
        // Fetch payment settings
        const settingsResponse = await fetch('/api/payment-settings')
        const settingsData = await settingsResponse.json()
        
        let settings: PaymentSettings
        
        if (!settingsData.data) {
          // No settings exist - initialize with proper defaults
          const defaultSettings: PaymentSettings = {
            acceptCash: true,
            acceptCards: true,
            acceptBitcoin: true,
            acceptBitcoinLightning: true,
            acceptUsdtEthereum: true,
            acceptUsdtTron: true,
            stripeEnabled: false,
            paypalEnabled: false,
            squareEnabled: false
          }
          
          // Save the defaults for future use
          try {
            await fetch('/api/payment-settings', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(defaultSettings)
            })
          } catch (error) {
            console.warn('Failed to save default settings:', error)
          }
          
          settings = defaultSettings
        } else {
          settings = settingsData.data
        }
        
        // Fetch payment credentials
        const credentialsResponse = await fetch('/api/payment-credentials')
        const credentialsData = await credentialsResponse.json()
        const credentials: PaymentCredential[] = credentialsData.data || []
        
        // Build payment options based on settings
        const options: PaymentOption[] = []
        
        // Crypto payments
        if (settings.acceptBitcoinLightning) {
          options.push({
            id: 'lightning',
            name: 'Lightning',
            category: 'crypto',
            icon: <Zap className="h-4 w-4" />,
            enabled: true,
            description: 'Bitcoin Lightning Network'
          })
        }
        
        if (settings.acceptBitcoin) {
          options.push({
            id: 'bitcoin',
            name: 'Bitcoin',
            category: 'crypto',
            icon: <Bitcoin className="h-4 w-4" />,
            enabled: true,
            description: 'Bitcoin On-Chain'
          })
        }
        
        if (settings.acceptUsdtEthereum) {
          options.push({
            id: 'usdt-ethereum',
            name: 'USDT (ETHEREUM)',
            category: 'crypto',
            icon: <DollarSign className="h-4 w-4" />,
            enabled: true,
            description: 'USDT on Ethereum Network'
          })
        }
        
        if (settings.acceptUsdtTron) {
          options.push({
            id: 'usdt-tron',
            name: 'USDT (TRON)',
            category: 'crypto',
            icon: <DollarSign className="h-4 w-4" />,
            enabled: true,
            description: 'USDT on TRON Network'
          })
        }
        
        // Load QR providers (ONLY user-uploaded custom QR codes)
        const qrResponse = await fetch('/api/qr-providers')
        const qrData = await qrResponse.json()
        
        if (qrData.success && qrData.data) {
          // Filter to show ONLY custom QR providers uploaded by admin
          const customQRProviders = qrData.data.filter((provider: any) => 
            provider.providerType === 'custom' && provider.enabled
          )
          
          // Store QR providers in state for later use
          setQrProviders(customQRProviders)
          
          customQRProviders.forEach((provider: any) => {
            options.push({
              id: `qr-${provider.id}`,
              name: provider.customName || provider.providerName,
              category: 'qr',
              icon: <QrCode className="h-4 w-4" />,
              enabled: true,
              description: `${provider.customName || provider.providerName} QR Payment`
            })
          })
        }
        
        // Payment processors - show individual processors instead of generic credit card
        const processorCredentials = credentials.filter(cred => 
          cred.active && ['stripe', 'paypal', 'square'].includes(cred.processorName.toLowerCase())
        )
        
        processorCredentials.forEach(cred => {
          const processorName = cred.processorName.toLowerCase()
          let name = cred.processorName
          let icon = <CreditCard className="h-4 w-4" />
          let description = ''
          
          if (processorName === 'stripe') {
            name = 'Stripe'
            icon = <CreditCard className="h-4 w-4" />
            description = 'Process cards via Stripe app'
          } else if (processorName === 'paypal') {
            name = 'PayPal'
            icon = <CreditCard className="h-4 w-4" />
            description = 'Process cards via PayPal Here'
          } else if (processorName === 'square') {
            name = 'Square'
            icon = <CreditCard className="h-4 w-4" />
            description = 'Process cards via Square app'
          }
          
          options.push({
            id: cred.id,
            name,
            category: 'processor',
            icon,
            enabled: true,
            description
          })
        })
        
        // Fallback: if cards are accepted but no specific processors configured
        if ((settings.acceptCards || settings.stripeEnabled || settings.paypalEnabled || settings.squareEnabled) && processorCredentials.length === 0) {
          options.push({
            id: 'generic-card',
            name: 'Credit Card',
            category: 'processor',
            icon: <CreditCard className="h-4 w-4" />,
            enabled: true,
            description: 'Credit/Debit Cards'
          })
        }
        
        // Cash
        if (settings.acceptCash) {
          options.push({
            id: 'cash',
            name: 'Cash',
            category: 'cash',
            icon: <DollarSign className="h-4 w-4" />,
            enabled: true,
            description: 'Cash Payment'
          })
        }
        
        setPaymentOptions(options)
        
        // Set default selection
        if (options.length > 0) {
          const cryptoOptions = options.filter(opt => opt.category === 'crypto')
          if (cryptoOptions.length > 0) {
            setSelectedCategory('crypto')
            setSelectedMethod(cryptoOptions[0].id)
          } else {
            setSelectedCategory(options[0].category)
            setSelectedMethod(options[0].id)
          }
        }
        
      } catch (error) {
        console.error('Error loading payment options:', error)
        // Fallback to basic options
        setPaymentOptions([
          {
            id: 'cash',
            name: 'Cash',
            category: 'cash',
            icon: <DollarSign className="h-4 w-4" />,
            enabled: true,
            description: 'Cash Payment'
          }
        ])
        setSelectedCategory('cash')
        setSelectedMethod('cash')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPaymentOptions()
  }, [isOpen])

  // Connectivity monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cleanup payment monitoring when modal closes
  useEffect(() => {
    if (!isOpen && paymentMonitorCleanup) {
      paymentMonitorCleanup()
      setPaymentMonitorCleanup(null)
      setQrPaymentResult(null)
      setPaymentStatus('waiting')
    }
  }, [isOpen, paymentMonitorCleanup])

  // Generate dynamic QR code for supported payment methods
  const generateDynamicQR = async (paymentMethodId: string) => {
    try {
      setIsGeneratingQR(true)
      
      // Determine gateway type
      let gateway: PaymentGateway | null = null
      if (paymentMethodId.includes('stripe')) {
        gateway = 'stripe'
      } else if (paymentMethodId.includes('mercado-pago')) {
        gateway = 'mercadopago'
      }
      
      if (!gateway) {
        throw new Error('Unsupported QR payment method')
      }
      
      // Create transaction metadata
      const metadata: TransactionMetadata = {
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId: 'dev-merchant-001',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
      
      // Generate QR code
      const qrGateway = QRPaymentGateway.getInstance()
      const result = await qrGateway.generateQR(gateway, amount, 'USD', metadata)
      
      setQrPaymentResult(result)
      setPaymentStatus('waiting')
      
      // Start monitoring payment status
      const cleanup = qrGateway.startPaymentMonitoring(
        result.paymentId,
        gateway,
        (update: PaymentStatusUpdate) => {
          setLastPaymentUpdate(update)
          setPaymentStatus(update.status)
          
          if (update.status === 'completed') {
            // Payment completed successfully
            setTimeout(() => {
              onPaymentComplete?.()
              onClose()
            }, 2000) // Show success for 2 seconds before closing
          }
        }
      )
      
      setPaymentMonitorCleanup(() => cleanup)
      
    } catch (error) {
      console.error('QR generation failed:', error)
      setPaymentStatus('failed')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Check if a payment method supports dynamic QR generation
  const supportsDynamicQR = (paymentMethodId: string): boolean => {
    return paymentMethodId.includes('stripe-qr') || 
           paymentMethodId.includes('mercado-pago') ||
           paymentMethodId.includes('paypal-qr')
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = async (paymentMethodId: string) => {
    setSelectedMethod(paymentMethodId)
    
    // If this is a QR payment method that supports dynamic QR, generate it
    if (selectedCategory === 'qr' && supportsDynamicQR(paymentMethodId)) {
      await generateDynamicQR(paymentMethodId)
    } else {
      // Reset QR state for non-QR payments
      setQrPaymentResult(null)
      setPaymentStatus('waiting')
    }
  }

  // Check if the selected method is a custom uploaded QR code
  const isCustomQRProvider = (paymentMethodId: string): boolean => {
    return paymentMethodId.startsWith('qr-') && selectedCategory === 'qr'
  }

  // Get custom QR provider details
  const getCustomQRProvider = () => {
    if (!isCustomQRProvider(selectedMethod)) return null
    
    // Extract provider ID from payment method ID
    const providerId = selectedMethod.replace('qr-', '')
    
    // Find the full QR provider data from state
    const qrProvider = qrProviders.find(provider => provider.id === providerId)
    
    if (qrProvider) {
      return {
        id: qrProvider.id,
        name: qrProvider.customName || qrProvider.providerName,
        description: qrProvider.customDescription || `${qrProvider.customName || qrProvider.providerName} QR Payment`,
        qrCodeFilePath: qrProvider.qrCodeFilePath,
        qrCodeImageData: qrProvider.qrCodeImageData, // Actual uploaded image data
        percentageFee: qrProvider.percentageFee,
        fixedFee: qrProvider.fixedFee
      }
    }
    
    return null
  }

  const categories = [
    { id: 'crypto' as PaymentCategory, name: 'Crypto', description: 'Cryptocurrency payments' },
    { id: 'qr' as PaymentCategory, name: 'QR Code', description: 'QR code payments' },
    { id: 'processor' as PaymentCategory, name: 'Card Reader', description: 'Card reader terminals (Phase 2)' },
    { id: 'cash' as PaymentCategory, name: 'Cash', description: 'Cash payment' }
  ]

  // Get available payment methods for selected category
  const getAvailablePayments = (category: PaymentCategory) => {
    return paymentOptions.filter(option => option.category === category && option.enabled)
  }

  // Update selected method when category changes
  useEffect(() => {
    const availablePayments = getAvailablePayments(selectedCategory)
    if (availablePayments.length > 0 && !availablePayments.find(p => p.id === selectedMethod)) {
      setSelectedMethod(availablePayments[0].id)
    }
  }, [selectedCategory, paymentOptions])

  if (!isOpen) return null

  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`
  
  const currentPayment = paymentOptions.find(p => p.id === selectedMethod)
  const availablePayments = getAvailablePayments(selectedCategory)

  const handleCancel = () => {
    setPaymentStatus('waiting')
    onClose()
  }

  const handleSimulatePayment = async () => {
    try {
      setPaymentStatus('confirming')
      
      // Create transaction data
      const transactionData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: 'unknown', // Default category for mock products
          emoji: item.emoji || '📦'
        })),
        total: amount,
        paymentMethod: selectedMethod,
        paymentStatus: 'completed',
        employeeId: 'emp-001' // Default employee ID
      }
      
      // Create transaction via API
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Transaction created successfully:', result.data)
        setPaymentStatus('completed')
        
        // Delay before calling completion callback to show success state
        setTimeout(() => {
          onPaymentComplete?.()
          onClose()
        }, selectedMethod === 'cash' ? 1000 : 2000)
      } else {
        console.error('❌ Failed to create transaction:', result.error)
        setPaymentStatus('failed')
      }
      
    } catch (error) {
      console.error('❌ Transaction creation error:', error)
      setPaymentStatus('failed')
    }
  }

  const getPaymentInstructions = () => {
    const payment = paymentOptions.find(p => p.id === selectedMethod)
    if (!payment) return ''
    
    switch (payment.category) {
      case 'crypto':
        if (payment.id === 'lightning') {
          return `Scan the QR code with your Lightning wallet to pay ${formatAmount(amount)}`
        } else if (payment.id === 'bitcoin') {
          return `Scan the QR code with your Bitcoin wallet to pay ${formatAmount(amount)}`
        } else if (payment.id === 'usdt-ethereum') {
          return `Scan the QR code with your Ethereum wallet to pay ${formatAmount(amount)} in USDT`
        } else if (payment.id === 'usdt-tron') {
          return `Scan the QR code with your TRON wallet to pay ${formatAmount(amount)} in USDT`
        }
        return `Scan the QR code with your crypto wallet to pay ${formatAmount(amount)}`
      
      case 'qr':
        if (payment.name === 'PayPal QR') {
          return `Customer scans QR code to pay ${formatAmount(amount)} with their PayPal wallet`
        } else if (payment.name === 'Stripe QR') {
          return `Customer scans QR code to pay ${formatAmount(amount)} via Stripe payment methods`
        } else if (payment.name === 'Square QR') {
          return `Customer scans QR code to pay ${formatAmount(amount)} via Square contactless payment`
        }
        return `Scan the QR code with your ${payment.name} app to pay ${formatAmount(amount)}`
      
      case 'processor':
        if (payment.name === 'Stripe') {
          return `Use your Stripe Terminal app to process the ${formatAmount(amount)} card payment`
        } else if (payment.name === 'PayPal') {
          return `Use your PayPal Here app to process the ${formatAmount(amount)} card payment`
        } else if (payment.name === 'Square') {
          return `Use your Square app to process the ${formatAmount(amount)} card payment`
        }
        return `Use your payment processor app to process the ${formatAmount(amount)} card payment`
      
      case 'cash':
        return `Customer pays ${formatAmount(amount)} in cash. Make sure you have sufficient change available.`
      
      default:
        return `Complete the ${formatAmount(amount)} payment`
    }
  }

  const showQRCode = ['lightning', 'bitcoin', 'usdt-ethereum', 'usdt-tron'].includes(selectedMethod) || 
                     paymentOptions.some(p => p.id === selectedMethod && p.category === 'qr')

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-card border border-border shadow-2xl">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment methods...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-card border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {paymentStatus === 'pending' && 'Setting up Payment...'}
              {paymentStatus === 'waiting' && `Waiting for ${currentPayment?.name} Payment`}
              {paymentStatus === 'confirming' && 'Confirming Payment...'}
              {paymentStatus === 'completed' && 'Payment Confirmed!'}
              {paymentStatus === 'failed' && 'Payment Failed'}
              {paymentStatus === 'expired' && 'Payment Expired'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 hover:bg-accent touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Payment Amount */}
          <div className="text-center mb-6">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {formatAmount(amount)}
            </div>
          </div>

          {/* Order Summary / Receipt */}
          {cartItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Order Summary</h3>
              <div className="bg-background rounded-lg border border-border p-4 max-h-40 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.emoji && <span className="text-base">{item.emoji}</span>}
                      <span className="truncate">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-medium text-foreground ml-2">
                      {formatAmount(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                
                {/* Tax Breakdown */}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  {taxCalculation && taxConfig?.showTaxLine && (
                    <>
                      {/* Subtotal */}
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>{formatAmount(taxCalculation.subtotal)}</span>
                      </div>
                      
                      {/* Tax Details */}
                      {taxConfig?.enabled && taxCalculation.totalTax > 0 && (
                        <>
                          {/* Primary Tax */}
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{taxCalculation.breakdown.primaryTaxName} ({(taxCalculation.taxRate * 100).toFixed(1)}%):</span>
                            <span>{formatAmount(taxCalculation.primaryTax)}</span>
                          </div>
                          
                          {/* Secondary Tax (if applicable) */}
                          {taxCalculation.secondaryTax > 0 && taxCalculation.breakdown.secondaryTaxName && (
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>{taxCalculation.breakdown.secondaryTaxName} ({(taxCalculation.secondaryTaxRate * 100).toFixed(1)}%):</span>
                              <span>{formatAmount(taxCalculation.secondaryTax)}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Total */}
                      <div className="flex justify-between items-center font-semibold border-t border-border pt-1 mt-1">
                        <span>Total</span>
                        <span className="text-primary">{formatAmount(amount)}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Fallback total if no tax calculation or showTaxLine is false */}
                  {(!taxCalculation || !taxConfig?.showTaxLine) && (
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatAmount(amount)}</span>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Category Buttons */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Payment Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const availablePayments = getAvailablePayments(category.id)
                if (availablePayments.length === 0) return null
                
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex-1 min-w-0 h-10 sm:h-12 text-xs sm:text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                  >
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Payment Method Buttons */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Payment Method
            </label>
            {selectedCategory === 'crypto' ? (
              <div className="space-y-2">
                {/* Bitcoin Row */}
                <div className="flex flex-wrap gap-2">
                  {availablePayments.filter(p => ['lightning', 'bitcoin'].includes(p.id)).map((payment) => (
                    <Button
                      key={payment.id}
                      variant={selectedMethod === payment.id ? "default" : "outline"}
                      onClick={() => handlePaymentMethodSelect(payment.id)}
                      className="flex-1 min-w-0 h-12 sm:h-14 text-xs sm:text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {payment.icon}
                        <span className="truncate">{payment.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                {/* USDT Row */}
                {availablePayments.filter(p => ['usdt-ethereum', 'usdt-tron'].includes(p.id)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availablePayments.filter(p => ['usdt-ethereum', 'usdt-tron'].includes(p.id)).map((payment) => (
                      <Button
                        key={payment.id}
                        variant={selectedMethod === payment.id ? "default" : "outline"}
                        onClick={() => handlePaymentMethodSelect(payment.id)}
                        className="flex-1 min-w-0 h-12 sm:h-14 text-xs sm:text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {payment.icon}
                          <span className="truncate">{payment.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availablePayments.map((payment) => (
                  <Button
                    key={payment.id}
                    variant={selectedMethod === payment.id ? "default" : "outline"}
                    onClick={() => handlePaymentMethodSelect(payment.id)}
                    className="flex-1 min-w-0 h-12 sm:h-14 text-xs sm:text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {payment.icon}
                      <span className="truncate">{payment.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Connectivity Status Banner */}
          {!isOnline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-yellow-700">
                <WifiOff className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Offline - Limited payment methods available</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                QR code payments require internet connection. Cash payments are available offline.
              </p>
            </div>
          )}

          {/* QR Code Section - Dynamic QR */}
          {paymentStatus !== 'completed' && qrPaymentResult && (
            <div className="bg-background rounded-lg border border-border p-6 mb-6">
              <div className="text-center">
                {/* Dynamic QR Code */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                  {isGeneratingQR ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                      <p className="text-xs text-muted-foreground">Generating QR code...</p>
                    </div>
                  ) : (
                    <img 
                      src={qrPaymentResult.qrCode} 
                      alt="Payment QR Code" 
                      className="w-full h-full object-contain rounded-md"
                    />
                  )}
                </div>
                
                {/* Payment Instructions */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {getPaymentInstructions()}
                  </p>
                  
                  {/* Payment URL for testing */}
                  {process.env.NODE_ENV === 'development' && qrPaymentResult.paymentUrl && (
                    <div className="text-xs text-muted-foreground border rounded p-2 max-w-xs mx-auto">
                      <p className="font-medium mb-1">Payment URL (Dev):</p>
                      <p className="break-all">{qrPaymentResult.paymentUrl}</p>
                    </div>
                  )}
                  
                  {/* Expiration timer */}
                  <p className="text-xs text-muted-foreground">
                    QR code expires: {qrPaymentResult.expiresAt.toLocaleTimeString()}
                  </p>
                  
                  {/* Real-time status updates */}
                  {lastPaymentUpdate && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        (paymentStatus as PaymentStatus) === 'waiting' ? 'bg-yellow-500 animate-pulse' :
                        (paymentStatus as PaymentStatus) === 'confirming' ? 'bg-blue-500 animate-pulse' :
                        (paymentStatus as PaymentStatus) === 'completed' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-muted-foreground">
                        Last update: {lastPaymentUpdate.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom QR Code Section - For user-uploaded QR codes */}
          {paymentStatus === 'waiting' && !qrPaymentResult && isCustomQRProvider(selectedMethod) && (
            <div className="bg-background rounded-lg border border-border p-6 mb-6">
              <div className="text-center">
                {/* Custom QR Code Display */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                  {(() => {
                    const provider = getCustomQRProvider()
                    if (!provider) {
                      return (
                        <div className="text-center">
                          <QrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Loading QR Code...</p>
                        </div>
                      )
                    }
                    
                    // Display actual uploaded QR code image
                    if (provider.qrCodeImageData) {
                      return (
                        <img 
                          src={provider.qrCodeImageData} 
                          alt={`${provider.name} QR Code`}
                          className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-md border border-gray-200"
                        />
                      )
                    } else {
                      // Fallback if no image data available
                      return (
                        <div className="text-center">
                          <QrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{provider.name} QR Code</p>
                          <p className="text-xs text-muted-foreground mt-1">Image not available</p>
                        </div>
                      )
                    }
                  })()}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {getCustomQRProvider()?.name} Payment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Customer scans your {getCustomQRProvider()?.name} QR code to pay {formatAmount(amount)}
                  </p>
                  {/* Fee information */}
                  {(() => {
                    const provider = getCustomQRProvider()
                    if (provider && (provider.percentageFee > 0 || provider.fixedFee > 0)) {
                      const feeAmount = (amount * provider.percentageFee / 100) + provider.fixedFee
                      return (
                        <p className="text-xs text-muted-foreground">
                          Processing fee: {provider.percentageFee > 0 && `${provider.percentageFee}%`}
                          {provider.percentageFee > 0 && provider.fixedFee > 0 && ' + '}
                          {provider.fixedFee > 0 && `$${provider.fixedFee.toFixed(2)}`}
                          {' '}(${feeAmount.toFixed(2)} total)
                        </p>
                      )
                    }
                    return null
                  })()}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Tip:</strong> Display this QR code prominently at your counter for customers to scan with their {getCustomQRProvider()?.name} app
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Static QR Code Section - For crypto payments */}
          {paymentStatus === 'waiting' && !qrPaymentResult && showQRCode && !isCustomQRProvider(selectedMethod) && (
            <div className="bg-background rounded-lg border border-border p-6 mb-6">
              <div className="text-center">
                {/* Static QR Code Pattern (for crypto payments) */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 bg-black rounded-md flex items-center justify-center">
                    {/* Simplified QR Code Pattern */}
                    <div className="w-full h-full p-2 grid grid-cols-10 gap-px">
                      {Array.from({ length: 100 }).map((_, i) => {
                        const row = Math.floor(i / 10)
                        const col = i % 10
                        const isCorner = 
                          (row < 3 && col < 3) || // Top-left
                          (row < 3 && col > 6) || // Top-right
                          (row > 6 && col < 3) // Bottom-left
                        const isData = !isCorner && Math.random() > 0.4
                        const isActive = isCorner || isData
                        
                        return (
                          <div
                            key={i}
                            className={`w-full h-full ${isActive ? 'bg-black' : 'bg-white'}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getPaymentInstructions()}
                </p>
              </div>
            </div>
          )}

          {/* Cash Payment Instructions */}
          {paymentStatus === 'waiting' && selectedMethod === 'cash' && (
            <div className="bg-background rounded-lg border border-border p-6 mb-6">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {getPaymentInstructions()}
                </p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  Amount Due: {formatAmount(amount)}
                </p>
              </div>
            </div>
          )}

          {/* Credit Card Payment Instructions */}
          {paymentStatus === 'waiting' && selectedCategory === 'processor' && (
            <div className="bg-background rounded-lg border border-border p-6 mb-6">
              <div className="text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {getPaymentInstructions()}
                </p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  Amount Due: {formatAmount(amount)}
                </p>
              </div>
            </div>
          )}

          {/* Payment Status - Enhanced with connectivity */}
          <div className="bg-accent/20 border border-accent/20 rounded-md p-4 mb-6">
            <div className="text-center">
              <div className="text-sm sm:text-base font-medium text-foreground mb-1">
                <span className="inline-block">Payment Status:</span>{' '}
                <span className="text-accent font-semibold">
                  {paymentStatus === 'pending' && 'Setting up...'}
                  {paymentStatus === 'waiting' && 'Waiting for confirmation'}
                  {paymentStatus === 'confirming' && 'Confirming transaction...'}
                  {paymentStatus === 'completed' && 'Payment confirmed!'}
                  {paymentStatus === 'failed' && 'Payment failed'}
                  {paymentStatus === 'expired' && 'Payment expired'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {paymentStatus === 'pending' && 'Generating payment QR code...'}
                {paymentStatus === 'waiting' && 'Transaction will be automatically confirmed once received'}
                {paymentStatus === 'confirming' && 'Please wait while we verify the payment'}
                {paymentStatus === 'completed' && 'Thank you for your payment'}
                {paymentStatus === 'failed' && 'Please try again or use a different payment method'}
                {paymentStatus === 'expired' && 'QR code has expired. Please generate a new payment'}
              </p>
              
              {/* Connectivity indicator */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-3 h-3 mr-1" />
                    <span className="text-xs">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600">
                    <WifiOff className="w-3 h-3 mr-1" />
                    <span className="text-xs">Offline</span>
                  </div>
                )}
                
                {/* Real-time monitoring indicator */}
                {qrPaymentResult && paymentStatus !== 'completed' && paymentStatus !== 'failed' && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1"></div>
                    <span className="text-xs">Monitoring</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-12 sm:h-14 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
              disabled={paymentStatus === 'confirming' || isGeneratingQR}
            >
              Cancel Payment
            </Button>
            
            {/* Regenerate QR button for expired payments */}
            {paymentStatus === 'expired' && qrPaymentResult && (
              <Button
                onClick={() => generateDynamicQR(selectedMethod)}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
                disabled={!isOnline || isGeneratingQR}
              >
                {isGeneratingQR ? 'Generating...' : 'New QR Code'}
              </Button>
            )}
            
            {/* Manual refresh button for failed payments */}
            {paymentStatus === 'failed' && qrPaymentResult && (
              <Button
                onClick={() => generateDynamicQR(selectedMethod)}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
                disabled={!isOnline || isGeneratingQR}
              >
                {isGeneratingQR ? 'Generating...' : 'Try Again'}
              </Button>
            )}
            
            {/* Debug button for testing - remove in production */}
            {process.env.NODE_ENV === 'development' && paymentStatus === 'waiting' && !qrPaymentResult && (
              <Button
                onClick={handleSimulatePayment}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
              >
                {selectedMethod === 'cash' ? 'Confirm Cash' : 'Simulate Payment'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 