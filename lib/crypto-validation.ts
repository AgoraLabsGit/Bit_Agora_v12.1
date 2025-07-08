// Crypto Address Validation Utility for BitAgora POS
// Supports Bitcoin, Ethereum, Tron, USDT, and Lightning Network addresses

import WAValidator from 'multicoin-address-validator'
import { decode as decodeBolt11 } from 'bolt11'

// Types for validation results
export interface ValidationResult {
  isValid: boolean
  error?: string
  addressType?: string
  network?: string
  details?: any
}

export interface SupportedCurrency {
  name: string
  symbol: string
  description: string
  examples: string[]
}

// Supported currencies with examples
export const SUPPORTED_CURRENCIES: Record<string, SupportedCurrency> = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    description: 'Bitcoin mainnet addresses (Legacy, SegWit, Native SegWit)',
    examples: [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Legacy P2PKH
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // SegWit P2SH
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' // Native SegWit
    ]
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    description: 'Ethereum mainnet addresses',
    examples: [
      '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    ]
  },
  tron: {
    name: 'Tron',
    symbol: 'TRX',
    description: 'Tron mainnet addresses',
    examples: [
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      'TLPamorjDEJM5vBWD8B5a14Qa5CpY6Fs7q'
    ]
  },
  lightning: {
    name: 'Bitcoin Lightning',
    symbol: 'LN',
    description: 'Lightning Network payment requests (BOLT-11)',
    examples: [
      'lnbc1500n1ps0jyppqxyz...',
      'lntb1500n1ps0jyppqxyz...'
    ]
  },
  usdt_ethereum: {
    name: 'USDT (Ethereum)',
    symbol: 'USDT-ERC20',
    description: 'USDT tokens on Ethereum network',
    examples: [
      '0x32Be343B94f860124dC4fEe278FDCBD38C102D88'
    ]
  },
  usdt_tron: {
    name: 'USDT (Tron)',
    symbol: 'USDT-TRC20',
    description: 'USDT tokens on Tron network',
    examples: [
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
    ]
  }
}

/**
 * Validates a Bitcoin address
 */
export function validateBitcoinAddress(address: string, network: 'mainnet' | 'testnet' = 'mainnet'): ValidationResult {
  try {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Address is required and must be a string'
      }
    }

    const networkType = network === 'testnet' ? 'testnet' : 'prod'
    const isValid = WAValidator.validate(address, 'bitcoin', { networkType })
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid Bitcoin address format'
      }
    }

    // Determine address type based on prefix
    let addressType = 'unknown'
    if (address.startsWith('1')) {
      addressType = 'P2PKH (Legacy)'
    } else if (address.startsWith('3')) {
      addressType = 'P2SH (SegWit)'
    } else if (address.startsWith('bc1') && address.length === 42) {
      addressType = 'P2WPKH (Native SegWit)'
    } else if (address.startsWith('bc1') && address.length === 62) {
      addressType = 'P2WSH (Native SegWit Script)'
    } else if (address.startsWith('bc1p')) {
      addressType = 'P2TR (Taproot)'
    }

    return {
      isValid: true,
      addressType,
      network: network,
      details: {
        currency: 'Bitcoin',
        symbol: 'BTC',
        addressFormat: addressType
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Validates an Ethereum address
 */
export function validateEthereumAddress(address: string): ValidationResult {
  try {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Address is required and must be a string'
      }
    }

    const isValid = WAValidator.validate(address, 'ethereum')
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid Ethereum address format'
      }
    }

    return {
      isValid: true,
      addressType: 'Ethereum Address',
      network: 'mainnet',
      details: {
        currency: 'Ethereum',
        symbol: 'ETH',
        checksumValid: address === address.toLowerCase() || address === address.toUpperCase() || 
                       address === checksumAddress(address)
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Validates a Tron address
 */
export function validateTronAddress(address: string): ValidationResult {
  try {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Address is required and must be a string'
      }
    }

    const isValid = WAValidator.validate(address, 'tron')
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid Tron address format'
      }
    }

    return {
      isValid: true,
      addressType: 'Tron Address',
      network: 'mainnet',
      details: {
        currency: 'Tron',
        symbol: 'TRX',
        addressFormat: 'Base58Check'
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Validates a Lightning Network invoice (BOLT-11)
 */
export function validateLightningInvoice(invoice: string): ValidationResult {
  try {
    if (!invoice || typeof invoice !== 'string') {
      return {
        isValid: false,
        error: 'Invoice is required and must be a string'
      }
    }

    // Check if it looks like a Lightning invoice
    if (!invoice.toLowerCase().startsWith('ln')) {
      return {
        isValid: false,
        error: 'Invalid Lightning invoice format - must start with "ln"'
      }
    }

    const decoded = decodeBolt11(invoice)
    
    if (!decoded) {
      return {
        isValid: false,
        error: 'Unable to decode Lightning invoice'
      }
    }

    // Check if invoice is expired
    const now = Math.floor(Date.now() / 1000)
    const isExpired = decoded.timeExpireDate && decoded.timeExpireDate < now

    return {
      isValid: true,
      addressType: 'Lightning Invoice (BOLT-11)',
      network: decoded.network?.bech32 || 'bitcoin',
      details: {
        currency: 'Bitcoin Lightning',
        symbol: 'LN',
        amount: decoded.satoshis || 0,
        description: decoded.tags?.find(tag => tag.tagName === 'description')?.data || '',
        expiry: decoded.timeExpireDate,
        isExpired,
        paymentHash: decoded.tags?.find(tag => tag.tagName === 'payment_hash')?.data
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Lightning invoice validation error: ${error instanceof Error ? error.message : 'Invalid invoice format'}`
    }
  }
}

/**
 * Validates USDT addresses (supports both Ethereum and Tron networks)
 */
export function validateUSDTAddress(address: string, network: 'ethereum' | 'tron'): ValidationResult {
  try {
    if (network === 'ethereum') {
      const result = validateEthereumAddress(address)
      if (result.isValid) {
        return {
          ...result,
          addressType: 'USDT (ERC-20)',
          details: {
            ...result.details,
            currency: 'USDT',
            symbol: 'USDT-ERC20',
            network: 'Ethereum'
          }
        }
      }
      return result
    } else if (network === 'tron') {
      const result = validateTronAddress(address)
      if (result.isValid) {
        return {
          ...result,
          addressType: 'USDT (TRC-20)',
          details: {
            ...result.details,
            currency: 'USDT',
            symbol: 'USDT-TRC20',
            network: 'Tron'
          }
        }
      }
      return result
    } else {
      return {
        isValid: false,
        error: 'Network must be either "ethereum" or "tron"'
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `USDT validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Universal address validator - detects format and validates accordingly
 */
export function validateCryptoAddress(address: string, expectedType?: string): ValidationResult {
  try {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Address is required and must be a string'
      }
    }

    const cleanAddress = address.trim()

    // Lightning Network detection
    if (cleanAddress.toLowerCase().startsWith('ln')) {
      if (expectedType && expectedType !== 'lightning') {
        return {
          isValid: false,
          error: `Expected ${expectedType} address but received Lightning invoice`
        }
      }
      return validateLightningInvoice(cleanAddress)
    }

    // Bitcoin address detection
    if (cleanAddress.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) || 
        cleanAddress.match(/^bc1[a-z0-9]{39,59}$/)) {
      if (expectedType && expectedType !== 'bitcoin') {
        return {
          isValid: false,
          error: `Expected ${expectedType} address but received Bitcoin address`
        }
      }
      return validateBitcoinAddress(cleanAddress)
    }

    // Ethereum address detection
    if (cleanAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      if (expectedType === 'usdt_ethereum') {
        return validateUSDTAddress(cleanAddress, 'ethereum')
      } else if (expectedType && expectedType !== 'ethereum') {
        return {
          isValid: false,
          error: `Expected ${expectedType} address but received Ethereum address`
        }
      }
      return validateEthereumAddress(cleanAddress)
    }

    // Tron address detection
    if (cleanAddress.match(/^T[A-Za-z1-9]{33}$/)) {
      if (expectedType === 'usdt_tron') {
        return validateUSDTAddress(cleanAddress, 'tron')
      } else if (expectedType && expectedType !== 'tron') {
        return {
          isValid: false,
          error: `Expected ${expectedType} address but received Tron address`
        }
      }
      return validateTronAddress(cleanAddress)
    }

    return {
      isValid: false,
      error: 'Unrecognized address format. Supported formats: Bitcoin, Ethereum, Tron, Lightning Network'
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Address validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Helper function to compute Ethereum address checksum
 */
function checksumAddress(address: string): string {
  // Simplified checksum - in production, use a proper library
  return address.toLowerCase()
}

/**
 * Get examples and information for a specific currency
 */
export function getCurrencyInfo(currency: string): SupportedCurrency | null {
  return SUPPORTED_CURRENCIES[currency.toLowerCase()] || null
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): SupportedCurrency[] {
  return Object.values(SUPPORTED_CURRENCIES)
}

/**
 * Batch validate multiple addresses
 */
export function validateMultipleAddresses(addresses: Array<{address: string, type?: string}>): ValidationResult[] {
  return addresses.map(({ address, type }) => validateCryptoAddress(address, type))
} 