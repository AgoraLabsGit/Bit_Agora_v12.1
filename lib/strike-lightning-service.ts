/**
 * BitAgora Strike Lightning Service
 * 
 * Production-ready Lightning Network payment service using Strike API
 * Features: Invoice generation, payment monitoring, balance checking
 * 
 * @version 2.0.0
 * @author BitAgora Development Team
 */

import { LIGHTNING_CONFIG, CRYPTO_LIMITS, LIGHTNING_ERROR_CODES } from './lightning-config'
import { LightningAnalytics } from './lightning-analytics'

// Types
interface StrikeLightningInvoice {
  invoiceId: string
  amount: number
  qrContent: string
  expires: Date
  paymentRequest: string
}

interface StrikePaymentStatus {
  state: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  paidAmount?: number
  updated: Date
  invoiceId: string
}

interface StrikeBalance {
  currency: string
  available: number
  pending: number
}

interface StrikeExchangeRate {
  source: string
  target: string
  rate: number
  timestamp: Date
}

/**
 * Strike Lightning Service
 * 
 * Handles all Lightning Network payment operations via Strike API
 * Includes fallback mechanisms and comprehensive error handling
 */
export class StrikeLightningService {
  private static readonly API_BASE_URL = 'https://api.strike.me/v1'
  private static readonly SANDBOX_BASE_URL = 'https://api.strike.me/v1'
  
  private static readonly API_KEY = process.env.STRIKE_API_KEY
  private static readonly ENVIRONMENT = process.env.STRIKE_ENVIRONMENT || 'sandbox'
  
  // Cache for exchange rates
  private static exchangeRateCache: { rate: number; timestamp: Date } | null = null
  private static readonly EXCHANGE_RATE_CACHE_TTL = LIGHTNING_CONFIG.EXCHANGE_RATE_CACHE_TTL
  
  // Cache for balances
  private static balanceCache: { balances: StrikeBalance[]; timestamp: Date } | null = null
  private static readonly BALANCE_CACHE_TTL = LIGHTNING_CONFIG.BALANCE_CACHE_TTL

  /**
   * Get Strike API headers
   */
  private static getHeaders(): Record<string, string> {
    if (!this.API_KEY) {
      throw new Error('Strike API key not configured')
    }
    
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Get Strike API base URL
   */
  private static getBaseUrl(): string {
    return this.ENVIRONMENT === 'production' ? this.API_BASE_URL : this.SANDBOX_BASE_URL
  }

  /**
   * Make authenticated request to Strike API
   */
  private static async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${this.getBaseUrl()}${endpoint}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Strike API error: ${response.status} - ${errorData.message || response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Strike API request failed: ${method} ${endpoint}`, error)
      throw error
    }
  }

  /**
   * Make authenticated request with retry logic
   */
  private static async makeRequestWithRetry(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    maxRetries: number = LIGHTNING_CONFIG.RETRY_ATTEMPTS
  ): Promise<any> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now()
        const result = await this.makeRequest(endpoint, method, body)
        const duration = Date.now() - startTime
        
        // Track successful API call
        LightningAnalytics.trackPerformance(`api_${method.toLowerCase()}_${endpoint}`, duration, true)
        
        return result
      } catch (error) {
        lastError = error as Error
        const duration = Date.now() - (Date.now() - LIGHTNING_CONFIG.REQUEST_TIMEOUT)
        
        // Track failed API call
        LightningAnalytics.trackAPIError(
          `${method} ${endpoint}`,
          LIGHTNING_ERROR_CODES.API_ERROR,
          lastError.message,
          duration
        )
        
        if (attempt < maxRetries) {
          const backoffDelay = this.calculateBackoffDelay(attempt)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for ${method} ${endpoint}`)
        }
      }
    }
    
    throw lastError!
  }

  /**
   * Calculate exponential backoff delay
   */
  private static calculateBackoffDelay(attempt: number): number {
    const baseDelay = LIGHTNING_CONFIG.RETRY_BASE_DELAY
    const maxDelay = LIGHTNING_CONFIG.RETRY_MAX_DELAY
    return Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
  }

  /**
   * Validate Lightning invoice format
   */
  static validateInvoice(bolt11: string): boolean {
    if (!bolt11 || typeof bolt11 !== 'string') {
      return false
    }
    
    // Check if it's a valid Lightning invoice format
    return (bolt11.startsWith('lnbc') || bolt11.startsWith('lntb')) && bolt11.length > 50
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Amount must be a valid number' }
    }
    
    const limits = CRYPTO_LIMITS.lightning
    
    if (amount < limits.min) {
      return { valid: false, error: `Amount must be at least $${limits.min}` }
    }
    
    if (amount > limits.max) {
      return { valid: false, error: `Amount must be no more than $${limits.max}` }
    }
    
    return { valid: true }
  }

  /**
   * Generate Lightning invoice for USD amount
   */
  static async generateLightningQR(
    usdAmount: number,
    description: string = LIGHTNING_CONFIG.INVOICE_DESCRIPTION_PREFIX
  ): Promise<StrikeLightningInvoice> {
    const startTime = Date.now()
    
    try {
      // Validate amount using new validation method
      const amountValidation = this.validateAmount(usdAmount)
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error || 'Invalid payment amount')
      }
      
      console.log(`🔄 Generating Lightning invoice for $${usdAmount}`)
      
      // Create invoice with Strike API using retry logic
      // First, try the quotes endpoint for Lightning invoices
      console.log('🔄 Attempting to create Lightning quote...')
      let invoiceData
      try {
        // Try the quotes endpoint for Lightning invoices
        const quoteData = await this.makeRequestWithRetry('/quotes', 'POST', {
          amount: {
            amount: usdAmount.toString(),
            currency: 'USD'
          },
          currency: 'BTC',
          description: `${description} - $${usdAmount.toFixed(2)}`,
          type: 'LIGHTNING'
        })
        
        console.log('✅ Lightning quote created:', quoteData)
        
        // If quotes work, try to execute the quote
        if (quoteData.quoteId) {
          invoiceData = await this.makeRequestWithRetry(`/quotes/${quoteData.quoteId}/execute`, 'POST', {})
          console.log('✅ Lightning quote executed:', invoiceData)
        } else {
          throw new Error('No quote ID returned')
        }
      } catch (quoteError) {
        console.log('⚠️ Lightning quote failed, trying invoice endpoint:', quoteError)
        
        // Fallback to regular invoice endpoint
        invoiceData = await this.makeRequestWithRetry('/invoices', 'POST', {
          amount: {
            amount: usdAmount.toString(),
            currency: 'USD'
          },
          description: `${description} - $${usdAmount.toFixed(2)}`,
          expiry: LIGHTNING_CONFIG.INVOICE_EXPIRY / 1000 // Convert to seconds
        })
      }
      
      const expires = new Date(Date.now() + LIGHTNING_CONFIG.INVOICE_EXPIRY)
      
      // Check if Strike API returned required fields
      if (!invoiceData.invoiceId) {
        console.log('⚠️ Strike API returned no invoice ID:', invoiceData)
        throw new Error('Strike API returned no invoice ID')
      }
      
      // If bolt11 is missing, try to get it separately
      let bolt11Invoice = invoiceData.bolt11
      if (!bolt11Invoice) {
        console.log('⚠️ No bolt11 in initial response, trying to get Lightning invoice...')
        try {
          // Try to get Lightning invoice using a separate call
          const lightningInvoiceData = await this.makeRequestWithRetry(`/invoices/${invoiceData.invoiceId}/lightning`, 'GET')
          bolt11Invoice = lightningInvoiceData.bolt11 || lightningInvoiceData.paymentRequest
        } catch (lightningError) {
          console.log('⚠️ Failed to get Lightning invoice separately:', lightningError)
          // If that fails, try a different approach
          try {
            const updatedInvoiceData = await this.makeRequestWithRetry(`/invoices/${invoiceData.invoiceId}`, 'GET')
            bolt11Invoice = updatedInvoiceData.bolt11 || updatedInvoiceData.paymentRequest
          } catch (fetchError) {
            console.log('⚠️ Failed to fetch updated invoice:', fetchError)
          }
        }
      }
      
      if (!bolt11Invoice) {
        console.log('⚠️ Strike API returned incomplete response (no bolt11):', invoiceData)
        throw new Error('Strike API returned incomplete invoice data - no bolt11 invoice')
      }
      
      const result: StrikeLightningInvoice = {
        invoiceId: invoiceData.invoiceId,
        amount: usdAmount,
        qrContent: bolt11Invoice,
        expires,
        paymentRequest: bolt11Invoice
      }
      
      // Validate generated invoice
      if (!this.validateInvoice(result.qrContent)) {
        console.log('⚠️ Invoice validation failed for:', result.qrContent)
        throw new Error('Generated invoice failed validation')
      }
      
      const duration = Date.now() - startTime
      
      // Track successful invoice generation
      LightningAnalytics.trackInvoiceGenerated(
        result.invoiceId,
        usdAmount,
        true,
        duration
      )
      
      console.log(`✅ Lightning invoice generated: ${result.invoiceId}`)
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      console.error('Strike Lightning invoice generation failed:', error)
      
      // Track failed invoice generation
      LightningAnalytics.trackInvoiceGenerated(
        `failed-${Date.now()}`,
        usdAmount,
        false,
        duration
      )
      
      // Fallback to static invoice for development
      if (this.ENVIRONMENT === 'sandbox') {
        console.log('🔄 Using fallback Lightning invoice')
        
        const fallbackInvoice = {
          invoiceId: `fallback-${Date.now()}`,
          amount: usdAmount,
          qrContent: LIGHTNING_CONFIG.FALLBACK_INVOICE,
          expires: new Date(Date.now() + LIGHTNING_CONFIG.INVOICE_EXPIRY),
          paymentRequest: LIGHTNING_CONFIG.FALLBACK_INVOICE
        }
        
        // Track fallback usage
        LightningAnalytics.trackFallbackUsed(
          'Strike API unavailable',
          fallbackInvoice.invoiceId
        )
        
        return fallbackInvoice
      }
      
      throw error
    }
  }

  /**
   * Monitor Lightning payment status
   */
  static async monitorPayment(
    invoiceId: string,
    onUpdate?: (status: StrikePaymentStatus) => void
  ): Promise<StrikePaymentStatus> {
    try {
      const maxAttempts = 180 // 15 minutes (5 second intervals)
      let attempts = 0
      
      while (attempts < maxAttempts) {
        try {
          const statusData = await this.makeRequest(`/invoices/${invoiceId}`)
          
          const status: StrikePaymentStatus = {
            state: statusData.state,
            paidAmount: statusData.paidAmount?.amount ? parseFloat(statusData.paidAmount.amount) : undefined,
            updated: new Date(),
            invoiceId
          }
          
          // Notify callback of status update
          if (onUpdate) {
            onUpdate(status)
          }
          
          // Check if payment is complete
          if (status.state === 'PAID' || status.state === 'FAILED' || status.state === 'EXPIRED') {
            console.log(`✅ Payment ${status.state}: ${invoiceId}`)
            return status
          }
          
          // Wait 5 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 5000))
          attempts++
          
        } catch (error) {
          console.error(`Payment monitoring attempt ${attempts} failed:`, error)
          attempts++
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      // Timeout reached
      console.log(`⏰ Payment monitoring timeout: ${invoiceId}`)
      return {
        state: 'EXPIRED',
        updated: new Date(),
        invoiceId
      }
      
    } catch (error) {
      console.error('Payment monitoring failed:', error)
      throw error
    }
  }

  /**
   * Check single payment status
   */
  static async checkPaymentStatus(invoiceId: string): Promise<StrikePaymentStatus> {
    try {
      const statusData = await this.makeRequest(`/invoices/${invoiceId}`)
      
      return {
        state: statusData.state,
        paidAmount: statusData.paidAmount?.amount ? parseFloat(statusData.paidAmount.amount) : undefined,
        updated: new Date(),
        invoiceId
      }
    } catch (error) {
      console.error('Payment status check failed:', error)
      throw error
    }
  }

  /**
   * Get current balances
   */
  static async getBalances(): Promise<StrikeBalance[]> {
    try {
      // Check cache first
      if (this.balanceCache) {
        const cacheAge = Date.now() - this.balanceCache.timestamp.getTime()
        if (cacheAge < this.BALANCE_CACHE_TTL) {
          return this.balanceCache.balances
        }
      }
      
      const balanceData = await this.makeRequest('/balances')
      
      const balances: StrikeBalance[] = balanceData.map((balance: any) => ({
        currency: balance.currency,
        available: parseFloat(balance.available),
        pending: parseFloat(balance.pending || '0')
      }))
      
      // Cache the result
      this.balanceCache = {
        balances,
        timestamp: new Date()
      }
      
      return balances
      
    } catch (error) {
      console.error('Balance check failed:', error)
      throw error
    }
  }

  /**
   * Get current BTC/USD exchange rate
   */
  static async getExchangeRate(): Promise<number> {
    try {
      // Check cache first
      if (this.exchangeRateCache) {
        const cacheAge = Date.now() - this.exchangeRateCache.timestamp.getTime()
        if (cacheAge < this.EXCHANGE_RATE_CACHE_TTL) {
          return this.exchangeRateCache.rate
        }
      }
      
      const rateData = await this.makeRequest('/rates/ticker')
      
      // Find BTC/USD rate
      const btcRate = rateData.find((rate: any) => 
        rate.sourceCurrency === 'BTC' && rate.targetCurrency === 'USD'
      )
      
      if (!btcRate) {
        throw new Error('BTC/USD rate not found')
      }
      
      const rate = parseFloat(btcRate.rate)
      
      // Cache the result
      this.exchangeRateCache = {
        rate,
        timestamp: new Date()
      }
      
      return rate
      
    } catch (error) {
      console.error('Exchange rate fetch failed:', error)
      
      // Fallback to reasonable default
      return 45000 // Default BTC price
    }
  }

  /**
   * Validate Strike API configuration
   */
  static validateConfiguration(): boolean {
    if (!this.API_KEY) {
      console.error('❌ Strike API key not configured')
      return false
    }
    
    if (!this.ENVIRONMENT) {
      console.error('❌ Strike environment not configured')
      return false
    }
    
    console.log(`✅ Strike configuration valid (${this.ENVIRONMENT})`)
    return true
  }

  /**
   * Test Strike API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      if (!this.validateConfiguration()) {
        return false
      }
      
      // Test with simple balance check
      await this.getBalances()
      console.log('✅ Strike API connection successful')
      return true
      
    } catch (error) {
      console.error('❌ Strike API connection failed:', error)
      return false
    }
  }
}

// Export types for use in other modules
export type {
  StrikeLightningInvoice,
  StrikePaymentStatus,
  StrikeBalance,
  StrikeExchangeRate
} 