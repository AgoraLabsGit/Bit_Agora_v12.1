// BitAgora Error Handling System
// Specific error types and handling for BitAgora POS operations

export enum BitAgoraErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  INVENTORY_ERROR = 'INVENTORY_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CRYPTO_ERROR = 'CRYPTO_ERROR',
  QR_ERROR = 'QR_ERROR'
}

export class BitAgoraError extends Error {
  constructor(
    public type: BitAgoraErrorType,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'BitAgoraError'
  }
}

export const handleBitAgoraError = (error: unknown): string => {
  if (error instanceof BitAgoraError) {
    switch (error.type) {
      case BitAgoraErrorType.AUTHENTICATION_ERROR:
        return 'Please log in again to continue'
      case BitAgoraErrorType.PAYMENT_ERROR:
        return 'Payment processing failed. Please try again.'
      case BitAgoraErrorType.INVENTORY_ERROR:
        return 'Inventory update failed. Product may be out of stock.'
      case BitAgoraErrorType.NETWORK_ERROR:
        return 'Network error. Please check your connection.'
      case BitAgoraErrorType.VALIDATION_ERROR:
        return error.message
      case BitAgoraErrorType.CRYPTO_ERROR:
        return 'Crypto payment configuration error. Please check your wallet addresses.'
      case BitAgoraErrorType.QR_ERROR:
        return 'QR code processing failed. Please check your QR provider settings.'
      default:
        return 'An unexpected error occurred'
    }
  }
  
  return error instanceof Error ? error.message : 'Unknown error'
}

// Error reporting function (placeholder for future integration)
export const reportError = (error: unknown, context: string) => {
  console.error(`[${context}] Error:`, error)
  
  // In production, this would send to error reporting service
  // Example: Sentry, LogRocket, etc.
} 