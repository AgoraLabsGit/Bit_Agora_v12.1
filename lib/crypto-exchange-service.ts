// /lib/crypto-exchange-service.ts
// Bitcoin-only exchange rate service
// NO SHITCOINS ALLOWED

import { StrikeLightningService } from './strike-lightning-service'

export interface ExchangeRates {
  bitcoin: number
  usdt: number // USDT stable at ~$1
}

export interface CryptoConversionResult {
  success: boolean
  cryptoAmount: number
  usdAmount: number
  cryptoSymbol: string
  exchangeRate: number
  formattedAmount: string
  error?: string
}

class CryptoExchangeService {
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private rateCache: { rates: ExchangeRates | null; timestamp: number } = {
    rates: null,
    timestamp: 0
  }

  /**
   * Get current exchange rates - Bitcoin from Strike API, USDT stable
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    // Check cache first
    if (this.rateCache.rates && Date.now() - this.rateCache.timestamp < this.CACHE_DURATION) {
      console.log('💰 Using cached exchange rates:', this.rateCache.rates)
      return this.rateCache.rates
    }

    try {
      // Get Bitcoin rate from Strike API (most accurate)
      let bitcoinRate: number
      try {
        console.log('🔄 Fetching Bitcoin rate from Strike API...')
        bitcoinRate = await StrikeLightningService.getExchangeRate()
        console.log(`✅ Bitcoin rate from Strike API: $${bitcoinRate.toLocaleString()}`)
      } catch (strikeError) {
        console.warn('⚠️ Strike API failed for exchange rate:', strikeError)
        console.warn('🔄 Using fallback Bitcoin rate')
        bitcoinRate = 45000 // Fallback Bitcoin rate
      }
      
      const rates: ExchangeRates = {
        bitcoin: bitcoinRate,
        usdt: 1.00 // USDT stable coin
      }

      // Validate rates
      if (rates.bitcoin === 0 || rates.bitcoin < 1000 || rates.bitcoin > 200000) {
        console.error('❌ Invalid Bitcoin exchange rate received:', rates.bitcoin)
        throw new Error('Invalid Bitcoin exchange rate received')
      }

      // Cache the rates
      this.rateCache = {
        rates,
        timestamp: Date.now()
      }

      console.log(`✅ Exchange rates updated and cached:`)
      console.log(`   - Bitcoin: $${bitcoinRate.toLocaleString()}`)
      console.log(`   - USDT: $1.00`)
      return rates

    } catch (error) {
      console.error('❌ Exchange rate fetch error:', error)
      
      // Fallback to cached rates if available
      if (this.rateCache.rates) {
        console.warn('⚠️ Using cached exchange rates due to API error')
        return this.rateCache.rates
      }

      // Ultimate fallback rates
      console.warn('⚠️ Using fallback exchange rates - Strike API unavailable')
      const fallbackRates = {
        bitcoin: 45000,
        usdt: 1.00
      }
      
      // Cache fallback rates for short duration
      this.rateCache = {
        rates: fallbackRates,
        timestamp: Date.now()
      }
      
      return fallbackRates
    }
  }

  /**
   * Convert USD to Bitcoin amount in satoshis
   */
  async convertUSDToBitcoin(usdAmount: number): Promise<CryptoConversionResult> {
    try {
      const rates = await this.getExchangeRates()
      const btcAmount = usdAmount / rates.bitcoin
      const satoshis = Math.round(btcAmount * 100000000)
      
      // Check minimum amount (546 satoshis)
      if (satoshis < 546) {
        return {
          success: false,
          cryptoAmount: 0,
          usdAmount,
          cryptoSymbol: 'BTC',
          exchangeRate: rates.bitcoin,
          formattedAmount: '0.00000000',
          error: `Payment too small - minimum is 546 satoshis (≈$${(546 * rates.bitcoin / 100000000).toFixed(2)})`
        }
      }

      return {
        success: true,
        cryptoAmount: btcAmount,
        usdAmount,
        cryptoSymbol: 'BTC',
        exchangeRate: rates.bitcoin,
        formattedAmount: btcAmount.toFixed(8)
      }
    } catch (error) {
      return {
        success: false,
        cryptoAmount: 0,
        usdAmount,
        cryptoSymbol: 'BTC',
        exchangeRate: 0,
        formattedAmount: '0.00000000',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convert USD to USDT amount (1:1 ratio with proper decimals)
   */
  async convertUSDToUSDT(usdAmount: number): Promise<CryptoConversionResult> {
    try {
      const rates = await this.getExchangeRates()
      const usdtAmount = usdAmount / rates.usdt
      
      // USDT uses 6 decimal places
      const formattedAmount = usdtAmount.toFixed(6)

      return {
        success: true,
        cryptoAmount: usdtAmount,
        usdAmount,
        cryptoSymbol: 'USDT',
        exchangeRate: rates.usdt,
        formattedAmount
      }
    } catch (error) {
      return {
        success: false,
        cryptoAmount: 0,
        usdAmount,
        cryptoSymbol: 'USDT',
        exchangeRate: 0,
        formattedAmount: '0.000000',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convert USD to Lightning Network satoshis
   */
  async convertUSDToLightning(usdAmount: number): Promise<CryptoConversionResult> {
    try {
      const rates = await this.getExchangeRates()
      const btcAmount = usdAmount / rates.bitcoin
      const satoshis = Math.round(btcAmount * 100000000)
      
      // Lightning minimum is typically 1 satoshi
      if (satoshis < 1) {
        return {
          success: false,
          cryptoAmount: 0,
          usdAmount,
          cryptoSymbol: 'SAT',
          exchangeRate: rates.bitcoin,
          formattedAmount: '0',
          error: `Payment too small - minimum is 1 satoshi (≈$${(1 * rates.bitcoin / 100000000).toFixed(6)})`
        }
      }

      return {
        success: true,
        cryptoAmount: satoshis,
        usdAmount,
        cryptoSymbol: 'SAT',
        exchangeRate: rates.bitcoin,
        formattedAmount: satoshis.toLocaleString()
      }
    } catch (error) {
      return {
        success: false,
        cryptoAmount: 0,
        usdAmount,
        cryptoSymbol: 'SAT',
        exchangeRate: 0,
        formattedAmount: '0',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get formatted crypto amount for display - BITCOIN ONLY
   */
  formatCryptoAmount(amount: number, symbol: string): string {
    switch (symbol) {
      case 'BTC':
        return `${amount.toFixed(8)} BTC`
      case 'USDT':
        return `${amount.toFixed(6)} USDT`
      case 'SAT':
        return `${Math.round(amount).toLocaleString()} sats`
      default:
        console.warn(`❌ Unsupported crypto symbol: ${symbol}`)
        return `${amount} ${symbol}`
    }
  }

  /**
   * Clear exchange rate cache (useful for testing)
   */
  clearCache(): void {
    this.rateCache = { rates: null, timestamp: 0 }
  }
}

// Export singleton instance
export const cryptoExchangeService = new CryptoExchangeService() 

/**
 * Get exchange rate for supported cryptocurrencies - BITCOIN ONLY
 * Helper function for compatibility with existing code
 */
export async function getCryptoExchangeRate(symbol: string): Promise<number> {
  try {
    const rates = await cryptoExchangeService.getExchangeRates()
    
    switch (symbol.toLowerCase()) {
      case 'btc':
      case 'bitcoin':
        return rates.bitcoin
      case 'usdt':
      case 'tether':
        return rates.usdt
      default:
        // NO SHITCOINS ALLOWED!
        console.error(`❌ Unsupported cryptocurrency: ${symbol}`)
        throw new Error(`Cryptocurrency not supported: ${symbol}. BitAgora supports only Bitcoin and USDT.`)
    }
  } catch (error) {
    console.error(`Error getting exchange rate for ${symbol}:`, error)
    
    // Return fallback rates only for supported cryptos
    if (symbol.toLowerCase() === 'btc' || symbol.toLowerCase() === 'bitcoin') {
      return 45000 // Fallback Bitcoin rate
    }
    if (symbol.toLowerCase() === 'usdt' || symbol.toLowerCase() === 'tether') {
      return 1.00 // Fallback USDT rate
    }
    
    throw error // Re-throw for unsupported cryptos
  }
} 