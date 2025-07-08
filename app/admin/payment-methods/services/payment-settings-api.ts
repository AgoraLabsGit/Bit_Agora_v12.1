// BitAgora Payment Settings API Service
// Following BitAgora implementation patterns with multi-tenant support

import { 
  PaymentFormData, 
  PaymentFees, 
  PaymentCredentials, 
  QRProvider,
  PaymentSettingsApiData,
  PaymentFeesApiData,
  PaymentCredentialsApiData,
  QRProviderApiData,
  ApiResponse,
  ApiListResponse
} from '../types/payment-settings'
import { BitAgoraError, BitAgoraErrorType } from '@/lib/errors'
import { addMerchantHeaders } from '@/lib/merchant-context'

export class PaymentSettingsAPI {
  private static baseUrl = '/api'
  
  private static async makeRequest<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T> | ApiListResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: addMerchantHeaders({
          'Content-Type': 'application/json',
          ...options?.headers
        })
      })
      
      if (!response.ok) {
        throw new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          `HTTP ${response.status}: ${response.statusText}`
        )
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new BitAgoraError(
          BitAgoraErrorType.VALIDATION_ERROR,
          data.error || 'Operation failed'
        )
      }
      
      return data
    } catch (error) {
      if (error instanceof BitAgoraError) {
        throw error
      }
      
      throw new BitAgoraError(
        BitAgoraErrorType.NETWORK_ERROR,
        `Failed to ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Payment Settings Operations
  static async loadSettings(): Promise<PaymentFormData> {
    const response = await this.makeRequest<PaymentSettingsApiData>('/payment-settings')
    
    // Handle both single object and array responses
    const settingsData = Array.isArray(response.data) 
      ? response.data[0] 
      : response.data
    
    return this.transformApiSettingsToForm(settingsData!)
  }

  static async saveSettings(data: PaymentFormData): Promise<void> {
    const apiData = this.transformFormToApiSettings(data)
    await this.makeRequest('/payment-settings', {
      method: 'PUT',
      body: JSON.stringify(apiData)
    })
  }

  // Payment Fees Operations
  static async loadFees(): Promise<PaymentFees> {
    const response = await this.makeRequest<PaymentFeesApiData>('/payment-fees') as ApiListResponse<PaymentFeesApiData>
    return this.transformApiFeesToForm(response.data || [])
  }

  static async saveFees(fees: PaymentFees): Promise<void> {
    const apiData = this.transformFormToApiFees(fees)
    await this.makeRequest('/payment-fees', {
      method: 'PUT',
      body: JSON.stringify(apiData)
    })
  }

  // Payment Credentials Operations
  static async loadCredentials(): Promise<PaymentCredentials> {
    const response = await this.makeRequest<PaymentCredentialsApiData>('/payment-credentials') as ApiListResponse<PaymentCredentialsApiData>
    return this.transformApiCredentialsToForm(response.data || [])
  }

  static async saveCredentials(credentials: PaymentCredentials): Promise<void> {
    const apiData = this.transformFormToApiCredentials(credentials)
    await this.makeRequest('/payment-credentials', {
      method: 'PUT',
      body: JSON.stringify(apiData)
    })
  }

  // QR Providers Operations
  static async loadQRProviders(): Promise<QRProvider[]> {
    try {
      const response = await this.makeRequest<QRProviderApiData>('/qr-providers') as ApiListResponse<QRProviderApiData>
      
      // Handle both single object and array responses
      const qrData = Array.isArray(response.data) 
        ? response.data 
        : [response.data]
      
      return this.transformApiQRProvidersToForm(qrData.filter(Boolean))
    } catch (error) {
      if (error instanceof BitAgoraError) {
        throw new BitAgoraError(BitAgoraErrorType.QR_ERROR, error.message)
      }
      throw error
    }
  }

  static async saveQRProvider(provider: Omit<QRProvider, 'id'>): Promise<QRProvider> {
    try {
      // Convert file to base64 if present
      let qrCodeImageData: string | undefined
      if (provider.file) {
        qrCodeImageData = await this.convertFileToBase64(provider.file)
      }

      const apiData = {
        providerName: provider.name,
        providerRegion: 'Custom',
        providerType: 'custom' as const,
        customName: provider.name,
        customDescription: `Custom QR payment provider: ${provider.name}`,
        enabled: provider.enabled,
        qrCodeFilePath: provider.file ? `qr-codes/${Date.now()}_${provider.file.name}` : undefined,
        qrCodeImageData,
        percentageFee: parseFloat(provider.feePercentage) || 0,
        fixedFee: parseFloat(provider.fixedFee) || 0,
        currency: 'USD'
      }

      const response = await this.makeRequest<QRProviderApiData>('/qr-providers', {
        method: 'POST',
        body: JSON.stringify(apiData)
      })

      // Handle both single object and array responses
      const providerData = Array.isArray(response.data) 
        ? response.data[0] 
        : response.data

      return this.transformApiQRProviderToForm(providerData!)
    } catch (error) {
      if (error instanceof BitAgoraError) {
        throw new BitAgoraError(BitAgoraErrorType.QR_ERROR, error.message)
      }
      throw error
    }
  }

  static async deleteQRProvider(id: string): Promise<void> {
    try {
      await this.makeRequest(`/qr-providers?id=${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (error instanceof BitAgoraError) {
        throw new BitAgoraError(BitAgoraErrorType.QR_ERROR, error.message)
      }
      throw error
    }
  }

  // Data Transformation Methods
  private static transformApiSettingsToForm(apiData: PaymentSettingsApiData): PaymentFormData {
    return {
      // Basic Payment Methods
      acceptCash: apiData.acceptCash,
      acceptCards: apiData.acceptCards,
      
      // Crypto Payment Methods
      acceptBitcoin: apiData.acceptBitcoin,
      acceptBitcoinLightning: apiData.acceptBitcoinLightning,
      acceptUsdtEthereum: apiData.acceptUsdtEthereum,
      acceptUsdtTron: apiData.acceptUsdtTron,
      
      // Payment Processors
      stripeEnabled: apiData.stripeEnabled,
      paypalEnabled: apiData.paypalEnabled,
      squareEnabled: apiData.squareEnabled,
      
      // Crypto Wallet Addresses
      bitcoinWalletAddress: apiData.bitcoinWalletAddress || '',
      bitcoinLightningAddress: apiData.bitcoinLightningAddress || '',
      usdtEthereumWalletAddress: apiData.usdtEthereumWalletAddress || '',
      usdtTronWalletAddress: apiData.usdtTronWalletAddress || '',
      
      // Security Settings
      requireSignature: apiData.requireSignature,
      requireId: apiData.requireId,
      autoSettle: apiData.autoSettle,
      
      // QR Payment System (will be loaded separately)
      enableQRPayments: false,
      customQRProviders: [],
      
      // Discount Settings (placeholder)
      bitcoinDiscount: '',
      lightningDiscount: '',
      usdtEthDiscount: '',
      usdtTronDiscount: ''
    }
  }

  private static transformFormToApiSettings(formData: PaymentFormData): PaymentSettingsApiData {
    return {
      acceptCash: formData.acceptCash,
      acceptCards: formData.acceptCards,
      acceptBitcoin: formData.acceptBitcoin,
      acceptBitcoinLightning: formData.acceptBitcoinLightning,
      acceptUsdtEthereum: formData.acceptUsdtEthereum,
      acceptUsdtTron: formData.acceptUsdtTron,
      bitcoinWalletAddress: formData.bitcoinWalletAddress,
      bitcoinLightningAddress: formData.bitcoinLightningAddress,
      usdtEthereumWalletAddress: formData.usdtEthereumWalletAddress,
      usdtTronWalletAddress: formData.usdtTronWalletAddress,
      stripeEnabled: formData.stripeEnabled,
      paypalEnabled: formData.paypalEnabled,
      squareEnabled: formData.squareEnabled,
      requireSignature: formData.requireSignature,
      requireId: formData.requireId,
      autoSettle: formData.autoSettle
    }
  }

  private static transformApiFeesToForm(apiData: PaymentFeesApiData[]): PaymentFees {
    const feesObject = apiData.reduce((acc, fee) => {
      acc[fee.paymentMethod as keyof PaymentFees] = fee.percentageFee.toString()
      return acc
    }, {} as any)
    
    // Provide defaults for missing fees
    return {
      cash: feesObject.cash || '0',
      bitcoin: feesObject.bitcoin || '0',
      bitcoinLightning: feesObject.bitcoinLightning || '0',
      usdtEthereum: feesObject.usdtEthereum || '0',
      usdtTron: feesObject.usdtTron || '0',
      stripe: feesObject.stripe || '2.9',
      paypal: feesObject.paypal || '3.5',
      square: feesObject.square || '2.6'
    }
  }

  private static transformFormToApiFees(formData: PaymentFees): PaymentFeesApiData[] {
    return Object.entries(formData).map(([paymentMethod, percentageFee]) => ({
      paymentMethod,
      percentageFee: parseFloat(percentageFee) || 0,
      currency: 'USD'
    }))
  }

  private static transformApiCredentialsToForm(apiData: PaymentCredentialsApiData[]): PaymentCredentials {
    const stripeCredentials = apiData.find(c => c.processorName === 'stripe')
    const paypalCredentials = apiData.find(c => c.processorName === 'paypal')
    const squareCredentials = apiData.find(c => c.processorName === 'square')
    
    return {
      stripeApiKey: stripeCredentials?.apiKeyEncrypted || '',
      paypalClientId: paypalCredentials?.clientIdEncrypted || '',
      squareApplicationId: squareCredentials?.applicationIdEncrypted || ''
    }
  }

  private static transformFormToApiCredentials(formData: PaymentCredentials): PaymentCredentialsApiData[] {
    const credentials: PaymentCredentialsApiData[] = []
    
    if (formData.stripeApiKey) {
      credentials.push({
        processorName: 'stripe',
        apiKeyEncrypted: formData.stripeApiKey
      })
    }
    
    if (formData.paypalClientId) {
      credentials.push({
        processorName: 'paypal',
        clientIdEncrypted: formData.paypalClientId
      })
    }
    
    if (formData.squareApplicationId) {
      credentials.push({
        processorName: 'square',
        applicationIdEncrypted: formData.squareApplicationId
      })
    }
    
    return credentials
  }

  private static transformApiQRProvidersToForm(apiData: QRProviderApiData[]): QRProvider[] {
    return apiData
      .filter(provider => provider.providerType === 'custom')
      .map(provider => ({
        id: provider.id,
        name: provider.customName || provider.providerName,
        file: null, // Files are not persisted across sessions
        feePercentage: provider.percentageFee.toString(),
        fixedFee: provider.fixedFee.toString(),
        enabled: provider.enabled,
        qrCodeImageData: provider.qrCodeImageData
      }))
  }

  private static transformApiQRProviderToForm(apiData: QRProviderApiData): QRProvider {
    return {
      id: apiData.id,
      name: apiData.customName || apiData.providerName,
      file: null,
      feePercentage: apiData.percentageFee.toString(),
      fixedFee: apiData.fixedFee.toString(),
      enabled: apiData.enabled,
      qrCodeImageData: apiData.qrCodeImageData
    }
  }

  private static async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
} 