// /lib/crypto-exchange-service.ts
// Exchange rate service for USD to crypto conversion

export interface ExchangeRates {
  bitcoin: number
  ethereum: number
  tron: number
  tether: number // USDT
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
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3'
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private rateCache: { rates: ExchangeRates | null; timestamp: number } = {
    rates: null,
    timestamp: 0
  }

  /**
   * Get current exchange rates from CoinGecko API
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    // Check cache first
    if (this.rateCache.rates && Date.now() - this.rateCache.timestamp < this.CACHE_DURATION) {
      return this.rateCache.rates
    }

    try {
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=bitcoin,ethereum,tron,tether&vs_currencies=usd`,
        { 
          headers: { 'Accept': 'application/json' },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000)
        }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      const rates: ExchangeRates = {
        bitcoin: data.bitcoin?.usd || 0,
        ethereum: data.ethereum?.usd || 0,
        tron: data.tron?.usd || 0,
        tether: data.tether?.usd || 1 // USDT should be ~$1
      }

      // Validate rates
      if (rates.bitcoin === 0 || rates.ethereum === 0) {
        throw new Error('Invalid exchange rates received from API')
      }

      // Cache the rates
      this.rateCache = {
        rates,
        timestamp: Date.now()
      }

      return rates
    } catch (error) {
      console.error('Exchange rate fetch error:', error)
      
      // Fallback to cached rates if available
      if (this.rateCache.rates) {
        console.warn('Using cached exchange rates due to API error')
        return this.rateCache.rates
      }

      // Ultimate fallback rates (approximate)
      console.warn('Using fallback exchange rates')
      return {
        bitcoin: 45000,
        ethereum: 2500,
        tron: 0.10,
        tether: 1.00
      }
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
      const usdtAmount = usdAmount / rates.tether
      
      // USDT uses 6 decimal places
      const formattedAmount = usdtAmount.toFixed(6)

      return {
        success: true,
        cryptoAmount: usdtAmount,
        usdAmount,
        cryptoSymbol: 'USDT',
        exchangeRate: rates.tether,
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
        formattedAmount: satoshis.toString()
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
   * Get formatted crypto amount for display
   */
  formatCryptoAmount(amount: number, symbol: string): string {
    switch (symbol) {
      case 'BTC':
        return `${amount.toFixed(8)} BTC`
      case 'USDT':
        return `${amount.toFixed(6)} USDT`
      case 'SAT':
        return `${Math.round(amount)} sat`
      default:
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