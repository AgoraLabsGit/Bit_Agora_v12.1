// hooks/use-payment-settings.ts
// Centralized payment settings hook for modular payment components

import { useState, useEffect } from 'react'

export interface PaymentSettings {
  acceptBitcoinLightning?: boolean
  bitcoinLightningAddress?: string
  acceptBitcoin?: boolean
  bitcoinWalletAddress?: string
  acceptUsdtEthereum?: boolean
  usdtEthereumWalletAddress?: string
  acceptUsdtTron?: boolean
  usdtTronWalletAddress?: string
  acceptCards?: boolean
  stripeEnabled?: boolean
  stripePublishableKey?: string
  acceptCash?: boolean
}

export interface QRProvider {
  id: string
  providerName: string
  customName?: string
  enabled: boolean
  qrCodeImageData?: string
}

export interface PaymentOption {
  id: string
  category: 'crypto' | 'qr' | 'cash' | 'card'
  name: string
  enabled: boolean
  icon?: string
  description?: string
}

export const usePaymentSettings = () => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [qrProviders, setQrProviders] = useState<QRProvider[]>([])
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch payment settings
  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings')
      if (!response.ok) {
        throw new Error('Failed to fetch payment settings')
      }
      const data = await response.json()
      
      // Handle API response format: {success: true, data: {...settings}}
      const settings = data.data || data.paymentSettings || {}
      setPaymentSettings(settings)
      return settings
    } catch (err) {
      console.error('Error fetching payment settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payment settings')
      
      // Fallback settings to ensure cash is always available
      const fallbackSettings = {
        bitcoinLightningEnabled: false,
        bitcoinEnabled: false,
        usdtEthereumEnabled: false,
        usdtTronEnabled: false,
        stripeEnabled: false,
        cashEnabled: true,
        qrCodeEnabled: false
      }
      setPaymentSettings(fallbackSettings)
      return fallbackSettings
    }
  }

  // Fetch QR providers
  const fetchQRProviders = async () => {
    try {
      const response = await fetch('/api/qr-providers')
      if (!response.ok) {
        throw new Error('Failed to fetch QR providers')
      }
      const data = await response.json()
      
      // Handle API response format: {success: true, data: [providers...]}
      const providers = data.data || data.qrProviders || []
      setQrProviders(providers)
      return providers
    } catch (err) {
      console.error('Error fetching QR providers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch QR providers')
      return []
    }
  }

  // Generate payment options based on settings
  const generatePaymentOptions = (settings: PaymentSettings, providers: QRProvider[]): PaymentOption[] => {
    const options: PaymentOption[] = []

    // Crypto options - Use API field names
    if (settings.acceptBitcoinLightning && settings.bitcoinLightningAddress) {
      options.push({
        id: 'lightning',
        category: 'crypto',
        name: 'Bitcoin Lightning',
        enabled: true,
        icon: '⚡',
        description: 'Fast Bitcoin payments'
      })
    }

    if (settings.acceptBitcoin && settings.bitcoinWalletAddress) {
      options.push({
        id: 'bitcoin',
        category: 'crypto',
        name: 'Bitcoin',
        enabled: true,
        icon: '₿',
        description: 'Bitcoin on-chain'
      })
    }

    if (settings.acceptUsdtEthereum && settings.usdtEthereumWalletAddress) {
      options.push({
        id: 'usdt-eth',
        category: 'crypto',
        name: 'USDT (Ethereum)',
        enabled: true,
        icon: '💰',
        description: 'USDT on Ethereum'
      })
    }

    if (settings.acceptUsdtTron && settings.usdtTronWalletAddress) {
      options.push({
        id: 'usdt-tron',
        category: 'crypto',
        name: 'USDT (Tron)',
        enabled: true,
        icon: '💰',
        description: 'USDT on Tron'
      })
    }

    // QR Code options
    if (providers.some(p => p.enabled)) {
      options.push({
        id: 'qr-code',
        category: 'qr',
        name: 'QR Payment',
        enabled: true,
        icon: '📱',
        description: 'Mobile payment apps'
      })
    }

    // Cash options - Use API field name
    if (settings.acceptCash) {
      options.push({
        id: 'cash',
        category: 'cash',
        name: 'Cash',
        enabled: true,
        icon: '💵',
        description: 'Cash payment'
      })
    }

    // Card options (future)
    if (settings.stripeEnabled) {
      options.push({
        id: 'stripe',
        category: 'card',
        name: 'Credit Card',
        enabled: true,
        icon: '💳',
        description: 'Credit/Debit card'
      })
    }

    return options
  }

  // Load all payment data
  const loadPaymentData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [settings, providers] = await Promise.all([
        fetchPaymentSettings(),
        fetchQRProviders()
      ])

      if (settings) {
        const options = generatePaymentOptions(settings, providers)
        setPaymentOptions(options)
      }
    } catch (err) {
      console.error('Error loading payment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load payment data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadPaymentData()
  }, [])

  // Utility functions
  const getEnabledOptions = () => paymentOptions.filter(opt => opt.enabled)
  
  const getOptionsByCategory = (category: PaymentOption['category']) => 
    paymentOptions.filter(opt => opt.category === category && opt.enabled)

  const isPaymentMethodEnabled = (methodId: string) => 
    paymentOptions.some(opt => opt.id === methodId && opt.enabled)

  const getPaymentMethodConfig = (methodId: string) => 
    paymentOptions.find(opt => opt.id === methodId)

  return {
    // Data
    paymentSettings,
    qrProviders,
    paymentOptions,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch: loadPaymentData,
    
    // Utilities
    getEnabledOptions,
    getOptionsByCategory,
    isPaymentMethodEnabled,
    getPaymentMethodConfig
  }
} 