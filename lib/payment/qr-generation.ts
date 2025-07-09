// /lib/payment/qr-generation.ts
// Shared QR generation utility with proper amount conversion and validation

import { cryptoExchangeService, CryptoConversionResult } from '../crypto-exchange-service'
import { 
  validateBitcoinAddress, 
  validateLightningInvoice, 
  validateEthereumAddress, 
  validateTronAddress,
  validateUSDTAddress 
} from '../crypto-validation'

export interface QRData {
  address: string
  qrContent: string
  method: string
  amount: number
  cryptoAmount: number
  formattedCryptoAmount: string
  exchangeRate: number
  isValid: boolean
  error?: string
}

export interface QRGenerationOptions {
  validateAddresses?: boolean
  includeFallbacks?: boolean
}

export const generateCryptoQR = async (
  method: string, 
  usdAmount: number, 
  paymentSettings: any,
  options: QRGenerationOptions = { validateAddresses: true, includeFallbacks: true }
): Promise<QRData | null> => {
  console.log('🔥 Generating QR for method:', method, 'amount:', usdAmount)

  try {
    // Fallback addresses for testing when settings are not configured
    const fallbackAddresses = {
      lightning: 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w',
      bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'usdt-eth': '0x742d35Cc6634C0532925a3b8D25c5cf943C1D88B',
      'usdt-tron': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oREqjN'
    }

    let address = ''
    let qrContent = ''
    let conversionResult: CryptoConversionResult | null = null
    let isValid = true
    let error: string | undefined

    switch (method) {
      case 'lightning':
        address = paymentSettings?.bitcoinLightningAddress || (options.includeFallbacks ? fallbackAddresses.lightning : '')
        
        // Validate Lightning invoice if available
        if (options.validateAddresses && address) {
          const validation = validateLightningInvoice(address)
          if (!validation.isValid) {
            error = `Invalid Lightning invoice: ${validation.error}`
            isValid = false
          }
        }

        // Convert USD to satoshis for Lightning
        conversionResult = await cryptoExchangeService.convertUSDToLightning(usdAmount)
        
        if (!conversionResult.success) {
          error = conversionResult.error
          isValid = false
        }

        // For now, use the address directly (in production, generate dynamic invoice)
        // TODO: Implement dynamic Lightning invoice generation
        qrContent = address
        break

      case 'bitcoin':
        address = paymentSettings?.bitcoinWalletAddress || (options.includeFallbacks ? fallbackAddresses.bitcoin : '')
        
        // Validate Bitcoin address
        if (options.validateAddresses && address) {
          const validation = validateBitcoinAddress(address)
          if (!validation.isValid) {
            error = `Invalid Bitcoin address: ${validation.error}`
            isValid = false
          }
        }

        // Convert USD to BTC with proper amount
        conversionResult = await cryptoExchangeService.convertUSDToBitcoin(usdAmount)
        
        if (!conversionResult.success) {
          error = conversionResult.error
          isValid = false
        } else {
          // Create BIP21 URI with proper BTC amount
          qrContent = `bitcoin:${address}?amount=${conversionResult.formattedAmount}`
        }
        break

      case 'usdt-eth':
        address = paymentSettings?.usdtEthereumWalletAddress || (options.includeFallbacks ? fallbackAddresses['usdt-eth'] : '')
        
        // Validate Ethereum address for USDT
        if (options.validateAddresses && address) {
          const validation = validateUSDTAddress(address, 'ethereum')
          if (!validation.isValid) {
            error = `Invalid Ethereum address for USDT: ${validation.error}`
            isValid = false
          }
        }

        // Convert USD to USDT (1:1 ratio with proper decimals)
        conversionResult = await cryptoExchangeService.convertUSDToUSDT(usdAmount)
        
        if (!conversionResult.success) {
          error = conversionResult.error
          isValid = false
        } else {
          // USDT has 6 decimals, so convert to base units (microUSDT) for URI
          const usdtBaseUnits = Math.round(conversionResult.cryptoAmount * 1000000)
          // Create Ethereum token transfer URI with base units
          qrContent = `ethereum:${address}?amount=${usdtBaseUnits}&token=0xdac17f958d2ee523a2206206994597c13d831ec7`
        }
        break

      case 'usdt-tron':
        address = paymentSettings?.usdtTronWalletAddress || (options.includeFallbacks ? fallbackAddresses['usdt-tron'] : '')
        
        // Validate Tron address for USDT
        if (options.validateAddresses && address) {
          const validation = validateUSDTAddress(address, 'tron')
          if (!validation.isValid) {
            error = `Invalid Tron address for USDT: ${validation.error}`
            isValid = false
          }
        }

        // Convert USD to USDT (1:1 ratio with proper decimals)
        conversionResult = await cryptoExchangeService.convertUSDToUSDT(usdAmount)
        
        if (!conversionResult.success) {
          error = conversionResult.error
          isValid = false
        } else {
          // USDT has 6 decimals, so convert to base units (microUSDT) for URI
          const usdtBaseUnits = Math.round(conversionResult.cryptoAmount * 1000000)
          // Create Tron token transfer URI with base units
          qrContent = `tron:${address}?amount=${usdtBaseUnits}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
        }
        break

      default:
        console.error('❌ Unknown payment method:', method)
        return null
    }

    if (!address && !options.includeFallbacks) {
      console.error('❌ No address available for method:', method)
      return null
    }

    const result: QRData = {
      address,
      qrContent,
      method,
      amount: usdAmount,
      cryptoAmount: conversionResult?.cryptoAmount || 0,
      formattedCryptoAmount: conversionResult?.formattedAmount || '0',
      exchangeRate: conversionResult?.exchangeRate || 0,
      isValid,
      error
    }

    if (isValid) {
      console.log('✅ QR generated successfully:', {
        method,
        usdAmount,
        cryptoAmount: result.cryptoAmount,
        formattedAmount: result.formattedCryptoAmount,
        exchangeRate: result.exchangeRate
      })
    } else {
      console.error('❌ QR generation failed:', error)
    }

    return result
  } catch (error) {
    console.error('❌ QR generation error:', error)
    return {
      address: '',
      qrContent: '',
      method,
      amount: usdAmount,
      cryptoAmount: 0,
      formattedCryptoAmount: '0',
      exchangeRate: 0,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const formatQRForDisplay = (qrData: QRData | null): string => {
  if (!qrData) return ''
  
  switch (qrData.method) {
    case 'lightning':
      return `Lightning Network Payment (${qrData.formattedCryptoAmount} sat)`
    case 'bitcoin':
      return `Bitcoin Payment (${qrData.formattedCryptoAmount} BTC)`
    case 'usdt-eth':
      return `USDT (Ethereum) Payment (${qrData.formattedCryptoAmount} USDT)`
    case 'usdt-tron':
      return `USDT (Tron) Payment (${qrData.formattedCryptoAmount} USDT)`
    default:
      return 'Crypto Payment'
  }
}

export const getMethodIcon = (method: string): string => {
  switch (method) {
    case 'lightning':
      return '⚡'
    case 'bitcoin':
      return '₿'
    case 'usdt-eth':
      return '$'
    case 'usdt-tron':
      return '$'
    default:
      return '₿'
  }
}

export const getMethodName = (method: string): string => {
  switch (method) {
    case 'lightning':
      return 'Lightning'
    case 'bitcoin':
      return 'Bitcoin'
    case 'usdt-eth':
      return 'USDT (ETH)'
    case 'usdt-tron':
      return 'USDT (TRX)'
    default:
      return method
  }
}

/**
 * Validate crypto QR data before display
 */
export const validateQRData = (qrData: QRData): boolean => {
  if (!qrData.isValid) {
    console.error('QR validation failed:', qrData.error)
    return false
  }

  if (!qrData.address || !qrData.qrContent) {
    console.error('QR data missing required fields')
    return false
  }

  if (qrData.cryptoAmount <= 0) {
    console.error('Invalid crypto amount:', qrData.cryptoAmount)
    return false
  }

  return true
}

/**
 * Generate Lightning invoice dynamically (placeholder for future implementation)
 */
export const generateLightningInvoice = async (
  satoshis: number,
  description: string = 'BitAgora POS Payment'
): Promise<string> => {
  // TODO: Implement actual Lightning invoice generation
  // For now, return fallback invoice
  console.warn('Dynamic Lightning invoice generation not implemented yet')
  return 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w'
} 