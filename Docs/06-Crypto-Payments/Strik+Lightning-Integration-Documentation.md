# 🚀 BitAgora Strike API Integration Plan

## 🎯 **Executive Summary**

This plan details the complete integration of Strike API with BitAgora POS to enable merchant Lightning payments with auto-settlement to Bitcoin. Each merchant will have their own Strike account and receive Lightning payments directly.

---

## 📊 **Integration Overview**

### **Current Problem**
- Static Lightning invoices causing "Unknown character" errors
- No merchant-specific Lightning receiving capability
- Limited payment method coverage
- Complex Lightning infrastructure requirements

### **Hybrid Payment Solution: Strike + Stripe**
- **Strike handles**: Lightning, Bitcoin, USD bank transfers, remittances
- **Stripe handles**: Credit cards, debit cards, international payments
- **BitAgora provides**: Unified merchant experience across all methods

### **Strike API Benefits**
- **Merchant-specific Strike accounts** for isolated Lightning receiving
- **Dynamic invoice generation** with proper amounts and expiration
- **Auto-settlement** from Lightning → BTC to merchant wallets
- **USD bank transfer processing** for fiat payments
- **Professional API** designed for business integrations

### **Payment Method Routing Strategy**
```typescript
// lib/payment-router.ts
class PaymentRouter {
  async processPayment(method: PaymentMethod, amount: number, merchantId: string) {
    switch (method) {
      case 'lightning':
      case 'bitcoin':
      case 'usd-bank-transfer':
        return await strikeService.processPayment(method, amount, merchantId)
        
      case 'credit-card':
      case 'debit-card':
      case 'international-payments':
        return await stripeService.processPayment(method, amount, merchantId)
        
      case 'cash':
        return await this.processCashPayment(amount, merchantId)
        
      case 'usdt-eth':
      case 'usdt-tron':
        return await cryptoService.processPayment(method, amount, merchantId)
        
      default:
        throw new Error(`Unsupported payment method: ${method}`)
    }
  }
}
```

### **Strike Specific Capabilities**
- ✅ **Lightning Network payments** (dynamic invoices)
- ✅ **Bitcoin payments** (on-chain)
- ✅ **USD bank transfers** (ACH via Plaid)
- ✅ **Global remittances** (USD to 10+ countries)
- ✅ **Auto-settlement** (Lightning/Bitcoin → merchant wallets)
- ❌ **Credit card processing** (use Stripe for this)
- ❌ **Multi-currency fiat** (primarily USD focused)

### **Core HTTP Client**
```bash
npm install axios@^1.10.0
```
**Why Axios:**
- ✅ **152K+ projects** use it (most popular HTTP client)
- ✅ **Battle-tested** with automatic JSON parsing
- ✅ **Built-in error handling** and interceptors
- ✅ **Request/response** transformation
- ✅ **Timeout management** and request cancellation
- ✅ **Works in browser + Node.js**

### **Lightning Invoice Validation**
```bash
npm install bolt11@^1.4.1
```
**Why bolt11:**
- ✅ **Official bitcoinjs library** (most trusted)
- ✅ **21+ projects** using it
- ✅ **BOLT-11 spec compliant** (Lightning Network standard)
- ✅ **Decode/encode** Lightning invoices
- ✅ **Well-maintained** by Bitcoin community

### **Environment & Configuration**
```bash
npm install dotenv@^16.0.0
npm install zod@^3.23.0
```
**Why these:**
- ✅ **dotenv**: Standard for environment variables
- ✅ **zod**: Runtime validation (already used in BitAgora)

---

## 🏗️ **Implementation Architecture**

### **Phase 1: Strike Service Layer**
```typescript
// lib/strike-service.ts
import axios, { AxiosInstance, AxiosError } from 'axios'
import { z } from 'zod'
import bolt11 from 'bolt11'

// Validation schemas
const StrikeInvoiceSchema = z.object({
  invoiceId: z.string(),
  amount: z.object({
    amount: z.string(),
    currency: z.string()
  }),
  state: z.enum(['UNPAID', 'PAID', 'CANCELLED']),
  created: z.string(),
  correlationId: z.string().optional(),
  description: z.string().optional()
})

const StrikeQuoteSchema = z.object({
  quoteId: z.string(),
  lnInvoice: z.string(),
  onchainAddress: z.string().optional(),
  amount: z.object({
    amount: z.string(),
    currency: z.string()
  }),
  conversionRate: z.object({
    amount: z.string(),
    sourceCurrency: z.string(),
    targetCurrency: z.string()
  }),
  expiration: z.string()
})

class StrikeService {
  private client: AxiosInstance
  private readonly baseURL: string
  private readonly environment: 'sandbox' | 'production'

  constructor() {
    this.environment = process.env.STRIKE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox'
    this.baseURL = this.environment === 'production' 
      ? 'https://api.strike.me'
      : 'https://api.strike.me' // Strike uses same URL with different API keys
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = this.getApiKeyForAccount(config.headers?.['X-Merchant-Id'] as string)
        if (apiKey) {
          config.headers.Authorization = `Bearer ${apiKey}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('Strike API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
        return Promise.reject(this.transformStrikeError(error))
      }
    )
  }

  /**
   * Create Lightning invoice for specific merchant
   */
  async createMerchantInvoice(
    merchantId: string,
    amountUSD: number,
    description: string = 'BitAgora POS Payment'
  ): Promise<{
    invoiceId: string
    lightningInvoice: string
    amount: number
    currency: string
    expiresAt: Date
    paymentHash: string
  }> {
    try {
      // Step 1: Create invoice
      const invoiceResponse = await this.client.post('/v1/invoices', {
        amount: {
          amount: amountUSD.toString(),
          currency: 'USD'
        },
        description: description,
        correlationId: `bitagora_${merchantId}_${Date.now()}`
      }, {
        headers: { 'X-Merchant-Id': merchantId }
      })

      const invoice = StrikeInvoiceSchema.parse(invoiceResponse.data)

      // Step 2: Generate quote to get Lightning invoice
      const quoteResponse = await this.client.post(
        `/v1/invoices/${invoice.invoiceId}/quote`,
        {},
        {
          headers: { 'X-Merchant-Id': merchantId }
        }
      )

      const quote = StrikeQuoteSchema.parse(quoteResponse.data)

      // Step 3: Validate Lightning invoice
      const decodedInvoice = bolt11.decode(quote.lnInvoice)
      
      return {
        invoiceId: invoice.invoiceId,
        lightningInvoice: quote.lnInvoice,
        amount: amountUSD,
        currency: 'USD',
        expiresAt: new Date(quote.expiration),
        paymentHash: decodedInvoice.tagsObject.payment_hash as string
      }

    } catch (error) {
      console.error('Failed to create merchant invoice:', error)
      throw new Error(`Strike invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check invoice payment status
   */
  async checkInvoiceStatus(
    merchantId: string,
    invoiceId: string
  ): Promise<{
    paid: boolean
    amount?: number
    paidAt?: Date
    paymentHash?: string
  }> {
    try {
      const response = await this.client.get(`/v1/invoices/${invoiceId}`, {
        headers: { 'X-Merchant-Id': merchantId }
      })

      const invoice = StrikeInvoiceSchema.parse(response.data)

      return {
        paid: invoice.state === 'PAID',
        amount: invoice.state === 'PAID' ? parseFloat(invoice.amount.amount) : undefined,
        paidAt: invoice.state === 'PAID' ? new Date(invoice.created) : undefined
      }

    } catch (error) {
      console.error('Failed to check invoice status:', error)
      throw new Error(`Strike status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get merchant Strike account info
   */
  async getMerchantAccount(merchantId: string): Promise<{
    accountId: string
    displayName: string
    lightningAddress?: string
    balanceUSD: number
    balanceBTC: number
  }> {
    try {
      const response = await this.client.get('/v1/accounts/profile', {
        headers: { 'X-Merchant-Id': merchantId }
      })

      return {
        accountId: response.data.id,
        displayName: response.data.handle || 'BitAgora Merchant',
        lightningAddress: response.data.handle ? `${response.data.handle}@strike.me` : undefined,
        balanceUSD: parseFloat(response.data.available?.amount || '0'),
        balanceBTC: 0 // Strike handles this internally
      }

    } catch (error) {
      console.error('Failed to get merchant account:', error)
      throw new Error(`Strike account fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get API key for specific merchant account
   */
  private getApiKeyForAccount(merchantId: string): string | null {
    // In production, this would be stored securely in database
    // For now, environment variable pattern
    return process.env[`STRIKE_API_KEY_${merchantId}`] || process.env.STRIKE_API_KEY || null
  }

  /**
   * Transform Strike API errors to user-friendly messages
   */
  private transformStrikeError(error: AxiosError): Error {
    if (error.response?.status === 401) {
      return new Error('Strike authentication failed - check API key')
    }
    if (error.response?.status === 402) {
      return new Error('Insufficient funds in Strike account')
    }
    if (error.response?.status === 429) {
      return new Error('Strike rate limit exceeded - please try again')
    }
    if (error.code === 'ECONNABORTED') {
      return new Error('Strike request timeout - please try again')
    }
    
    return new Error(`Strike API error: ${error.response?.status || 'Network error'}`)
  }
}

export const strikeService = new StrikeService()
```

### **Phase 2: BitAgora Integration Layer**
```typescript
// lib/merchant-lightning.ts
import { strikeService } from './strike-service'
import { z } from 'zod'

const MerchantLightningSchema = z.object({
  merchantId: z.string(),
  strikeAccountId: z.string(),
  lightningAddress: z.string().optional(),
  autoSettlement: z.boolean(),
  settlementAddress: z.string().optional(),
  createdAt: z.date(),
  isActive: z.boolean()
})

type MerchantLightning = z.infer<typeof MerchantLightningSchema>

class MerchantLightningService {
  /**
   * Setup Lightning receiving for new merchant
   */
  async setupMerchantLightning(
    merchantId: string,
    businessName: string,
    btcWalletAddress?: string
  ): Promise<MerchantLightning> {
    try {
      // Get or create Strike account for merchant
      const account = await strikeService.getMerchantAccount(merchantId)
      
      // Store merchant Lightning configuration
      const config: MerchantLightning = {
        merchantId,
        strikeAccountId: account.accountId,
        lightningAddress: account.lightningAddress,
        autoSettlement: !!btcWalletAddress,
        settlementAddress: btcWalletAddress,
        createdAt: new Date(),
        isActive: true
      }

      // Save to database (mock for now)
      await this.saveMerchantConfig(config)

      return config

    } catch (error) {
      console.error('Failed to setup merchant Lightning:', error)
      throw new Error(`Lightning setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate Lightning invoice for merchant transaction
   */
  async generateMerchantInvoice(
    merchantId: string,
    amountUSD: number,
    description?: string
  ): Promise<{
    lightningInvoice: string
    paymentHash: string
    amount: number
    expiresAt: Date
    merchantReceives: boolean
  }> {
    try {
      const config = await this.getMerchantConfig(merchantId)
      
      if (!config?.isActive) {
        throw new Error('Lightning not configured for merchant')
      }

      const invoice = await strikeService.createMerchantInvoice(
        merchantId,
        amountUSD,
        description || `${config.strikeAccountId} - BitAgora POS`
      )

      return {
        lightningInvoice: invoice.lightningInvoice,
        paymentHash: invoice.paymentHash,
        amount: invoice.amount,
        expiresAt: invoice.expiresAt,
        merchantReceives: true // Key difference - merchant gets the payment!
      }

    } catch (error) {
      console.error('Failed to generate merchant invoice:', error)
      throw new Error(`Invoice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check payment status for merchant
   */
  async checkMerchantPayment(
    merchantId: string,
    paymentHash: string
  ): Promise<{
    paid: boolean
    amount?: number
    paidAt?: Date
    settlementScheduled?: boolean
  }> {
    try {
      // In production, you'd store invoice ID with payment hash
      const invoiceId = await this.getInvoiceIdByHash(paymentHash)
      
      const status = await strikeService.checkInvoiceStatus(merchantId, invoiceId)
      
      return {
        paid: status.paid,
        amount: status.amount,
        paidAt: status.paidAt,
        settlementScheduled: status.paid // Strike handles auto-settlement
      }

    } catch (error) {
      console.error('Failed to check merchant payment:', error)
      throw new Error(`Payment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get merchant Lightning dashboard data
   */
  async getMerchantDashboard(merchantId: string): Promise<{
    lightningAddress?: string
    balanceUSD: number
    recentPayments: Array<{
      amount: number
      currency: string
      paidAt: Date
      description?: string
    }>
    autoSettlement: {
      enabled: boolean
      address?: string
      frequency: string
    }
  }> {
    try {
      const config = await this.getMerchantConfig(merchantId)
      const account = await strikeService.getMerchantAccount(merchantId)

      return {
        lightningAddress: account.lightningAddress,
        balanceUSD: account.balanceUSD,
        recentPayments: [], // Would fetch from Strike API
        autoSettlement: {
          enabled: config?.autoSettlement || false,
          address: config?.settlementAddress,
          frequency: 'daily'
        }
      }

    } catch (error) {
      console.error('Failed to get merchant dashboard:', error)
      throw new Error(`Dashboard fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Private helper methods
  private async saveMerchantConfig(config: MerchantLightning): Promise<void> {
    // In production: save to database
    // For now: mock implementation
    console.log('Saving merchant Lightning config:', config)
  }

  private async getMerchantConfig(merchantId: string): Promise<MerchantLightning | null> {
    // In production: fetch from database
    // For now: mock implementation
    return null
  }

  private async getInvoiceIdByHash(paymentHash: string): Promise<string> {
    // In production: lookup invoice ID by payment hash
    // For now: mock implementation
    return 'mock_invoice_id'
  }
}

export const merchantLightningService = new MerchantLightningService()
```

### **Phase 3: Update QR Generation**
```typescript
// lib/payment/qr-generation.ts (Lightning case update)
import { merchantLightningService } from '../merchant-lightning'
import { validateLightningInvoice } from '../crypto-validation'

// Update the Lightning case in generateCryptoQR function
case 'lightning':
  try {
    // Get merchant ID from payment settings or context
    const merchantId = paymentSettings?.merchantId || getCurrentMerchantId()
    
    if (!merchantId) {
      throw new Error('Merchant ID required for Lightning payments')
    }

    // Generate dynamic invoice via Strike API
    const invoiceData = await merchantLightningService.generateMerchantInvoice(
      merchantId,
      usdAmount,
      `BitAgora POS Payment - $${usdAmount}`
    )

    address = invoiceData.lightningInvoice
    qrContent = invoiceData.lightningInvoice
    
    // Calculate satoshi amount from Lightning invoice
    const decoded = bolt11.decode(invoiceData.lightningInvoice)
    const satoshis = decoded.satoshis || Math.floor(decoded.millisatoshis / 1000)
    
    conversionResult = {
      success: true,
      cryptoAmount: satoshis,
      formattedCryptoAmount: `${satoshis}`,
      exchangeRate: satoshis / usdAmount,
      error: undefined
    }

    // Validate the generated invoice
    if (options.validateAddresses && address) {
      const validation = validateLightningInvoice(address)
      if (!validation.isValid) {
        error = `Invalid Lightning invoice: ${validation.error}`
        isValid = false
      }
    }

    console.log('✅ Lightning invoice generated successfully:', {
      merchant: merchantId,
      amount: `$${usdAmount}`,
      satoshis: satoshis,
      expires: invoiceData.expiresAt,
      merchantReceives: invoiceData.merchantReceives
    })

  } catch (invoiceError) {
    console.error('❌ Strike Lightning invoice generation failed:', invoiceError)
    error = `Lightning payment unavailable: ${invoiceError.message}`
    isValid = false
    
    // Graceful fallback
    address = ''
    qrContent = ''
    conversionResult = {
      success: false,
      cryptoAmount: 0,
      formattedCryptoAmount: '0',
      exchangeRate: 0,
      error: error
    }
  }
  break
```

---

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# .env.local

# Strike API Configuration
STRIKE_ENVIRONMENT=sandbox  # or 'production'
STRIKE_API_KEY=your_strike_api_key_here

# Per-merchant Strike API keys (production approach)
# STRIKE_API_KEY_merchant_123=merchant_specific_key_123
# STRIKE_API_KEY_merchant_456=merchant_specific_key_456

# Application Configuration
NEXT_PUBLIC_LIGHTNING_ENABLED=true
NEXT_PUBLIC_STRIKE_SETTLEMENT_FREQUENCY=daily

# Existing BitAgora Configuration
NEXT_PUBLIC_USE_MOCK_API=false
```

### **Strike API Access Setup**
1. **Apply for Strike Business API** access at https://strike.me/api
2. **Get API credentials** for sandbox testing
3. **Configure webhook endpoints** for payment notifications (Phase 2)
4. **Setup production keys** per merchant account

---

## 🧪 **Testing Strategy**

### **Phase 1: Basic Integration Testing**
```typescript
// scripts/test-strike-integration.ts
import { strikeService, merchantLightningService } from '../lib'

const testStrikeIntegration = async () => {
  console.log('🧪 Testing Strike API Integration...')
  
  try {
    // Test 1: Service initialization
    console.log('✅ Strike service initialized')
    
    // Test 2: Merchant account check
    const account = await strikeService.getMerchantAccount('test_merchant')
    console.log('✅ Merchant account:', account)
    
    // Test 3: Invoice generation
    const invoice = await merchantLightningService.generateMerchantInvoice(
      'test_merchant',
      14.50,
      'Test Lightning Payment'
    )
    console.log('✅ Lightning invoice generated:', {
      invoice: invoice.lightningInvoice.substring(0, 50) + '...',
      amount: invoice.amount,
      expires: invoice.expiresAt,
      merchantReceives: invoice.merchantReceives
    })
    
    // Test 4: Invoice validation
    const bolt11 = require('bolt11')
    const decoded = bolt11.decode(invoice.lightningInvoice)
    console.log('✅ Invoice validation passed:', {
      amount: decoded.satoshis || decoded.millisatoshis / 1000,
      expiry: decoded.timeExpireDate,
      description: decoded.tagsObject.description
    })
    
    console.log('🎉 All tests passed! Strike integration working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testStrikeIntegration()
```

### **Phase 2: Real Wallet Testing**
1. **Generate test invoices** for small amounts ($0.50)
2. **Test with Lightning wallets** (Phoenix, Blue Wallet, Strike, etc.)
3. **Verify merchant receives payments** directly to Strike account
4. **Test auto-settlement** to BTC addresses

---

## 📋 **Implementation Timeline**

### **Week 1: Core Integration**
- [ ] Install dependencies and setup Strike service
- [ ] Implement basic invoice generation
- [ ] Update QR generation to use Strike API
- [ ] Basic error handling and validation

### **Week 2: Merchant Management**
- [ ] Merchant Lightning account setup
- [ ] Payment status checking
- [ ] Integration with existing BitAgora auth system
- [ ] Environment configuration and security

### **Week 3: Testing & Refinement**
- [ ] Comprehensive testing with real wallets
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Documentation and developer experience

### **Week 4: Production Readiness**
- [ ] Production Strike API setup
- [ ] Security audit and key management
- [ ] Monitoring and logging
- [ ] Deployment and rollout plan

---

## 🔒 **Security Considerations**

### **API Key Management**
- **Separate keys per merchant** in production
- **Environment variables** for sensitive data
- **Key rotation** procedures
- **Rate limiting** and monitoring

### **Payment Validation**
- **bolt11 invoice validation** before QR display
- **Amount verification** (USD → satoshi conversion)
- **Expiration checking** to prevent old invoices
- **Payment hash tracking** for status updates

### **Error Handling**
- **Graceful degradation** when Strike API unavailable
- **User-friendly error messages** (no technical details)
- **Retry mechanisms** for transient failures
- **Fallback options** for critical payments

---

## 📊 **Success Metrics**

### **Technical Metrics**
- [ ] Lightning invoice generation success rate > 99%
- [ ] Average invoice generation time < 2 seconds
- [ ] Payment status check accuracy 100%
- [ ] Zero "Unknown character" errors

### **Business Metrics**
- [ ] Merchant adoption of Lightning payments
- [ ] Customer satisfaction with payment speed
- [ ] Reduced payment processing costs
- [ ] Increased transaction volume

---

## 🎯 **Next Steps**

1. **Apply for Strike Business API** access immediately
2. **Install dependencies** and setup development environment
3. **Implement Phase 1** basic Strike service integration
4. **Test with small amounts** using sandbox environment
5. **Iterate and refine** based on real usage feedback

**This implementation gives BitAgora merchants true Lightning receiving capability with professional-grade infrastructure handled by Strike!**