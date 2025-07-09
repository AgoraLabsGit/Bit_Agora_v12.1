/**
 * Cryptocurrency address validation utilities
 * BITCOIN-ONLY APPROACH - Supports only Bitcoin, Lightning, and USDT
 * NO SHITCOINS ALLOWED
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
 * SUPPORTS ONLY: Bitcoin, Lightning, USDT (Ethereum & Tron networks)
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
    
    case 'usdt_ethereum':
      isValid = /^0x[a-fA-F0-9]{40}$/.test(address)
      addressType = 'USDT (Ethereum)'
      details = isValid ? 'Valid USDT (Ethereum) address format' : 'Invalid USDT (Ethereum) address format'
      break
    
    case 'usdt_tron':
      isValid = /^T[A-Za-z1-9]{33}$/.test(address)
      addressType = 'USDT (Tron)'
      details = isValid ? 'Valid USDT (Tron) address format' : 'Invalid USDT (Tron) address format'
      break
    
    case 'lightning':
      // Support both Lightning invoices (bolt11) and Lightning addresses
      const isLightningInvoice = /^ln(bc|tb)[a-z0-9]{1,}$/.test(address)
      const isLightningAddress = /^[\w\.-]+@[\w\.-]+\.\w+$/.test(address)
      
      isValid = isLightningInvoice || isLightningAddress
      addressType = 'Lightning'
      
      if (isLightningInvoice) {
        details = 'Valid Lightning invoice format'
      } else if (isLightningAddress) {
        details = 'Valid Lightning address format'
      } else {
        details = 'Invalid Lightning format. Use either invoice (lnbc...) or address (user@domain.com)'
      }
      break
    
    default:
      // NO SHITCOINS ALLOWED!
      console.warn(`❌ Unsupported crypto type: ${cryptoType}`)
      return {
        isValid: false,
        error: `Cryptocurrency not supported: ${cryptoType}. BitAgora supports only Bitcoin, Lightning, and USDT.`,
        addressType: 'Unsupported'
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
 * Get currency information - BITCOIN-ONLY
 */
export function getCurrencyInfo(cryptoType: string): CurrencyInfo {
  switch (cryptoType.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin' }
    case 'usdt_ethereum':
      return { symbol: 'USDT', name: 'Tether (Ethereum)', network: 'Ethereum' }
    case 'usdt_tron':
      return { symbol: 'USDT', name: 'Tether (Tron)', network: 'Tron' }
    case 'lightning':
      return { symbol: 'BTC', name: 'Bitcoin Lightning', network: 'Lightning Network' }
    default:
      console.warn(`❌ Unsupported crypto type: ${cryptoType}`)
      return { symbol: 'UNKNOWN', name: 'Unsupported Cryptocurrency', network: 'Not Supported' }
  }
}

/**
 * Validate Lightning invoice
 */
export function validateLightningInvoice(invoice: string): ValidationResult {
  return validateCryptoAddress(invoice, 'lightning')
} 