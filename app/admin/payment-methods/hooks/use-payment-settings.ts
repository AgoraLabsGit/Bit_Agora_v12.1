/**
 * BitAgora Admin Payment Settings Hook
 * 
 * Advanced hook for admin configuration of payment methods and settings
 * Handles full CRUD operations for payment configuration management
 * 
 * Features:
 * - Complete payment settings form management (crypto addresses, processors, security)
 * - Payment fees configuration for each method
 * - Payment credentials management (API keys, tokens)
 * - QR provider file upload and management
 * - Comprehensive error handling with BitAgora error types
 * - Form validation and state management
 * 
 * Usage: Admin payment settings page only
 * Note: For POS payment display, see hooks/use-payment-settings.ts
 * 
 * @version 3.0.0
 * @author BitAgora Development Team
 */

// BitAgora Payment Settings Hook
// Following BitAgora implementation patterns

import { useState, useEffect, useCallback } from 'react'
import { PaymentSettingsAPI } from '../services/payment-settings-api'
import { 
  PaymentFormData, 
  PaymentFees, 
  PaymentCredentials,
  QRProvider,
  LoadingState, 
  ErrorState 
} from '../types/payment-settings'
import { BitAgoraError, handleBitAgoraError } from '@/lib/errors'

const defaultFormData: PaymentFormData = {
  // Basic Payment Methods
  acceptCash: true,
  acceptCards: true,
  
  // Crypto Payment Methods
  acceptBitcoin: false,
  acceptBitcoinLightning: false,
  acceptUsdtEthereum: false,
  acceptUsdtTron: false,
  
  // Payment Processors
  stripeEnabled: false,
  paypalEnabled: false,
  squareEnabled: false,
  
  // Regional Payment Methods
  mercadoPagoEnabled: false,
  pixEnabled: false,
  
  // Crypto Wallet Addresses
  bitcoinWalletAddress: '',
  bitcoinLightningAddress: '',
  usdtEthereumWalletAddress: '',
  usdtTronWalletAddress: '',
  
  // Strike API Integration
  strikeApiKey: '',
  
  // Security Settings
  requireSignature: true,
  requireId: false,
  autoSettle: true,
  
  // QR Payment System
  enableQRPayments: false,
  customQRProviders: [],
  
  // Discount Settings
  bitcoinDiscount: '',
  lightningDiscount: '',
  usdtEthDiscount: '',
  usdtTronDiscount: '',
  
  // Regional Payment Configuration
  mercadoPagoRegion: 'argentina',
  pixRegion: 'brazil'
}

const defaultFees: PaymentFees = {
  cash: '0',
  bitcoin: '0',
  bitcoinLightning: '0',
  usdtEthereum: '0',
  usdtTron: '0',
  stripe: '2.9',
  paypal: '3.5',
  square: '2.6',
  
  // Regional Payment Fees
  mercadoPago: '3.0',
  pix: '0.5'
}

const defaultCredentials: PaymentCredentials = {
  stripeApiKey: '',
  paypalClientId: '',
  squareApplicationId: '',
  
  // Strike API Key for Lightning payments
  strikeApiKey: '',
  
  // Regional Payment Credentials
  mercadoPagoAccessToken: '',
  mercadoPagoUserId: '',
  pixApiKey: '',
  pixCertificatePath: ''
}

export const usePaymentSettings = () => {
  // State Management
  const [formData, setFormData] = useState<PaymentFormData>(defaultFormData)
  const [fees, setFees] = useState<PaymentFees>(defaultFees)
  const [credentials, setCredentials] = useState<PaymentCredentials>(defaultCredentials)
  const [isSaved, setIsSaved] = useState(false)
  
  const [loading, setLoading] = useState<LoadingState>({
    settings: false,
    fees: false,
    credentials: false,
    qrProviders: false,
    saving: false,
    initial: true
  })
  
  const [errors, setErrors] = useState<ErrorState>({
    settings: null,
    fees: null,
    credentials: null,
    qrProviders: null,
    saving: null
  })

  // Load all payment data
  const loadPaymentData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }))
      setErrors({
        settings: null,
        fees: null,
        credentials: null,
        qrProviders: null,
        saving: null
      })

      // Load all data in parallel
      const [settingsData, feesData, credentialsData, qrProviders] = await Promise.all([
        PaymentSettingsAPI.loadSettings(),
        PaymentSettingsAPI.loadFees(),
        PaymentSettingsAPI.loadCredentials(),
        PaymentSettingsAPI.loadQRProviders()
      ])

      // Update form data with QR providers
      const updatedFormData = {
        ...settingsData,
        customQRProviders: qrProviders,
        enableQRPayments: qrProviders.some(p => p.enabled)
      }

      setFormData(updatedFormData)
      setFees(feesData)
      setCredentials(credentialsData)

    } catch (error) {
      const errorMessage = error instanceof BitAgoraError 
        ? handleBitAgoraError(error)
        : 'Failed to load payment data'
      
      setErrors(prev => ({ ...prev, settings: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, initial: false }))
    }
  }, [])

  // Save all payment data
  const savePaymentData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }))
      setErrors(prev => ({ ...prev, saving: null }))

      // Save settings first
      await PaymentSettingsAPI.saveSettings(formData)

      // Handle QR providers
      if (formData.enableQRPayments && formData.customQRProviders.length > 0) {
        // Delete existing custom providers and save new ones
        const existingProviders = await PaymentSettingsAPI.loadQRProviders()
        
        // Delete existing custom providers
        for (const existingProvider of existingProviders) {
          await PaymentSettingsAPI.deleteQRProvider(existingProvider.id)
        }

        // Save new providers
        for (const provider of formData.customQRProviders) {
          if (provider.name && provider.file) {
            await PaymentSettingsAPI.saveQRProvider({
              name: provider.name,
              file: provider.file,
              feePercentage: provider.feePercentage,
              fixedFee: provider.fixedFee,
              enabled: provider.enabled
            })
          }
        }
      } else {
        // Remove all custom providers if QR payments are disabled
        const existingProviders = await PaymentSettingsAPI.loadQRProviders()
        for (const existingProvider of existingProviders) {
          await PaymentSettingsAPI.deleteQRProvider(existingProvider.id)
        }
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)

    } catch (error) {
      const errorMessage = error instanceof BitAgoraError 
        ? handleBitAgoraError(error)
        : 'Failed to save payment data'
      
      setErrors(prev => ({ ...prev, saving: errorMessage }))
      throw error // Re-throw to allow component to handle
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }, [formData])

  // Form field update handlers
  const updateField = useCallback(<K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }, [])

  const updateFeeField = useCallback((feeType: keyof PaymentFees, value: string) => {
    setFees(prev => ({ ...prev, [feeType]: value }))
    setIsSaved(false)
  }, [])

  const updateCredentialField = useCallback((
    field: keyof PaymentCredentials, 
    value: string
  ) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }, [])

  // QR Provider management
  const addQRProvider = useCallback(() => {
    const newProvider: QRProvider = {
      id: `qr-${Date.now()}`,
      name: '',
      file: null,
      feePercentage: '2.5',
      fixedFee: '0.00',
      enabled: true
    }
    
    setFormData(prev => ({
      ...prev,
      customQRProviders: [...prev.customQRProviders, newProvider]
    }))
    setIsSaved(false)
  }, [])

  const removeQRProvider = useCallback((providerId: string) => {
    setFormData(prev => ({
      ...prev,
      customQRProviders: prev.customQRProviders.filter(p => p.id !== providerId)
    }))
    setIsSaved(false)
  }, [])

  const updateQRProvider = useCallback((
    providerId: string, 
    field: keyof QRProvider, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      customQRProviders: prev.customQRProviders.map(p => 
        p.id === providerId ? { ...p, [field]: value } : p
      )
    }))
    setIsSaved(false)
  }, [])

  // Load data on mount
  useEffect(() => {
    loadPaymentData()
  }, [loadPaymentData])

  return {
    // Data
    formData,
    fees,
    credentials,
    
    // State
    loading,
    errors,
    isSaved,
    
    // Actions
    updateField,
    updateFeeField,
    updateCredentialField,
    savePaymentData,
    reloadData: loadPaymentData,
    
    // QR Provider actions
    addQRProvider,
    removeQRProvider,
    updateQRProvider
  }
} 