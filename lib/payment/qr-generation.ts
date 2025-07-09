/**
 * BitAgora QR Generation Service
 * 
 * Generates QR codes for cryptocurrency payments
 * Supports Lightning Network via Strike API integration
 * 
 * @version 2.0.0
 * @author BitAgora Development Team
 */

import { getCryptoExchangeRate } from '../crypto-exchange-service'
import { validateCryptoAddress } from '../crypto-validation'

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

// Fallback addresses for development/testing
const fallbackAddresses = {
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ethereum: '0x742Ed013A4b9d9Fb59a5a9E8f3e3f7c5b5c3e8f9',
  litecoin: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  dogecoin: 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
  lightning: 'lnbc1500n1pjhm9j7pp5zq0q6p8p9p0p1p2p3p4p5p6p7p8p9p0p1p2p3p4p5p6p7p8p9p0p1',
  usdt: '0x742Ed013A4b9d9Fb59a5a9E8f3e3f7c5b5c3e8f9'
}

/**
 * Generate QR code for cryptocurrency payment
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
        // Use Strike API for Lightning payments via API route
        try {
          console.log('🔄 Generating Lightning invoice via API route')
          
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
            
            // Get exchange rate (using fallback for now)
            const exchangeRate = 45000 // TODO: Add API route for exchange rate
            
            conversionResult = {
              success: true,
              cryptoAmount: usdAmount, // Strike handles conversion internally
              formattedAmount: `$${usdAmount.toFixed(2)} USD`,
              exchangeRate
            }
            
            console.log(`✅ Lightning invoice generated: ${invoiceId}`)
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
          
          conversionResult = {
            success: false,
            cryptoAmount: 0,
            formattedAmount: 'Fallback Mode',
            exchangeRate: 45000,
            error: 'Strike API unavailable'
          }
        }
        break

      case 'bitcoin':
      case 'btc':
        // Convert USD to BTC
        const btcRate = await getCryptoExchangeRate('BTC')
        const btcAmount = usdAmount / btcRate
        
        address = fallbackAddresses.bitcoin
        qrContent = `bitcoin:${address}?amount=${btcAmount.toFixed(8)}`
        
        // Validate address
        isValid = validateCryptoAddress(address, 'bitcoin').isValid
        
        conversionResult = {
          success: true,
          cryptoAmount: btcAmount,
          formattedAmount: `${btcAmount.toFixed(8)} BTC`,
          exchangeRate: btcRate
        }
        break

      case 'ethereum':
      case 'eth':
        // Convert USD to ETH
        const ethRate = await getCryptoExchangeRate('ETH')
        const ethAmount = usdAmount / ethRate
        
        address = fallbackAddresses.ethereum
        qrContent = `ethereum:${address}?value=${ethAmount.toFixed(6)}`
        
        // Validate address
        isValid = validateCryptoAddress(address, 'ethereum').isValid
        
        conversionResult = {
          success: true,
          cryptoAmount: ethAmount,
          formattedAmount: `${ethAmount.toFixed(6)} ETH`,
          exchangeRate: ethRate
        }
        break

      case 'litecoin':
      case 'ltc':
        // Convert USD to LTC
        const ltcRate = await getCryptoExchangeRate('LTC')
        const ltcAmount = usdAmount / ltcRate
        
        address = fallbackAddresses.litecoin
        qrContent = `litecoin:${address}?amount=${ltcAmount.toFixed(8)}`
        
        // Validate address
        isValid = validateCryptoAddress(address, 'litecoin').isValid
        
        conversionResult = {
          success: true,
          cryptoAmount: ltcAmount,
          formattedAmount: `${ltcAmount.toFixed(8)} LTC`,
          exchangeRate: ltcRate
        }
        break

      case 'dogecoin':
      case 'doge':
        // Convert USD to DOGE
        const dogeRate = await getCryptoExchangeRate('DOGE')
        const dogeAmount = usdAmount / dogeRate
        
        address = fallbackAddresses.dogecoin
        qrContent = `dogecoin:${address}?amount=${dogeAmount.toFixed(2)}`
        
        // Validate address
        isValid = validateCryptoAddress(address, 'dogecoin').isValid
        
        conversionResult = {
          success: true,
          cryptoAmount: dogeAmount,
          formattedAmount: `${dogeAmount.toFixed(2)} DOGE`,
          exchangeRate: dogeRate
        }
        break

      case 'usdt':
      case 'tether':
        // Convert USD to USDT (should be ~1:1)
        const usdtRate = await getCryptoExchangeRate('USDT')
        const usdtAmount = usdAmount / usdtRate
        
        address = fallbackAddresses.usdt
        qrContent = `ethereum:${address}?value=${usdtAmount.toFixed(2)}`
        
        // Validate address
        isValid = validateCryptoAddress(address, 'ethereum').isValid // USDT uses Ethereum addresses
        
        conversionResult = {
          success: true,
          cryptoAmount: usdtAmount,
          formattedAmount: `${usdtAmount.toFixed(2)} USDT`,
          exchangeRate: usdtRate
        }
        break

      default:
        throw new Error(`Unsupported cryptocurrency: ${cryptoType}`)
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
 * Format crypto amount for display
 */
export function formatCryptoAmount(
  amount: number,
  cryptoType: string,
  decimals?: number
): string {
  const defaultDecimals = {
    bitcoin: 8,
    ethereum: 6,
    litecoin: 8,
    dogecoin: 2,
    usdt: 2,
    lightning: 2
  }
  
  const decimalPlaces = decimals || defaultDecimals[cryptoType.toLowerCase() as keyof typeof defaultDecimals] || 8
  
  return `${amount.toFixed(decimalPlaces)} ${cryptoType.toUpperCase()}`
}

// Export types
export type {
  QRGenerationResult,
  CryptoConversionResult
} 