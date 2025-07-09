/**
 * BitAgora Lightning Configuration
 * 
 * Centralized configuration for Lightning Network payments
 * Contains all constants, limits, and settings for Strike API integration
 * 
 * @version 1.0.0
 * @author BitAgora Development Team
 */

export const LIGHTNING_CONFIG = {
  // Invoice Settings
  INVOICE_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  INVOICE_DESCRIPTION_PREFIX: 'BitAgora POS Payment',
  
  // Payment Monitoring
  MONITORING_INTERVAL: 5000, // 5 seconds
  MAX_MONITORING_TIME: 15 * 60 * 1000, // 15 minutes
  MAX_MONITORING_ATTEMPTS: 180, // 15 minutes / 5 seconds
  
  // API Settings
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000, // 1 second
  RETRY_MAX_DELAY: 30000, // 30 seconds
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Amount Limits (USD)
  MIN_AMOUNT: 0.01, // $0.01
  MAX_AMOUNT: 1000, // $1000
  
  // Caching
  EXCHANGE_RATE_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  BALANCE_CACHE_TTL: 30 * 1000, // 30 seconds
  
  // Fallback Settings
  FALLBACK_EXCHANGE_RATE: 45000, // $45,000 default BTC price
  FALLBACK_INVOICE: 'lnbc1500n1pjhm9j7pp5zq0q6p8p9p0p1p2p3p4p5p6p7p8p9p0p1p2p3p4p5p6p7p8p9p0p1',
  
  // Environment Settings
  SANDBOX_ENDPOINTS: {
    BASE_URL: 'https://api.strike.me/v1',
    RATES_ENDPOINT: '/rates/ticker',
    BALANCES_ENDPOINT: '/balances',
    INVOICES_ENDPOINT: '/invoices'
  },
  
  PRODUCTION_ENDPOINTS: {
    BASE_URL: 'https://api.strike.me/v1',
    RATES_ENDPOINT: '/rates/ticker',
    BALANCES_ENDPOINT: '/balances',
    INVOICES_ENDPOINT: '/invoices'
  }
}

export const CRYPTO_LIMITS = {
  lightning: { min: 0.01, max: 1000 },
  bitcoin: { min: 0.0001, max: 10 },
  ethereum: { min: 0.001, max: 50 },
  litecoin: { min: 0.001, max: 100 },
  dogecoin: { min: 1, max: 100000 },
  usdt: { min: 0.01, max: 10000 }
}

export const NETWORK_VALIDATION = {
  bitcoin: {
    mainnet: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    testnet: /^(tb1|[2mn])[a-zA-HJ-NP-Z0-9]{25,39}$/
  },
  ethereum: {
    mainnet: /^0x[a-fA-F0-9]{40}$/,
    testnet: /^0x[a-fA-F0-9]{40}$/
  },
  lightning: {
    mainnet: /^lnbc[0-9]/,
    testnet: /^lntb[0-9]/
  }
}

export const LIGHTNING_ANALYTICS_EVENTS = {
  INVOICE_GENERATED: 'lightning_invoice_generated',
  INVOICE_EXPIRED: 'lightning_invoice_expired',
  PAYMENT_STARTED: 'lightning_payment_started',
  PAYMENT_COMPLETED: 'lightning_payment_completed',
  PAYMENT_FAILED: 'lightning_payment_failed',
  MONITORING_STARTED: 'lightning_monitoring_started',
  MONITORING_CANCELLED: 'lightning_monitoring_cancelled',
  API_ERROR: 'lightning_api_error',
  FALLBACK_USED: 'lightning_fallback_used'
}

export const LIGHTNING_ERROR_CODES = {
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_INVOICE: 'INVALID_INVOICE',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVOICE_EXPIRED: 'INVOICE_EXPIRED',
  MONITORING_FAILED: 'MONITORING_FAILED'
}

export const LIGHTNING_STATUS_MESSAGES = {
  GENERATING: 'Generating Lightning invoice...',
  WAITING: 'Waiting for payment...',
  PENDING: 'Payment detected, confirming...',
  PAID: 'Payment confirmed successfully!',
  FAILED: 'Payment failed. Please try again.',
  EXPIRED: 'Payment expired. Please generate a new invoice.',
  ERROR: 'An error occurred. Please try again.'
}

/**
 * Get environment-specific configuration
 */
export function getLightningConfig(environment: string = 'sandbox') {
  const endpoints = environment === 'production' 
    ? LIGHTNING_CONFIG.PRODUCTION_ENDPOINTS 
    : LIGHTNING_CONFIG.SANDBOX_ENDPOINTS
  
  return {
    ...LIGHTNING_CONFIG,
    endpoints
  }
}

/**
 * Validate Lightning configuration
 */
export function validateLightningConfig(): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.STRIKE_API_KEY) {
    errors.push('STRIKE_API_KEY environment variable is required')
  }
  
  if (!process.env.STRIKE_ENVIRONMENT) {
    errors.push('STRIKE_ENVIRONMENT environment variable is required')
  }
  
  // Validate configuration values
  if (LIGHTNING_CONFIG.MIN_AMOUNT >= LIGHTNING_CONFIG.MAX_AMOUNT) {
    errors.push('MIN_AMOUNT must be less than MAX_AMOUNT')
  }
  
  if (LIGHTNING_CONFIG.MONITORING_INTERVAL <= 0) {
    errors.push('MONITORING_INTERVAL must be positive')
  }
  
  if (LIGHTNING_CONFIG.RETRY_ATTEMPTS < 1) {
    errors.push('RETRY_ATTEMPTS must be at least 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get formatted amount limits for display
 */
export function getAmountLimits(cryptoType: string): {
  min: number
  max: number
  formatted: string
} {
  const limits = CRYPTO_LIMITS[cryptoType.toLowerCase() as keyof typeof CRYPTO_LIMITS] || CRYPTO_LIMITS.lightning
  
  return {
    min: limits.min,
    max: limits.max,
    formatted: `$${limits.min.toFixed(2)} - $${limits.max.toFixed(2)}`
  }
}

export default LIGHTNING_CONFIG 