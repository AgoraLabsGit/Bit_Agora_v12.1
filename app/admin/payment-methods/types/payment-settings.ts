// BitAgora Payment Settings Types
// Following BitAgora implementation patterns

export interface PaymentFormData {
  // Basic Payment Methods
  acceptCash: boolean
  acceptCards: boolean
  
  // Crypto Payment Methods
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUsdtEthereum: boolean
  acceptUsdtTron: boolean
  
  // Payment Processors
  stripeEnabled: boolean
  paypalEnabled: boolean
  squareEnabled: boolean
  
  // Crypto Wallet Addresses
  bitcoinWalletAddress: string
  bitcoinLightningAddress: string
  usdtEthereumWalletAddress: string
  usdtTronWalletAddress: string
  
  // Security Settings
  requireSignature: boolean
  requireId: boolean
  autoSettle: boolean
  
  // QR Payment System
  enableQRPayments: boolean
  customQRProviders: QRProvider[]
  
  // Discount Settings
  bitcoinDiscount: string
  lightningDiscount: string
  usdtEthDiscount: string
  usdtTronDiscount: string
}

export interface PaymentFees {
  cash: string
  bitcoin: string
  bitcoinLightning: string
  usdtEthereum: string
  usdtTron: string
  stripe: string
  paypal: string
  square: string
}

export interface PaymentCredentials {
  stripeApiKey: string
  paypalClientId: string
  squareApplicationId: string
}

export interface QRProvider {
  id: string
  name: string
  file: File | null
  feePercentage: string
  fixedFee: string
  enabled: boolean
  qrCodeImageData?: string
}

export interface PaymentSettingsApiData {
  // Payment Methods
  acceptCash: boolean
  acceptCards: boolean
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUsdtEthereum: boolean
  acceptUsdtTron: boolean
  
  // Wallet Addresses
  bitcoinWalletAddress?: string
  bitcoinLightningAddress?: string
  usdtEthereumWalletAddress?: string
  usdtTronWalletAddress?: string
  
  // Payment Processors
  stripeEnabled: boolean
  paypalEnabled: boolean
  squareEnabled: boolean
  
  // Security Settings
  requireSignature: boolean
  requireId: boolean
  autoSettle: boolean
}

export interface PaymentFeesApiData {
  paymentMethod: string
  percentageFee: number
  fixedFee?: number
  currency?: string
}

export interface PaymentCredentialsApiData {
  processorName: string
  apiKeyEncrypted?: string
  clientIdEncrypted?: string
  applicationIdEncrypted?: string
}

export interface QRProviderApiData {
  id: string
  providerName: string
  providerRegion: string
  providerType: 'bitcoin' | 'lightning' | 'usdt' | 'custom'
  customName?: string
  customDescription?: string
  enabled: boolean
  qrCodeFilePath?: string
  qrCodeImageData?: string
  percentageFee: number
  fixedFee: number
  currency: string
}

export interface LoadingState {
  settings: boolean
  fees: boolean
  credentials: boolean
  qrProviders: boolean
  saving: boolean
  initial: boolean
}

export interface ErrorState {
  settings: string | null
  fees: string | null
  credentials: string | null
  qrProviders: string | null
  saving: string | null
}

export interface ValidationErrors {
  [key: string]: string
}

export interface ValidationSuccess {
  [key: string]: boolean
}

// API Response Types following BitAgora patterns
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data?: T[]
  error?: string
} 