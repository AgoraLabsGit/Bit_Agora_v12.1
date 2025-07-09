/**
 * Cryptocurrency address validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  addressType?: string
  details?: string | {
    amount?: number
    description?: string
    expiry?: number
    isExpired?: boolean
    [key: string]: any
  }
}

export interface CurrencyInfo {
  symbol: string
  name: string
  network: string
}

/**
 * Validate cryptocurrency address format
 */
export function validateCryptoAddress(address: string, cryptoType: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Address is required and must be a string'
    }
  }

  const type = cryptoType.toLowerCase()
  let isValid = false
  let addressType = ''
  let details = ''

  switch (type) {
    case 'bitcoin':
    case 'btc':
      isValid = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)
      addressType = 'Bitcoin'
      details = isValid ? 'Valid Bitcoin address format' : 'Invalid Bitcoin address format'
      break
    
    case 'ethereum':
    case 'eth':
    case 'usdt':
      isValid = /^0x[a-fA-F0-9]{40}$/.test(address)
      addressType = 'Ethereum'
      details = isValid ? 'Valid Ethereum address format' : 'Invalid Ethereum address format'
      break
    
    case 'litecoin':
    case 'ltc':
      isValid = /^(ltc1|[LM3])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)
      addressType = 'Litecoin'
      details = isValid ? 'Valid Litecoin address format' : 'Invalid Litecoin address format'
      break
    
    case 'dogecoin':
    case 'doge':
      isValid = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(address)
      addressType = 'Dogecoin'
      details = isValid ? 'Valid Dogecoin address format' : 'Invalid Dogecoin address format'
      break
    
    case 'lightning':
      isValid = /^ln(bc|tb)[a-z0-9]{1,}$/.test(address)
      addressType = 'Lightning'
      details = isValid ? 'Valid Lightning invoice format' : 'Invalid Lightning invoice format'
      break
    
    default:
      console.warn(`Unknown crypto type for validation: ${cryptoType}`)
      return {
        isValid: false,
        error: `Unknown cryptocurrency type: ${cryptoType}`,
        addressType: 'Unknown'
      }
  }

  return {
    isValid,
    error: isValid ? undefined : details,
    addressType,
    details
  }
}

/**
 * Get currency information
 */
export function getCurrencyInfo(cryptoType: string): CurrencyInfo {
  switch (cryptoType.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin' }
    case 'ethereum':
    case 'eth':
      return { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum' }
    case 'usdt':
      return { symbol: 'USDT', name: 'Tether', network: 'Ethereum/Tron' }
    case 'lightning':
      return { symbol: 'BTC', name: 'Bitcoin Lightning', network: 'Lightning Network' }
    default:
      return { symbol: 'UNKNOWN', name: 'Unknown', network: 'Unknown' }
  }
}

/**
 * Validate Lightning invoice
 */
export function validateLightningInvoice(invoice: string): ValidationResult {
  return validateCryptoAddress(invoice, 'lightning')
} 