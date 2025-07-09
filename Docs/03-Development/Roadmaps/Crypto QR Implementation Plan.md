# Crypto QR Generation Implementation Plan

**Status**: 🚨 Phase 1 Critical Priority  
**Timeline**: 2-3 weeks  
**Goal**: Fix crypto payment QR generation with proper exchange rates and valid URIs

---

## 🎯 **Problem Statement**

**Current Issues:**
- ❌ Static Lightning invoices (no dynamic generation)
- ❌ Incorrect Bitcoin amount conversion 
- ❌ USDT URI format issues (base units)
- ❌ No real-time exchange rates
- ❌ Limited wallet compatibility testing

**Success Criteria:**
- ✅ Dynamic Lightning invoice generation
- ✅ Accurate USD → crypto conversion
- ✅ Valid BIP21/EIP-681 URI formats
- ✅ Real-time exchange rate integration
- ✅ Tested with major crypto wallets

---

## 🔧 **Implementation Phases**

### **Phase 1.1: Foundation & Exchange Rates (Week 1)**

#### **Task 1.1.1: Exchange Rate Service Integration**
**Priority**: 🔥 Critical
**Estimated Time**: 2 days

```typescript
// lib/exchange-rate-service.ts
class ExchangeRateService {
  async getBitcoinPrice(): Promise<number>
  async getExchangeRates(): Promise<ExchangeRates>
  private handleApiFailure(): ExchangeRates // Fallback rates
}
```

**Implementation Steps:**
1. Integrate CoinGecko API (primary)
2. Add CoinAPI as fallback
3. Implement 5-minute caching
4. Add error handling and fallback rates
5. Test rate limiting scenarios

**Acceptance Criteria:**
- [ ] Real BTC/USD rates fetched successfully
- [ ] Fallback rates work when API fails
- [ ] Rate caching prevents excessive API calls
- [ ] Error handling provides user feedback

#### **Task 1.1.2: Bitcoin BIP21 URI Generation**
**Priority**: 🔥 Critical  
**Estimated Time**: 1 day

```typescript
// Fix Bitcoin amount conversion
const generateBitcoinQR = async (address: string, amountUSD: number) => {
  const btcPrice = await exchangeRateService.getBitcoinPrice()
  const btcAmount = (amountUSD / btcPrice).toFixed(8) // 8 decimals
  const satoshis = Math.round(parseFloat(btcAmount) * 100000000)
  
  // Check minimum (546 satoshis)
  if (satoshis < 546) {
    throw new Error(`Payment too small. Minimum: $${(546 * btcPrice / 100000000).toFixed(2)}`)
  }
  
  return `bitcoin:${address}?amount=${btcAmount}&label=BitAgora%20POS`
}
```

**Acceptance Criteria:**
- [ ] Correct USD → BTC conversion
- [ ] Valid BIP21 URI format
- [ ] Minimum amount validation
- [ ] Error handling for edge cases

#### **Task 1.1.3: USDT Base Units Fix**
**Priority**: 🔥 Critical
**Estimated Time**: 1 day

```typescript
// Fix USDT amount formatting
const generateUSDTQR = (address: string, amountUSD: number, network: 'eth' | 'tron') => {
  const microUSDT = Math.round(amountUSD * 1000000) // 6 decimals to base units
  
  if (network === 'eth') {
    return `ethereum:${address}?amount=${microUSDT}&token=0xdac17f958d2ee523a2206206994597c13d831ec7`
  } else {
    return `tron:${address}?amount=${microUSDT}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimals=6`
  }
}
```

**Acceptance Criteria:**
- [ ] USDT amounts in correct base units (microUSDT)
- [ ] Both Ethereum and Tron networks work
- [ ] Wallet recognition testing passed

---

### **Phase 1.2: Lightning Integration (Week 2)**

#### **Task 1.2.1: LNBits Service Integration**
**Priority**: 🔥 Critical
**Estimated Time**: 3 days

**Setup Steps:**
1. Create LNBits account (free tier)
2. Generate API key
3. Set up environment variables
4. Implement invoice generation

```typescript
// lib/lightning-service.ts
class LightningService {
  async generateInvoice(amountUSD: number, description: string): Promise<LightningInvoice>
  async checkInvoiceStatus(paymentHash: string): Promise<PaymentStatus>
  private convertUSDToSatoshis(amountUSD: number): Promise<number>
}
```

**Implementation Details:**
- Use LNBits free tier for MVP
- Convert USD to satoshis using exchange rates
- Generate invoices with proper expiration
- Add payment status checking

**Acceptance Criteria:**
- [ ] Dynamic Lightning invoices generated
- [ ] Correct USD → satoshi conversion
- [ ] Invoice expiration handling
- [ ] Payment status monitoring

#### **Task 1.2.2: Wallet Address Validation**
**Priority**: 🟡 High
**Estimated Time**: 1 day

```typescript
// Integrate existing crypto-validation.ts
import { validateBitcoinAddress, validateUSDTAddress } from '@/lib/crypto-validation'

const validatePaymentAddress = (address: string, method: CryptoMethod): ValidationResult => {
  switch (method) {
    case 'bitcoin':
      return validateBitcoinAddress(address)
    case 'usdt-eth':
      return validateUSDTAddress(address, 'ethereum')
    case 'usdt-tron':
      return validateUSDTAddress(address, 'tron')
  }
}
```

**Acceptance Criteria:**
- [ ] All crypto addresses validated before QR generation
- [ ] Clear error messages for invalid addresses
- [ ] Integration with existing validation functions

---

### **Phase 1.3: Testing & Integration (Week 3)**

#### **Task 1.3.1: Real Wallet Testing**
**Priority**: 🔥 Critical
**Estimated Time**: 2 days

**Testing Matrix:**
```
| Wallet          | Bitcoin | Lightning | USDT-ETH | USDT-TRX |
|-----------------|---------|-----------|----------|----------|
| MetaMask        | N/A     | N/A       | ✅       | N/A      |
| Trust Wallet    | ✅      | ❌        | ✅       | ✅       |
| Blue Wallet     | ✅      | ✅        | N/A      | N/A      |
| Phoenix         | N/A     | ✅        | N/A      | N/A      |
| TronLink        | N/A     | N/A       | N/A      | ✅       |
```

**Testing Process:**
1. Generate QR codes for each method
2. Scan with multiple wallets
3. Verify amounts display correctly
4. Test actual payments (small amounts)
5. Document wallet compatibility

**Acceptance Criteria:**
- [ ] Major wallets recognize QR codes
- [ ] Amounts display correctly in wallets
- [ ] No "payment too small" errors
- [ ] URI formats pass wallet validation

#### **Task 1.3.2: Error Handling & UX**
**Priority**: 🟡 High
**Estimated Time**: 2 days

```typescript
// Enhanced error handling
interface CryptoPaymentError {
  type: 'AMOUNT_TOO_SMALL' | 'INVALID_ADDRESS' | 'API_ERROR' | 'NETWORK_ERROR'
  message: string
  suggestion?: string
  retryable: boolean
}

const handleCryptoError = (error: CryptoPaymentError): UserFeedback => {
  switch (error.type) {
    case 'AMOUNT_TOO_SMALL':
      return {
        title: 'Payment Amount Too Small',
        message: error.message,
        action: 'Increase amount or use different payment method'
      }
    // ... other error types
  }
}
```

**Acceptance Criteria:**
- [ ] User-friendly error messages
- [ ] Retry mechanisms for network errors
- [ ] Fallback options when APIs fail
- [ ] Loading states during QR generation

#### **Task 1.3.3: Production Environment Setup**
**Priority**: 🟡 High
**Estimated Time**: 1 day

**Environment Configuration:**
```bash
# Production environment variables
LNBITS_URL=https://legend.lnbits.com
LNBITS_API_KEY=prod_key_here
COINGECKO_API_KEY=optional_for_higher_limits
BITCOIN_WALLET_ADDRESS=bc1q_production_address
ETHEREUM_WALLET_ADDRESS=0x_production_address
TRON_WALLET_ADDRESS=T_production_address
```

**Acceptance Criteria:**
- [ ] Production environment variables configured
- [ ] API keys secured and tested
- [ ] Wallet addresses validated
- [ ] Monitoring and logging in place

---

## 📦 **Required Dependencies**

### **New Package Installations**
```bash
npm install bolt11 @ln-service/ln-service
npm install bitcoinjs-lib bech32
npm install ethers tronweb
npm install multicoin-address-validator bs58check
```

### **Environment Variables**
```bash
# Add to .env.local
LNBITS_URL=https://legend.lnbits.com
LNBITS_API_KEY=your_api_key
COINGECKO_API_KEY=optional
BITCOIN_WALLET_ADDRESS=bc1q...
ETHEREUM_WALLET_ADDRESS=0x...
TRON_WALLET_ADDRESS=T...
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- [ ] Exchange rate conversion functions
- [ ] URI generation for each crypto method
- [ ] Address validation functions
- [ ] Error handling scenarios

### **Integration Tests**
- [ ] Real API calls with rate limiting
- [ ] QR code generation end-to-end
- [ ] Wallet address validation
- [ ] Lightning invoice creation

### **Manual Testing**
- [ ] Real wallet scanning tests
- [ ] Payment flow validation
- [ ] Error scenario testing
- [ ] Performance testing with high load

---

## 📊 **Success Metrics**

### **Technical Metrics**
- [ ] QR code generation success rate > 99%
- [ ] Exchange rate API response time < 2s
- [ ] Lightning invoice generation < 3s
- [ ] Zero amount conversion errors

### **User Experience Metrics**
- [ ] Wallet compatibility rate > 90%
- [ ] Payment success rate > 95%
- [ ] User error rate < 5%
- [ ] Support ticket reduction > 80%

---

## 🚨 **Risk Mitigation**

### **High-Risk Items**
1. **Lightning Service Dependency**
   - Risk: LNBits API downtime
   - Mitigation: Implement fallback to static invoices

2. **Exchange Rate API Limits**
   - Risk: Rate limiting during high usage
   - Mitigation: Multiple API providers + caching

3. **Wallet Compatibility**
   - Risk: Some wallets don't support URI formats
   - Mitigation: Comprehensive testing + documentation

### **Rollback Plan**
- Keep current static invoice system as fallback
- Feature flags for new crypto methods
- Gradual rollout by payment method

---

This implementation plan provides a clear roadmap to fix all crypto QR generation issues within 2-3 weeks while maintaining system stability. 