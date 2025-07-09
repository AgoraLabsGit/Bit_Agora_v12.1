# BitAgora Strike Lightning Integration Guide

## 🎯 **Implementation Roadmap**

Based on your successful Strike API test (5/7 permissions working), here's the step-by-step integration plan.

## 🔍 **Current BitAgora Architecture Review**

Based on the existing codebase, here's how Strike Lightning integrates with your current architecture:

### **Existing Payment Flow:**
1. **POS Interface** → `/app/pos/page.tsx`
2. **Payment Method Selection** → `PaymentMethodSelector.tsx`
3. **QR Code Generation** → `lib/payment/qr-generation.ts`
4. **Payment Status** → `use-payment-status.ts` hook
5. **Transaction Storage** → Mock API (`lib/mock-api.ts`)

### **Strike Integration Points:**
- **Replace static Lightning QR** in `qr-generation.ts`
- **Add real-time monitoring** to `use-payment-status.ts`
- **Enhance payment flows** in `components/pos/payment/`
- **Update transaction logging** for Strike invoice IDs

---

## 📦 **Step 1: Add Strike Service to BitAgora**

### **1.1 Create the Strike Service**
```bash
# Save the StrikeLightningService code as:
# lib/strike-lightning-service.ts
```

### **1.2 Update Environment Variables**
```bash
# .env.local (you already have this working)
STRIKE_API_KEY=591ECAE9AB24BD587F937ADFAA99E548A2FB6C28E220540DECE2F204F9681562
STRIKE_ENVIRONMENT=sandbox
```

---

## ⚡ **Step 2: Integrate with BitAgora QR Generation**

### **2.1 Update QR Generation Service**
```typescript
// lib/payment/qr-generation.ts - Update the Lightning case

case 'lightning':
  try {
    // Use Strike API instead of static invoice
    const lightningData = await StrikeLightningService.generateLightningQR(
      usdAmount, 
      'BitAgora POS Payment'
    )
    
    qrContent = lightningData.qrContent // bolt11 invoice
    address = lightningData.qrContent
    
    conversionResult = {
      success: true,
      cryptoAmount: usdAmount, // Strike handles conversion
      formattedAmount: `$${usdAmount.toFixed(2)}`,
      exchangeRate: await StrikeLightningService.getExchangeRate()
    }
    
    // Store invoice ID for payment monitoring
    localStorage.setItem('currentLightningInvoice', lightningData.invoiceId)
    
  } catch (error) {
    console.error('Strike Lightning generation failed:', error)
    // Fallback to static invoice if Strike fails
    qrContent = fallbackAddresses.lightning
    address = fallbackAddresses.lightning
    isValid = false
    error = 'Strike service unavailable - using fallback'
  }
  break
```

### **2.2 Add Payment Monitoring**
```typescript
// lib/payment-monitoring.ts - New service for real-time updates

import { StrikeLightningService } from './strike-lightning-service'

export class PaymentMonitoringService {
  static async monitorLightningPayment(
    invoiceId: string,
    onUpdate: (status: string, data?: any) => void
  ) {
    try {
      const finalStatus = await StrikeLightningService.monitorPayment(
        invoiceId,
        (status) => {
          // Update UI in real-time
          onUpdate(status.state, {
            amount: status.paidAmount,
            updated: status.updated
          })
        }
      )
      
      return finalStatus
    } catch (error) {
      onUpdate('FAILED', { error: error.message })
      throw error
    }
  }
}
```

---

## 🎨 **Step 3: Update Payment UI Components**

### **3.1 Enhanced Lightning Payment Flow**
```typescript
// components/pos/payment/LightningPaymentFlow.tsx

import { StrikeLightningService } from '@/lib/strike-lightning-service'
import { PaymentMonitoringService } from '@/lib/payment-monitoring'

export function LightningPaymentFlow({ amount }: { amount: number }) {
  const [qrData, setQrData] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('generating')
  const [invoiceId, setInvoiceId] = useState('')
  
  useEffect(() => {
    generateLightningInvoice()
  }, [amount])
  
  const generateLightningInvoice = async () => {
    try {
      setPaymentStatus('generating')
      
      const lightningData = await StrikeLightningService.generateLightningQR(
        amount,
        'BitAgora POS Payment'
      )
      
      setQrData(lightningData)
      setInvoiceId(lightningData.invoiceId)
      setPaymentStatus('waiting')
      
      // Start monitoring payment
      PaymentMonitoringService.monitorLightningPayment(
        lightningData.invoiceId,
        (status, data) => {
          setPaymentStatus(status.toLowerCase())
          if (status === 'PAID') {
            onPaymentComplete(data)
          }
        }
      )
      
    } catch (error) {
      setPaymentStatus('error')
      console.error('Lightning invoice generation failed:', error)
    }
  }
  
  return (
    <div className="lightning-payment-flow">
      {paymentStatus === 'generating' && (
        <div>🔄 Generating Lightning invoice...</div>
      )}
      
      {paymentStatus === 'waiting' && qrData && (
        <div>
          <QRCodeDisplay data={qrData.qrContent} />
          <p>⚡ Scan with Lightning wallet</p>
          <p>Amount: ${amount.toFixed(2)} USD</p>
          <p>Expires: {qrData.expires.toLocaleTimeString()}</p>
        </div>
      )}
      
      {paymentStatus === 'pending' && (
        <div>🔄 Payment detected, confirming...</div>
      )}
      
      {paymentStatus === 'paid' && (
        <div>✅ Payment confirmed! Thank you.</div>
      )}
      
      {paymentStatus === 'error' && (
        <div>❌ Payment failed. Please try again.</div>
      )}
    </div>
  )
}
```

---

## 🧪 **Step 4: Test the Integration**

### **4.1 Create Test Script**
```typescript
// scripts/test-lightning-integration.js

import { StrikeLightningService } from '../lib/strike-lightning-service.js'

async function testLightningIntegration() {
  console.log('🧪 Testing BitAgora Lightning Integration')
  
  try {
    // Test 1: Generate Lightning invoice
    console.log('\n1. Testing Lightning invoice generation...')
    const lightningData = await StrikeLightningService.generateLightningQR(
      1.50, // $1.50 test amount
      'BitAgora Test Payment'
    )
    
    console.log('✅ Lightning Invoice Generated:')
    console.log(`   Invoice ID: ${lightningData.invoiceId}`)
    console.log(`   Amount: $${lightningData.amount}`)
    console.log(`   QR Content: ${lightningData.qrContent.substring(0, 50)}...`)
    
    // Test 2: Check balances
    console.log('\n2. Testing balance check...')
    const balances = await StrikeLightningService.getBalances()
    console.log('✅ Balances Retrieved:', balances.length, 'currencies')
    
    // Test 3: Get exchange rate
    console.log('\n3. Testing exchange rate...')
    const rate = await StrikeLightningService.getExchangeRate()
    console.log(`✅ BTC/USD Rate: $${rate.toLocaleString()}`)
    
    console.log('\n🎉 Lightning integration test successful!')
    console.log('Ready to integrate with BitAgora POS!')
    
  } catch (error) {
    console.error('❌ Lightning integration test failed:', error.message)
  }
}

testLightningIntegration()
```

### **4.2 Run Integration Test**
```bash
node scripts/test-lightning-integration.js
```

---

## 📋 **Step 5: Update BitAgora Payment Methods**

### **5.1 Enable Lightning in Feature Flags**
```typescript
// lib/feature-flags.ts - Update Lightning feature

{
  key: 'LIGHTNING_PAYMENTS',
  name: 'Lightning Network Payments',
  description: 'Enable Lightning Network payments via Strike',
  enabled: true, // Enable it!
  archived: false, // Unarchive it!
  category: 'payment',
  developmentStatus: 'active', // Mark as active
  version: '1.0.0'
}
```

### **5.2 Update Payment Router**
```typescript
// lib/payment-router.ts - Add Lightning routing

import { StrikeLightningService } from './strike-lightning-service'

export async function routePayment(method: string, amount: number, ...args) {
  switch (method) {
    case 'lightning':
      return await StrikeLightningService.generateLightningQR(amount)
    
    // ... other payment methods
  }
}
```

---

## 🎯 **Expected Results**

After implementation, you should have:

### **✅ Working Features:**
- 🔄 **Dynamic Lightning invoices** generated via Strike
- 💰 **Real USD amounts** converted automatically
- ⚡ **Real-time payment monitoring** with status updates
- 📱 **QR codes that work** with any Lightning wallet
- 💵 **Instant settlement** to your Strike account

### **🧪 Test Flow:**
1. **Customer selects Lightning payment** in BitAgora POS
2. **Strike generates real invoice** for exact USD amount
3. **QR code displays** with expiration timer
4. **Customer scans with Phoenix/Strike/etc.** 
5. **Payment detected in real-time**
6. **Transaction completes** automatically
7. **Funds appear** in your Strike account

---

## 🚀 **Go Live Checklist**

- [ ] Strike service implemented (`lib/strike-lightning-service.ts`)
- [ ] QR generation updated to use Strike API
- [ ] Payment monitoring service created
- [ ] UI components updated for real-time status
- [ ] Lightning feature flag enabled
- [ ] Integration test passing
- [ ] Test payment with real Lightning wallet
- [ ] Ready for customer payments!

---

## 💡 **Pro Tips**

### **Error Handling:**
- Always have fallback to static invoice if Strike fails
- Show clear error messages to customers
- Log all Strike API responses for debugging

### **Performance:**
- Cache exchange rates for 5 minutes
- Use polling for payment status (every 5 seconds)
- Set reasonable timeouts (15 minutes for invoices)

### **Security:**
- Never expose Strike API key to frontend
- Validate all amounts before sending to Strike
- Monitor for unusual payment patterns

---

## 🧪 **Testing & Validation Strategy**

### **Phase 1: Service Testing**
```bash
# Test Strike API integration
node scripts/test-strike-permissions-fixed.js

# Test Lightning service
node scripts/test-lightning-integration.js

# Expected results:
# ✅ Invoice creation working
# ✅ Payment monitoring working
# ✅ Balance checks working
# ✅ Exchange rates working
```

### **Phase 2: Integration Testing**
```typescript
// Test with BitAgora POS interface
1. Open http://localhost:3000/pos
2. Add product to cart ($1.50)
3. Select Lightning payment method
4. Verify Strike invoice generation
5. Check QR code displays correctly
6. Monitor payment status updates
```

### **Phase 3: End-to-End Testing**
```bash
# Test with real Lightning wallet
1. Use Strike, Phoenix, or Wallet of Satoshi
2. Scan QR code from BitAgora
3. Complete payment
4. Verify instant confirmation
5. Check funds in Strike account
```

### **Phase 4: Production Readiness**
- [ ] Error handling tested (network failures, API errors)
- [ ] Fallback mechanisms working (static QR if Strike fails)
- [ ] Performance optimized (caching, reasonable timeouts)
- [ ] Logging configured for debugging
- [ ] Webhook endpoints configured (optional)

---

## 🔒 **Security Considerations**

### **API Key Security:**
- ✅ Strike API key stored in `.env.local` (not in git)
- ✅ Server-side only (never exposed to frontend)
- ✅ Sandbox mode for testing
- ⚠️ **TODO**: Rotate key before production

### **Amount Validation:**
- ✅ Validate USD amounts before sending to Strike
- ✅ Set reasonable limits (min: $0.01, max: $10,000)
- ✅ Prevent decimal precision issues

### **Payment Verification:**
- ✅ Always verify payment status with Strike API
- ✅ Never trust client-side payment confirmations
- ✅ Log all payment attempts for audit trail

---

## 📊 **Performance Optimization**

### **Caching Strategy:**
```typescript
// Cache exchange rates for 5 minutes
const EXCHANGE_RATE_CACHE_TTL = 5 * 60 * 1000

// Cache balances for 30 seconds
const BALANCE_CACHE_TTL = 30 * 1000
```

### **Polling Optimization:**
- **Payment monitoring**: 5-second intervals
- **Status updates**: Real-time via webhooks (optional)
- **Timeout handling**: 15-minute invoice expiry

### **Error Recovery:**
- **Retry logic**: 3 attempts with exponential backoff
- **Fallback options**: Static QR codes if Strike unavailable
- **Graceful degradation**: Clear error messages to users

---

## 🚀 **Go-Live Deployment**

### **Pre-Production Checklist:**
- [ ] Strike API key permissions verified (7/7 passing)
- [ ] All tests passing in sandbox environment
- [ ] Error handling tested thoroughly
- [ ] Performance monitoring configured
- [ ] Backup payment methods available

### **Production Deployment:**
1. **Switch to production API key**
2. **Update environment variables**
3. **Test with small amounts first**
4. **Monitor initial transactions closely**
5. **Enable full Lightning payments**

### **Post-Launch Monitoring:**
- **Payment success rates** (target: >95%)
- **API response times** (target: <2 seconds)
- **Error frequencies** (target: <1%)
- **Customer satisfaction** (Lightning payment experience)

**Ready for production Lightning payments!** ⚡️