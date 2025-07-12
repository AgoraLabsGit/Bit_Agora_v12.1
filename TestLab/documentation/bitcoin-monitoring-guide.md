# 🧪 **Bitcoin Payment Monitoring Test Lab Guide**

## **🎯 Overview**

The Bitcoin Payment Monitoring Test Lab provides a **complete, isolated environment** for developing and testing Bitcoin on-chain payment monitoring **without affecting your production Lightning/Strike API system**.

## **🚨 CRITICAL SAFETY FEATURES**

### **✅ Complete Isolation**
- **Separate API endpoints**: `/api/testlab/bitcoin/` vs `/api/lightning/`
- **Independent services**: No imports from production payment code
- **Isolated database**: Test Lab uses separate storage
- **Safe testing**: Production POS system remains untouched

### **⚡ Production Protection**
- **Lightning payments**: Continue working via Strike API
- **POS system**: Remains fully functional
- **Payment processing**: No interruption to existing flows

## **📁 Test Lab Architecture**

```
TestLab/
├── bitcoin-monitoring/
│   ├── types/                      # Bitcoin monitoring types
│   ├── services/                   # BitcoinMonitoringService
│   ├── hooks/                      # useBitcoinStatus React hook
│   ├── api/                        # API endpoint handlers
│   └── components/                 # Bitcoin UI components
├── test-interface/                 # Test Lab UI
├── blockchain-apis/                # Blockchain API integrations
└── documentation/                  # This guide
```

## **🔧 Features Implemented**

### **✅ Core Bitcoin Monitoring**
- **Address monitoring**: Real-time Bitcoin address transaction tracking
- **Confirmation tracking**: 0/1/6 confirmation progress monitoring
- **Status updates**: pending → unconfirmed → confirming → confirmed
- **Payment completion**: Automatic completion when target confirmations reached

### **✅ Blockchain API Integration**
- **Mempool.space**: Primary blockchain API (mainnet/testnet)
- **BlockCypher**: Alternative API with rate limiting
- **Blockchair**: Additional API option
- **Mock mode**: Simulated data for testing

### **✅ React Integration**
- **useBitcoinStatus hook**: Real-time Bitcoin payment monitoring
- **Status callbacks**: onPaymentReceived, onPaymentConfirmed, onPaymentFailed
- **Error handling**: Comprehensive error management
- **Retry mechanism**: Automatic retry on failures

## **🚀 Getting Started**

### **1. Access Test Lab**
Navigate to: `http://localhost:3000/testlab/bitcoin-monitoring`

### **2. Test Interface Features**

#### **Test Controls**
- **Bitcoin Address**: Enter or generate test addresses
- **Expected Amount**: Set expected payment in satoshis
- **USD Amount**: Set USD equivalent for reference
- **Mock Mode**: Toggle between real blockchain and simulated data

#### **Action Buttons**
- **Start Monitoring**: Begin real-time address monitoring
- **Stop Monitoring**: Stop monitoring and clear timers
- **Check Address**: One-time address balance/transaction check
- **Retry**: Retry failed operations

#### **Status Display**
- **Payment Status**: Current payment state
- **Confirmations**: Progress toward target confirmations
- **Amount Tracking**: Expected vs received amounts
- **Address Info**: Balance and transaction history

## **📊 Testing Scenarios**

### **Mock Mode Testing**
```javascript
// Enable mock mode for predictable testing
mockMode: true
```
- Simulates Bitcoin transactions
- Predictable confirmation progression
- No real blockchain interaction
- Perfect for development

### **Real Blockchain Testing**
```javascript
// Disable mock mode for real testing
mockMode: false
```
- Uses real blockchain APIs
- Actual Bitcoin transaction monitoring
- Real confirmation tracking
- Production-like behavior

## **🔌 API Endpoints**

### **Start Monitoring**
```bash
POST /api/testlab/bitcoin/monitor
{
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "expectedAmount": 50000,
  "usdAmount": 4.00,
  "config": {
    "targetConfirmations": 1,
    "pollInterval": 30000,
    "timeout": 1800000
  }
}
```

### **Check Status**
```bash
GET /api/testlab/bitcoin/status/[address]
```

### **Check Address**
```bash
GET /api/testlab/bitcoin/check/[address]
```

### **Stop Monitoring**
```bash
POST /api/testlab/bitcoin/stop/[address]
```

## **💻 Code Integration**

### **React Hook Usage**
```typescript
import { useBitcoinStatus } from '@/TestLab/bitcoin-monitoring/hooks/use-bitcoin-status'

const MyComponent = () => {
  const {
    status,
    isMonitoring,
    error,
    startMonitoring,
    stopMonitoring
  } = useBitcoinStatus({
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    expectedAmount: 50000,
    usdAmount: 4.00,
    onPaymentReceived: (status) => {
      console.log('Payment received!', status)
    },
    onPaymentConfirmed: (status) => {
      console.log('Payment confirmed!', status)
    }
  })

  return (
    <div>
      <button onClick={startMonitoring}>Start Monitoring</button>
      <p>Status: {status?.status}</p>
      <p>Confirmations: {status?.confirmations}</p>
    </div>
  )
}
```

### **Direct Service Usage**
```typescript
import { BitcoinMonitoringService } from '@/TestLab/bitcoin-monitoring/services/bitcoin-monitoring-service'

const service = BitcoinMonitoringService.getInstance(config)

// Start monitoring
const paymentStatus = await service.startMonitoring(
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  50000
)

// Check status
const status = service.getPaymentStatus(address)

// Stop monitoring
service.stopMonitoring(address)
```

## **🧪 Testing Your Bitcoin Transaction**

### **Step 1: Generate Test Address**
1. Click "Generate" to create a test Bitcoin address
2. Or manually enter your own address

### **Step 2: Configure Payment**
1. Set expected amount (e.g., 50000 satoshis)
2. Set USD amount (e.g., $4.00)
3. Choose mock mode or real blockchain

### **Step 3: Start Monitoring**
1. Click "Start Monitoring"
2. System begins polling the address
3. Status updates appear in real-time

### **Step 4: Send Test Payment**
- **Mock Mode**: System simulates receiving payment
- **Real Mode**: Send actual Bitcoin to the address

### **Step 5: Monitor Progress**
- Watch status progression: pending → unconfirmed → confirming → confirmed
- Track confirmation count: 0/1 → 1/1 → confirmed
- View real-time updates in the log

## **🛠️ Configuration Options**

### **Monitoring Configuration**
```typescript
interface BitcoinMonitoringConfig {
  targetConfirmations: number    // Default: 1
  pollInterval: number          // Default: 30000 (30 seconds)
  maxRetries: number           // Default: 3
  timeout: number              // Default: 1800000 (30 minutes)
  blockchainApi: 'mempool' | 'blockcypher' | 'blockchair'
  network: 'mainnet' | 'testnet'
}
```

### **Test Lab Configuration**
```typescript
interface TestLabBitcoinConfig {
  useTestnet: boolean          // Default: true
  mockMode: boolean           // Default: false
  apiEndpoint: string         // Default: mempool.space
  apiKey?: string            // Optional API key
  webhookUrl?: string        // Optional webhook URL
  monitoringConfig: BitcoinMonitoringConfig
}
```

## **🚨 Troubleshooting**

### **Common Issues**

#### **"Address monitoring not starting"**
- ✅ Check address format (bc1... or tb1... for testnet)
- ✅ Verify expected amount is positive
- ✅ Check network settings (mainnet vs testnet)

#### **"No status updates"**
- ✅ Ensure polling interval is reasonable (30+ seconds)
- ✅ Check blockchain API rate limits
- ✅ Verify internet connection

#### **"Payment not detected"**
- ✅ Confirm transaction was broadcast to blockchain
- ✅ Check if using correct network (mainnet/testnet)
- ✅ Verify address matches exactly

#### **"Confirmation stuck at 0"**
- ✅ Transaction may be in mempool (unconfirmed)
- ✅ Check blockchain explorer for transaction status
- ✅ Wait for next block (10-20 minutes average)

### **Debug Tools**
1. **Check Address**: Use one-time address check
2. **Clear Log**: Reset test results log
3. **Mock Mode**: Enable for predictable testing
4. **Retry**: Restart failed monitoring

## **🔧 Development Notes**

### **Adding New Blockchain APIs**
1. Add API handler in `bitcoin-monitoring-service.ts`
2. Update `BitcoinMonitoringConfig` type
3. Add API-specific response parsing
4. Test with Test Lab interface

### **Extending Payment Status**
1. Update `BitcoinPaymentStatus` interface
2. Modify status determination logic
3. Add new status handling in hooks
4. Update UI components

### **Production Integration**
1. Test thoroughly in Test Lab
2. Create production API endpoints
3. Update production POS integration
4. Migrate configuration to production

## **📈 Performance Considerations**

### **API Rate Limits**
- **Mempool.space**: No rate limits (free)
- **BlockCypher**: 3 requests/second, 200 requests/hour (free)
- **Blockchair**: 1 request/second (free)

### **Polling Frequency**
- **Recommended**: 30-60 seconds
- **Minimum**: 10 seconds (respect API limits)
- **Maximum**: 300 seconds (5 minutes)

### **Memory Management**
- Monitoring stops automatically after timeout
- Clean up timers on component unmount
- Use single service instance

## **🎯 Next Steps**

### **Phase 1: Test Lab Validation** ✅
- [x] Core Bitcoin monitoring service
- [x] Blockchain API integration
- [x] React hooks and components
- [x] Test Lab interface
- [x] Documentation

### **Phase 2: Production Integration** (Next)
- [ ] Production API endpoints
- [ ] POS system integration
- [ ] Database schema updates
- [ ] Production configuration
- [ ] Monitoring dashboard

### **Phase 3: Advanced Features** (Future)
- [ ] Multi-address monitoring
- [ ] Webhook notifications
- [ ] Advanced confirmation rules
- [ ] Payment analytics
- [ ] Mobile app integration

## **🔒 Security Considerations**

### **API Security**
- Use HTTPS for all blockchain API calls
- Implement rate limiting on endpoints
- Add request validation and sanitization
- Monitor for unusual activity

### **Address Validation**
- Validate all Bitcoin addresses before monitoring
- Check address format and network compatibility
- Prevent monitoring of invalid addresses

### **Data Privacy**
- Don't log sensitive payment information
- Use secure storage for monitoring data
- Implement proper session management

---

## **📞 Support**

For questions or issues with the Bitcoin monitoring system:

1. **Check the Test Lab logs** for detailed error messages
2. **Review this documentation** for configuration help
3. **Test in mock mode** to isolate blockchain vs code issues
4. **Verify your Bitcoin address** using a blockchain explorer

**Remember**: This Test Lab is completely isolated from your production system. Feel free to experiment and test thoroughly!

---

**🎯 Goal**: Once thoroughly tested, this Bitcoin monitoring system can be safely integrated into your production POS system, providing complete cryptocurrency payment monitoring alongside your existing Lightning/Strike API integration. 