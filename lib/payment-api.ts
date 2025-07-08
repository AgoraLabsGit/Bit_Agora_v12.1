// Payment Settings API
// Handles database operations for merchant payment configurations
// Complies with Frontend-First Mock Database Strategy

import { z } from 'zod'
import { mockStorage } from './mock-storage'

// Types & Interfaces
export interface PaymentSettings {
  id: string
  merchantId: string
  acceptCash: boolean
  acceptCards: boolean
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUsdtEthereum: boolean
  acceptUsdtTron: boolean
  bitcoinWalletAddress?: string
  bitcoinLightningAddress?: string
  usdtEthereumWalletAddress?: string
  usdtTronWalletAddress?: string
  stripeEnabled: boolean
  paypalEnabled: boolean
  squareEnabled: boolean
  requireSignature: boolean
  requireId: boolean
  autoSettle: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentCredentials {
  id: string
  merchantId: string
  processorName: string
  apiKeyEncrypted?: string
  clientIdEncrypted?: string
  applicationIdEncrypted?: string
  webhookSecretEncrypted?: string
  environment: 'sandbox' | 'production'
  active: boolean
  lastTested?: string
  testStatus?: 'success' | 'failed' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface PaymentFees {
  id: string
  merchantId: string
  paymentMethod: string
  percentageFee: number
  fixedFee: number
  currency: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface QRProvider {
  id: string
  merchantId: string
  providerName: string
  providerRegion: string
  providerType: 'regional' | 'custom'
  customName?: string
  customDescription?: string
  enabled: boolean
  qrCodeFilePath?: string
  qrCodeImageData?: string // Base64 encoded image data
  percentageFee: number
  fixedFee: number
  currency: string
  apiEndpoint?: string
  apiKeyEncrypted?: string
  webhookUrl?: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingProgress {
  id: string
  merchantId: string
  adminSetupCompleted: boolean
  businessSetupCompleted: boolean
  paymentSetupCompleted: boolean
  qrSetupCompleted: boolean
  adminSetupCompletedAt?: string
  businessSetupCompletedAt?: string
  paymentSetupCompletedAt?: string
  qrSetupCompletedAt?: string
  onboardingCompleted: boolean
  onboardingCompletedAt?: string
  currentStep: 'admin-setup' | 'business-setup' | 'payment-setup' | 'qr-setup' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Validation Schemas
export const PaymentSettingsSchema = z.object({
  acceptCash: z.boolean(),
  acceptCards: z.boolean(),
  acceptBitcoin: z.boolean(),
  acceptBitcoinLightning: z.boolean(),
  acceptUsdtEthereum: z.boolean(),
  acceptUsdtTron: z.boolean(),
  bitcoinWalletAddress: z.string().optional(),
  bitcoinLightningAddress: z.string().optional(),
  usdtEthereumWalletAddress: z.string().optional(),
  usdtTronWalletAddress: z.string().optional(),
  stripeEnabled: z.boolean(),
  paypalEnabled: z.boolean(),
  squareEnabled: z.boolean(),
  requireSignature: z.boolean(),
  requireId: z.boolean(),
  autoSettle: z.boolean(),
})

export const PaymentCredentialsSchema = z.object({
  processorName: z.string(),
  apiKeyEncrypted: z.string().optional(),
  clientIdEncrypted: z.string().optional(),
  applicationIdEncrypted: z.string().optional(),
  webhookSecretEncrypted: z.string().optional(),
  environment: z.enum(['sandbox', 'production']),
  active: z.boolean(),
})

export const PaymentFeesSchema = z.object({
  paymentMethod: z.string(),
  percentageFee: z.number().min(0).max(100),
  fixedFee: z.number().min(0),
  currency: z.string().length(3),
  active: z.boolean(),
})

// Mock Database Implementation (Frontend-First Development)
// Uses mockStorage to comply with Frontend-First Mock Database Strategy
// Ready for real database integration via environment toggle
class PaymentSettingsDatabase {
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'; // Default to mock
  private getStorageKey(type: string, merchantId: string): string {
    return `bitagora_${type}_${merchantId}`
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 11)
  }

  // Future: Real database operations when useMock = false
  private async executeQuery(operation: string, data?: any): Promise<any> {
    if (this.useMock) {
      // Continue using mockStorage (current mock implementation)
      return { success: true, data: data || {} }
    } else {
      // TODO: Implement real database operations (Supabase/PostgreSQL)
      throw new Error('Real database not implemented yet - keeping frontend-first approach')
    }
  }

  // Payment Settings CRUD
  async getPaymentSettings(merchantId: string): Promise<ApiResponse<PaymentSettings>> {
    try {
      const key = this.getStorageKey('payment_settings', merchantId)
      const stored = mockStorage.getItem(key)
      
      if (!stored) {
        // Return success with null data - let frontend handle initialization
        return {
          success: true,
          data: null as any,
          message: 'No payment settings found'
        }
      }
      
      const settings = JSON.parse(stored) as PaymentSettings
      
      return {
        success: true,
        data: settings,
        message: 'Payment settings retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async savePaymentSettings(merchantId: string, settings: Partial<PaymentSettings>): Promise<ApiResponse<PaymentSettings>> {
    try {
      const validation = PaymentSettingsSchema.safeParse(settings)
      if (!validation.success) {
        return { success: false, error: 'Invalid payment settings' }
      }

      const key = this.getStorageKey('payment_settings', merchantId)
      const existing = mockStorage.getItem(key)
      const currentSettings = existing ? JSON.parse(existing) : {}

      const updatedSettings: PaymentSettings = {
        ...currentSettings,
        ...settings,
        id: currentSettings.id || this.generateId(),
        merchantId,
        updatedAt: new Date().toISOString(),
        createdAt: currentSettings.createdAt || new Date().toISOString(),
      }

      mockStorage.setItem(key, JSON.stringify(updatedSettings))

      return { success: true, data: updatedSettings, message: 'Payment settings saved successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to save payment settings' }
    }
  }

  // Payment Credentials CRUD
  async getPaymentCredentials(merchantId: string): Promise<ApiResponse<PaymentCredentials[]>> {
    try {
      const key = this.getStorageKey('payment_credentials', merchantId)
      const stored = mockStorage.getItem(key)
      const credentials = stored ? JSON.parse(stored) : []
      
      return { success: true, data: credentials }
    } catch (error) {
      return { success: false, error: 'Failed to fetch payment credentials' }
    }
  }

  async savePaymentCredentials(merchantId: string, processorName: string, credentials: Partial<PaymentCredentials>): Promise<ApiResponse<PaymentCredentials>> {
    try {
      // Include processorName in the validation object
      const credentialsWithProcessor = {
        ...credentials,
        processorName
      }
      
      const validation = PaymentCredentialsSchema.safeParse(credentialsWithProcessor)
      if (!validation.success) {
        return { 
          success: false, 
          error: 'Invalid credentials data', 
          message: validation.error.errors.map(e => e.message).join(', ')
        }
      }

      const existing = await this.getPaymentCredentials(merchantId)
      const existingCredentials = existing.data || []
      
      const existingIndex = existingCredentials.findIndex(c => c.processorName === processorName)
      
      const updatedCredential: PaymentCredentials = {
        id: existingIndex >= 0 ? existingCredentials[existingIndex].id : this.generateId(),
        merchantId,
        processorName,
        ...credentials,
        environment: credentials.environment || 'sandbox',
        active: credentials.active ?? true,
        updatedAt: new Date().toISOString(),
        createdAt: existingIndex >= 0 ? existingCredentials[existingIndex].createdAt : new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        existingCredentials[existingIndex] = updatedCredential
      } else {
        existingCredentials.push(updatedCredential)
      }

      const key = this.getStorageKey('payment_credentials', merchantId)
      mockStorage.setItem(key, JSON.stringify(existingCredentials))

      return { success: true, data: updatedCredential, message: 'Credentials saved successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to save credentials' }
    }
  }

  // Payment Fees CRUD
  async getPaymentFees(merchantId: string): Promise<ApiResponse<PaymentFees[]>> {
    try {
      const key = this.getStorageKey('payment_fees', merchantId)
      const stored = mockStorage.getItem(key)
      
      if (!stored) {
        // Return default fees
        const defaultFees: PaymentFees[] = [
          { id: this.generateId(), merchantId, paymentMethod: 'cash', percentageFee: 0, fixedFee: 0, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'bitcoin', percentageFee: 0, fixedFee: 0, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'bitcoin_lightning', percentageFee: 0, fixedFee: 0, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'usdt_ethereum', percentageFee: 0, fixedFee: 0, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'usdt_tron', percentageFee: 0, fixedFee: 0, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'stripe', percentageFee: 2.9, fixedFee: 0.3, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'paypal', percentageFee: 3.5, fixedFee: 0.3, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: this.generateId(), merchantId, paymentMethod: 'square', percentageFee: 2.6, fixedFee: 0.1, currency: 'USD', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]
        
        mockStorage.setItem(key, JSON.stringify(defaultFees))
        return { success: true, data: defaultFees }
      }

      return { success: true, data: JSON.parse(stored) }
    } catch (error) {
      return { success: false, error: 'Failed to fetch payment fees' }
    }
  }

  async savePaymentFees(merchantId: string, fees: PaymentFees[]): Promise<ApiResponse<PaymentFees[]>> {
    try {
      for (const fee of fees) {
        const validation = PaymentFeesSchema.safeParse(fee)
        if (!validation.success) {
          return { success: false, error: 'Invalid fee data' }
        }
      }

      const key = this.getStorageKey('payment_fees', merchantId)
      mockStorage.setItem(key, JSON.stringify(fees))

      return { success: true, data: fees, message: 'Payment fees saved successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to save payment fees' }
    }
  }

  // QR Providers CRUD
  async getQRProviders(merchantId: string): Promise<ApiResponse<QRProvider[]>> {
    try {
      const key = this.getStorageKey('qr_providers', merchantId)
      const stored = mockStorage.getItem(key)
      const providers = stored ? JSON.parse(stored) : []
      
      return { success: true, data: providers }
    } catch (error) {
      return { success: false, error: 'Failed to fetch QR providers' }
    }
  }

  async saveQRProvider(merchantId: string, provider: Partial<QRProvider>): Promise<ApiResponse<QRProvider>> {
    try {
      const existing = await this.getQRProviders(merchantId)
      const existingProviders = existing.data || []
      
      const updatedProvider: QRProvider = {
        id: provider.id || this.generateId(),
        merchantId,
        providerName: provider.providerName || '',
        providerRegion: provider.providerRegion || '',
        providerType: provider.providerType || 'regional',
        customName: provider.customName,
        customDescription: provider.customDescription,
        enabled: provider.enabled || false,
        qrCodeFilePath: provider.qrCodeFilePath,
        qrCodeImageData: provider.qrCodeImageData, // Store the base64 image data
        percentageFee: provider.percentageFee || 0,
        fixedFee: provider.fixedFee || 0,
        currency: provider.currency || 'USD',
        apiEndpoint: provider.apiEndpoint,
        apiKeyEncrypted: provider.apiKeyEncrypted,
        webhookUrl: provider.webhookUrl,
        createdAt: provider.id ? existingProviders.find(p => p.id === provider.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const existingIndex = existingProviders.findIndex(p => p.id === updatedProvider.id)
      if (existingIndex >= 0) {
        existingProviders[existingIndex] = updatedProvider
      } else {
        existingProviders.push(updatedProvider)
      }

      const key = this.getStorageKey('qr_providers', merchantId)
      mockStorage.setItem(key, JSON.stringify(existingProviders))

      return { success: true, data: updatedProvider, message: 'QR provider saved successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to save QR provider' }
    }
  }

  async deleteQRProvider(merchantId: string, providerId: string): Promise<ApiResponse<boolean>> {
    try {
      const existing = await this.getQRProviders(merchantId)
      const existingProviders = existing.data || []
      
      const filteredProviders = existingProviders.filter(p => p.id !== providerId)
      
      const key = this.getStorageKey('qr_providers', merchantId)
      mockStorage.setItem(key, JSON.stringify(filteredProviders))

      return { success: true, data: true, message: 'QR provider deleted successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to delete QR provider' }
    }
  }

  async updateQRConfiguration(merchantId: string, qrConfig: any): Promise<ApiResponse<any>> {
    try {
      // Transform the QR configuration from the frontend format to QRProvider format
      const qrProviders: QRProvider[] = []
      
      for (const [regionName, providers] of Object.entries(qrConfig)) {
        const regionProviders = providers as any[]
        
        for (const provider of regionProviders) {
          const qrProvider: QRProvider = {
            id: provider.id || this.generateId(),
            merchantId,
            providerName: provider.name,
            providerRegion: regionName,
            providerType: regionName === 'Custom' ? 'custom' : 'regional',
            customName: provider.name,
            customDescription: provider.description,
            enabled: provider.enabled,
            qrCodeFilePath: provider.qrCode ? `qr-codes/${provider.id}.png` : undefined,
            percentageFee: parseFloat(provider.customFee || provider.defaultFee),
            fixedFee: parseFloat(provider.customFixedFee || provider.fixedFee),
            currency: 'USD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          qrProviders.push(qrProvider)
        }
      }

      // Replace all QR providers for this merchant
      const key = this.getStorageKey('qr_providers', merchantId)
      mockStorage.setItem(key, JSON.stringify(qrProviders))

      return { success: true, data: qrProviders, message: 'QR configuration updated successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to update QR configuration' }
    }
  }

  // Onboarding Progress CRUD
  async getOnboardingProgress(merchantId: string): Promise<ApiResponse<OnboardingProgress>> {
    try {
      const key = this.getStorageKey('onboarding_progress', merchantId)
      const stored = mockStorage.getItem(key)
      
      if (!stored) {
        // Return default progress
        const defaultProgress: OnboardingProgress = {
          id: this.generateId(),
          merchantId,
          adminSetupCompleted: false,
          businessSetupCompleted: false,
          paymentSetupCompleted: false,
          qrSetupCompleted: false,
          onboardingCompleted: false,
          currentStep: 'admin-setup',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        mockStorage.setItem(key, JSON.stringify(defaultProgress))
        return { success: true, data: defaultProgress }
      }

      return { success: true, data: JSON.parse(stored) }
    } catch (error) {
      return { success: false, error: 'Failed to fetch onboarding progress' }
    }
  }

  async updateOnboardingProgress(merchantId: string, progress: Partial<OnboardingProgress>): Promise<ApiResponse<OnboardingProgress>> {
    try {
      const existing = await this.getOnboardingProgress(merchantId)
      const existingData = existing.data || {} as OnboardingProgress

      const updatedProgress: OnboardingProgress = {
        ...existingData,
        ...progress,
        merchantId,
        updatedAt: new Date().toISOString(),
      }

      // Auto-update completion timestamps
      if (progress.adminSetupCompleted && !existingData.adminSetupCompleted) {
        updatedProgress.adminSetupCompletedAt = new Date().toISOString()
      }
      if (progress.businessSetupCompleted && !existingData.businessSetupCompleted) {
        updatedProgress.businessSetupCompletedAt = new Date().toISOString()
      }
      if (progress.paymentSetupCompleted && !existingData.paymentSetupCompleted) {
        updatedProgress.paymentSetupCompletedAt = new Date().toISOString()
      }
      if (progress.qrSetupCompleted && !existingData.qrSetupCompleted) {
        updatedProgress.qrSetupCompletedAt = new Date().toISOString()
      }

      // Check if onboarding is complete
      if (updatedProgress.adminSetupCompleted && updatedProgress.businessSetupCompleted && 
          updatedProgress.paymentSetupCompleted && updatedProgress.qrSetupCompleted) {
        updatedProgress.onboardingCompleted = true
        updatedProgress.onboardingCompletedAt = new Date().toISOString()
        updatedProgress.currentStep = 'completed'
      }

      const key = this.getStorageKey('onboarding_progress', merchantId)
      mockStorage.setItem(key, JSON.stringify(updatedProgress))

      return { success: true, data: updatedProgress, message: 'Onboarding progress updated successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to update onboarding progress' }
    }
  }

  // Clear all data (for testing)
  clearAllData(merchantId: string) {
    mockStorage.removeItem(this.getStorageKey('payment_settings', merchantId))
    mockStorage.removeItem(this.getStorageKey('payment_credentials', merchantId))
    mockStorage.removeItem(this.getStorageKey('payment_fees', merchantId))
    mockStorage.removeItem(this.getStorageKey('qr_providers', merchantId))
    mockStorage.removeItem(this.getStorageKey('onboarding_progress', merchantId))
    console.log(`All payment data cleared for merchant: ${merchantId}`)
  }
}

// Singleton instance
export const paymentAPI = new PaymentSettingsDatabase()

// Export the class for use in API routes
export { PaymentSettingsDatabase }

// Helper to get current merchant ID (would come from auth in production)
export function getCurrentMerchantId(): string {
  // In production, this would come from authentication/session
  return mockStorage.getItem('bitagora_current_merchant_id') || 'default-merchant'
}

// Helper to set current merchant ID (for testing)
export function setCurrentMerchantId(merchantId: string): void {
  mockStorage.setItem('bitagora_current_merchant_id', merchantId)
} 