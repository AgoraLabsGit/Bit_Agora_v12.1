/**
 * BitAgora QR Generation Service
 * 
 * Generates QR codes for cryptocurrency payments
 * Supports only Bitcoin, Lightning Network (via Strike), and USDT
 * BITCOIN-ONLY APPROACH - No shitcoins supported
 * 
 * @version 3.0.0
 * @author BitAgora Development Team
 */

import { StrikeLightningService } from '../strike-lightning-service'
import { validateCryptoAddress } from '../crypto-validation'
import { cryptoExchangeService } from '../crypto-exchange-service'

// QR Generation types
interface QRGenerationResult {
  qrContent: string
  address: string
  isValid: boolean
  conversionResult?: CryptoConversionResult
  error?: string
  invoiceId?: string
  expires?: Date
}

interface CryptoConversionResult {
  success: boolean
  cryptoAmount: number
  formattedAmount: string
  exchangeRate: number
  error?: string
}

// Fallback addresses for development/testing - BITCOIN ONLY
const fallbackAddresses = {
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  lightning: 'lnbc1500n1pjhm9j7pp5zq0q6p8p9p0p1p2p3p4p5p6p7p8p9p0p1p2p3p4p5p6p7p8p9p0p1',
  usdt_ethereum: '0x742Ed013A4b9d9Fb59a5a9E8f3e3f7c5b5c3e8f9',
  usdt_tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
}

/**
 * Generate QR code for cryptocurrency payment
 * SUPPORTS ONLY: Bitcoin, Lightning, USDT (Ethereum & Tron)
 */
export async function generateCryptoQR(
  cryptoType: string,
  usdAmount: number, 
  merchantId?: string
): Promise<QRGenerationResult> {
  console.log(`🔄 Generating ${cryptoType} QR for $${usdAmount}`)
  
  let qrContent = ''
  let address = ''
  let isValid = true
  let conversionResult: CryptoConversionResult | undefined
  let error: string | undefined
  let invoiceId: string | undefined
  let expires: Date | undefined

  try {
    switch (cryptoType.toLowerCase()) {
      case 'lightning':
        // Use Strike API for Lightning payments
        try {
          console.log('⚡ Generating Lightning invoice via Strike API')
          
          const response = await fetch('/api/lightning/generate-invoice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
          amount: usdAmount,
              description: `BitAgora POS Payment - $${usdAmount.toFixed(2)}`
            })
          })
          
          const result = await response.json()
          
          if (result.success && result.data) {
            const lightningData = result.data
            
            qrContent = lightningData.qrContent
            address = lightningData.qrContent
            invoiceId = lightningData.invoiceId
            expires = new Date(lightningData.expires)
            
            // Use the REAL exchange rate from Strike API (not crypto exchange service)
            const strikeExchangeRate = lightningData.exchangeRate || 45000
            const btcAmount = usdAmount / strikeExchangeRate
            const satoshiAmount = Math.round(btcAmount * 100000000) // Convert to satoshis
            
            conversionResult = {
              success: true,
              cryptoAmount: satoshiAmount,
              formattedAmount: `${satoshiAmount.toLocaleString()} sats`,
              exchangeRate: strikeExchangeRate
            }
            
            console.log(`✅ Lightning invoice generated: ${invoiceId}`)
            console.log(`💰 Amount: $${usdAmount} → ${satoshiAmount.toLocaleString()} sats`)
            console.log(`📊 Strike exchange rate: $${strikeExchangeRate.toLocaleString()}/BTC`)
          } else {
            throw new Error(result.error || 'Failed to generate Lightning invoice')
          }
          
        } catch (lightningError) {
          console.error('Strike Lightning generation failed:', lightningError)
          
          // Fallback to static invoice for development
          console.log('🔄 Using fallback Lightning invoice')
          qrContent = fallbackAddresses.lightning
          address = fallbackAddresses.lightning
            isValid = false
          error = 'Strike service unavailable - using fallback'
          
          // Still show proper satoshi conversion for fallback using crypto exchange service
          try {
            const fallbackConversion = await cryptoExchangeService.convertUSDToLightning(usdAmount)
            conversionResult = {
              success: false,
              cryptoAmount: fallbackConversion.cryptoAmount,
              formattedAmount: fallbackConversion.formattedAmount,
              exchangeRate: fallbackConversion.exchangeRate,
              error: 'Strike API unavailable'
            }
          } catch (conversionError) {
            // Ultimate fallback
            conversionResult = {
              success: false,
              cryptoAmount: 0,
              formattedAmount: '0 sats',
              exchangeRate: 45000,
              error: 'Strike API unavailable'
            }
          }
        }
        break

      case 'bitcoin':
      case 'btc':
        // Bitcoin on-chain payments - Use crypto exchange service for consistent rates
        try {
          console.log('₿ Generating Bitcoin payment QR')
          const btcConversion = await cryptoExchangeService.convertUSDToBitcoin(usdAmount)
          
          if (!btcConversion.success) {
            throw new Error(btcConversion.error || 'Failed to convert USD to Bitcoin')
          }
          
          address = fallbackAddresses.bitcoin
          qrContent = `bitcoin:${address}?amount=${btcConversion.cryptoAmount.toFixed(8)}`
          
          // Validate address
          isValid = validateCryptoAddress(address, 'bitcoin').isValid
          
          conversionResult = {
            success: true,
            cryptoAmount: btcConversion.cryptoAmount,
            formattedAmount: btcConversion.formattedAmount,
            exchangeRate: btcConversion.exchangeRate
          }
          
          console.log(`✅ Bitcoin QR generated: $${usdAmount} → ${btcConversion.formattedAmount}`)
        } catch (btcError) {
          console.error('❌ Bitcoin QR generation failed:', btcError)
          throw new Error('Failed to generate Bitcoin payment QR')
        }
        break

      case 'usdt_ethereum':
      case 'usdt-eth':
        // USDT on Ethereum - Use ERC-20 token transfer format (ERC-681 standard)
        try {
          console.log('💰 Generating USDT (Ethereum) payment QR')
          const usdtEthConversion = await cryptoExchangeService.convertUSDToUSDT(usdAmount)
          
          if (!usdtEthConversion.success) {
            throw new Error(usdtEthConversion.error || 'Failed to convert USD to USDT')
          }
          
          // USDT contract address on Ethereum mainnet
          const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
          address = fallbackAddresses.usdt_ethereum // recipient address
          
          // Convert to USDT atomic units (6 decimals for USDT)
          const usdtAmountInAtomicUnits = Math.round(usdtEthConversion.cryptoAmount * 1000000)
          
          // ERC-681 standard format for ERC-20 token transfer
          qrContent = `ethereum:${usdtContractAddress}/transfer?address=${address}&uint256=${usdtAmountInAtomicUnits}`
          
          // Validate Ethereum address
          isValid = validateCryptoAddress(address, 'usdt_ethereum').isValid
          
          conversionResult = {
            success: true,
            cryptoAmount: usdtEthConversion.cryptoAmount,
            formattedAmount: usdtEthConversion.formattedAmount,
            exchangeRate: usdtEthConversion.exchangeRate
          }
          
          console.log(`✅ USDT (Ethereum) QR generated: $${usdAmount} → ${usdtEthConversion.formattedAmount}`)
          console.log(`📊 USDT Contract: ${usdtContractAddress}`)
          console.log(`📊 Recipient: ${address}`)
          console.log(`📊 Amount: ${usdtAmountInAtomicUnits} (${usdtEthConversion.cryptoAmount} USDT)`)
        } catch (usdtEthError) {
          console.error('❌ USDT (Ethereum) QR generation failed:', usdtEthError)
          throw new Error('Failed to generate USDT (Ethereum) payment QR')
        }
        break

      case 'usdt_tron':
      case 'usdt-tron':
        // USDT on Tron - Use crypto exchange service for consistent rates
        try {
          console.log('💰 Generating USDT (Tron) payment QR')
          const usdtTronConversion = await cryptoExchangeService.convertUSDToUSDT(usdAmount)
          
          if (!usdtTronConversion.success) {
            throw new Error(usdtTronConversion.error || 'Failed to convert USD to USDT')
          }
          
          address = fallbackAddresses.usdt_tron
          qrContent = `tron:${address}?amount=${usdtTronConversion.cryptoAmount.toFixed(6)}`
          
          // Validate Tron address
          isValid = validateCryptoAddress(address, 'usdt_tron').isValid
          
          conversionResult = {
            success: true,
            cryptoAmount: usdtTronConversion.cryptoAmount,
            formattedAmount: usdtTronConversion.formattedAmount,
            exchangeRate: usdtTronConversion.exchangeRate
          }
          
          console.log(`✅ USDT (Tron) QR generated: $${usdAmount} → ${usdtTronConversion.formattedAmount}`)
        } catch (usdtTronError) {
          console.error('❌ USDT (Tron) QR generation failed:', usdtTronError)
          throw new Error('Failed to generate USDT (Tron) payment QR')
        }
        break

      default:
        // NO SHITCOINS ALLOWED!
        console.error(`❌ Unsupported cryptocurrency: ${cryptoType}`)
        throw new Error(`Cryptocurrency not supported: ${cryptoType}. BitAgora supports only Bitcoin, Lightning, and USDT.`)
    }

    // Store Lightning invoice ID for payment monitoring
    if (invoiceId) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentLightningInvoice', invoiceId)
        localStorage.setItem('currentLightningExpiry', expires?.toISOString() || '')
      }
    }

    const result: QRGenerationResult = {
      qrContent,
      address,
      isValid,
      conversionResult,
      error,
      invoiceId,
      expires
    }

    console.log(`✅ QR generated for ${cryptoType}:`, {
      valid: isValid,
      amount: conversionResult?.formattedAmount,
      invoiceId: invoiceId || 'none'
    })

    return result

  } catch (error) {
    console.error(`❌ QR generation failed for ${cryptoType}:`, error)
    
    // Return fallback result
    return {
      qrContent: fallbackAddresses[cryptoType as keyof typeof fallbackAddresses] || '',
      address: fallbackAddresses[cryptoType as keyof typeof fallbackAddresses] || '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      conversionResult: {
        success: false,
        cryptoAmount: 0,
        formattedAmount: 'Error',
        exchangeRate: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
}

/**
 * Get current Lightning invoice from storage
 */
export function getCurrentLightningInvoice(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('currentLightningInvoice')
  }
  return null
}

/**
 * Clear Lightning invoice from storage
 */
export function clearLightningInvoice(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('currentLightningInvoice')
    localStorage.removeItem('currentLightningExpiry')
  }
}

/**
 * Check if Lightning invoice is expired
 */
export function isLightningInvoiceExpired(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    const expiryStr = localStorage.getItem('currentLightningExpiry')
    if (expiryStr) {
      const expiry = new Date(expiryStr)
      return expiry < new Date()
    }
  }
  return true
}

/**
 * Validate QR generation result
 */
export function validateQRResult(result: QRGenerationResult): boolean {
  if (!result.qrContent || !result.address) {
    return false
  }

  if (result.error) {
    return false
  }

  if (!result.conversionResult?.success) {
    return false
  }

  return result.isValid
}

/**
 * Format crypto amount for display - BITCOIN-ONLY
 */
export function formatCryptoAmount(
  amount: number,
  cryptoType: string,
  decimals?: number
): string {
  const defaultDecimals = {
    bitcoin: 8,
    lightning: 0, // satoshis are integers
    usdt_ethereum: 2,
    usdt_tron: 2
  }
  
  const decimalPlaces = decimals || defaultDecimals[cryptoType.toLowerCase() as keyof typeof defaultDecimals] || 8
  
  switch (cryptoType.toLowerCase()) {
    case 'lightning':
      return `${amount.toLocaleString()} sats`
    case 'bitcoin':
      return `${amount.toFixed(decimalPlaces)} BTC`
    case 'usdt_ethereum':
    case 'usdt_tron':
      return `${amount.toFixed(decimalPlaces)} USDT`
    default:
      return `${amount.toFixed(decimalPlaces)} ${cryptoType.toUpperCase()}`
  }
}

// Export types
export type {
  QRGenerationResult,
  CryptoConversionResult
} 