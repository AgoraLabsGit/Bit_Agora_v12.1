# Crypto Payment Integration Guide

**Status**: 🎯 Phase 1 Priority Implementation  
**Objective**: Generate proper crypto payment QR codes with real-time exchange rates and valid payment URIs

---

## ⚡ **Lightning Network Integration**

### **Service Providers (Priority Order)**
1. **LNBits** (Recommended for MVP)
   - API: `https://lnbits.com/docs`
   - Generate invoices: `POST /api/v1/payments`
   - ✅ Free tier available
   - ✅ Easy setup
   - ✅ Self-hosted or cloud options

2. **BTCPay Server** (Self-hosted)
   - API: `https://docs.btcpayserver.org/API/Greenfield/v1/`
   - Lightning invoice: `POST /api/v1/stores/{storeId}/lightning/{cryptoCode}/invoices`
   - ✅ Open source
   - ❌ Complex setup

3. **Strike API** (Commercial)
   - API: `https://docs.strike.me/api`
   - Invoice generation: `POST /v1/invoices`
   - ✅ Professional grade
   - ❌ Requires business approval

### **Required Dependencies**
```bash
npm install bolt11 @ln-service/ln-service lnurl-pay
npm install ws node-fetch
```

### **Implementation Example**
```typescript
// Lightning Invoice Generation with LNBits
import bolt11 from 'bolt11'

const generateLightningInvoice = async (amountUSD: number, description: string) => {
  // Convert USD to satoshis using exchange rate
  const btcPrice = await getBitcoinPrice()
  const satoshis = Math.floor((amountUSD / btcPrice) * 100000000)
  
  const response = await fetch(`${process.env.LNBITS_URL}/api/v1/payments`, {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.LNBITS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: satoshis,
      memo: description,
      out: false
    })
  })
  
  const data = await response.json()
  return {
    invoice: data.payment_request,
    amount: satoshis,
    expires: data.expire_time
  }
}
```

---

## ₿ **Bitcoin On-Chain Integration**

### **Exchange Rate APIs (Priority Order)**
1. **CoinGecko** (Free, good for MVP)
   - API: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
   - Rate limit: 10-50 calls/minute
   - ✅ Free tier sufficient for testing

2. **CoinAPI** (Premium backup)
   - API: `https://rest.coinapi.io/v1/exchangerate/BTC/USD`
   - Higher rate limits
   - ✅ More reliable for production

### **Required Dependencies**
```bash
npm install bitcoinjs-lib @bitcoinerlab/secp256k1 bech32
npm install multicoin-address-validator
```

### **BIP21 URI Implementation**
```typescript
// Bitcoin Payment URI Generation (BIP21 Standard)
import { validate } from 'multicoin-address-validator'

const generateBitcoinQR = async (address: string, amountUSD: number) => {
  // Validate Bitcoin address
  if (!validate(address, 'bitcoin')) {
    throw new Error('Invalid Bitcoin address')
  }
  
  // Get current BTC price
  const btcPrice = await getBitcoinPrice()
  
  // Convert USD to BTC (8 decimal places)
  const btcAmount = (amountUSD / btcPrice).toFixed(8)
  
  // Check minimum amount (546 satoshis)
  const satoshis = Math.round(parseFloat(btcAmount) * 100000000)
  if (satoshis < 546) {
    throw new Error(`Amount too small. Minimum: 546 satoshis`)
  }
  
  // Generate BIP21 URI
  const uri = `bitcoin:${address}?amount=${btcAmount}&label=BitAgora%20POS&message=Purchase%20Payment`
  
  return { 
    uri, 
    btcAmount, 
    btcPrice,
    satoshis 
  }
}
```

---

## 💎 **USDT Ethereum Integration**

### **Contract Specifications**
- **Contract Address**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **Decimals**: 6 (⚠️ NOT 18 like ETH)
- **Network**: Ethereum Mainnet
- **Gas Limit**: ~65,000 for USDT transfers

### **Required Dependencies**
```bash
npm install ethers web3 ethereum-address
npm install @ethereumjs/util
```

### **EIP-681 URI Implementation**
```typescript
// USDT Ethereum Payment URI (EIP-681 Standard)
import { isAddress } from 'ethers/lib/utils'

const generateUSDTEthereumQR = async (address: string, amountUSD: number) => {
  // Validate Ethereum address
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address')
  }
  
  // USDT has 6 decimals (microUSDT)
  const usdtMicroUnits = Math.round(amountUSD * 1000000)
  
  // EIP-681 simplified format (better wallet compatibility)
  const uri = `ethereum:${address}?value=0&gas=65000&gasPrice=20000000000&contractAddress=0xdac17f958d2ee523a2206206994597c13d831ec7&uint256=${usdtMicroUnits}`
  
  // Alternative simplified format (most compatible)
  const simpleUri = `ethereum:${address}?amount=${usdtMicroUnits}&token=0xdac17f958d2ee523a2206206994597c13d831ec7`
  
  return { 
    uri: simpleUri, 
    usdtAmount: amountUSD.toFixed(6),
    microUnits: usdtMicroUnits
  }
}
```

---

## 🔥 **USDT Tron Integration**

### **Contract Specifications**
- **Contract Address**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- **Decimals**: 6
- **Network**: Tron Mainnet
- **Energy Cost**: ~13,000 for USDT transfers

### **Required Dependencies**
```bash
npm install tronweb tron-format-address
npm install bs58check
```

### **Tron URI Implementation**
```typescript
// USDT Tron Payment URI
import TronWeb from 'tronweb'

const generateUSDTTronQR = async (address: string, amountUSD: number) => {
  // Validate Tron address
  if (!TronWeb.isAddress(address)) {
    throw new Error('Invalid Tron address')
  }
  
  // USDT-TRC20 has 6 decimals
  const usdtMicroUnits = Math.round(amountUSD * 1000000)
  
  // Tron payment URI format
  const uri = `tron:${address}?amount=${usdtMicroUnits}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimals=6`
  
  return { 
    uri, 
    usdtAmount: amountUSD.toFixed(6),
    microUnits: usdtMicroUnits
  }
}
```

---

## 🛠 **Unified Implementation Architecture**

### **Master QR Generation Service**
```typescript
// lib/crypto-payment-service.ts
export interface CryptoPaymentResult {
  uri: string
  amount: string
  exchangeRate?: number
  expires?: number
  method: string
}

export const generateCryptoPaymentQR = async (
  method: 'lightning' | 'bitcoin' | 'usdt-eth' | 'usdt-tron',
  amountUSD: number,
  walletAddresses: WalletConfig
): Promise<CryptoPaymentResult> => {
  
  switch (method) {
    case 'lightning':
      const lnResult = await generateLightningInvoice(amountUSD, 'BitAgora POS Payment')
      return {
        uri: lnResult.invoice,
        amount: `${lnResult.amount} sat`,
        expires: lnResult.expires,
        method: 'lightning'
      }
      
    case 'bitcoin':
      const btcResult = await generateBitcoinQR(walletAddresses.bitcoin, amountUSD)
      return {
        uri: btcResult.uri,
        amount: `${btcResult.btcAmount} BTC`,
        exchangeRate: btcResult.btcPrice,
        method: 'bitcoin'
      }
      
    case 'usdt-eth':
      const ethResult = await generateUSDTEthereumQR(walletAddresses.ethereum, amountUSD)
      return {
        uri: ethResult.uri,
        amount: `${ethResult.usdtAmount} USDT`,
        method: 'usdt-eth'
      }
      
    case 'usdt-tron':
      const tronResult = await generateUSDTTronQR(walletAddresses.tron, amountUSD)
      return {
        uri: tronResult.uri,
        amount: `${tronResult.usdtAmount} USDT`,
        method: 'usdt-tron'
      }
      
    default:
      throw new Error(`Unsupported payment method: ${method}`)
  }
}
```

### **Required Environment Variables**
```bash
# Lightning Network
LNBITS_URL=https://legend.lnbits.com
LNBITS_API_KEY=your_admin_key

# Exchange Rate APIs
COINGECKO_API_KEY=optional_for_higher_limits
COINAPI_KEY=fallback_for_production

# Merchant Wallet Addresses
BITCOIN_WALLET_ADDRESS=bc1q...
ETHEREUM_WALLET_ADDRESS=0x...
TRON_WALLET_ADDRESS=T...

# Development/Production Mode
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK_CRYPTO=false
```

### **Complete Package.json Dependencies**
```json
{
  "dependencies": {
    "qrcode": "^1.5.4",
    "bolt11": "^1.4.1",
    "bitcoinjs-lib": "^6.1.7",
    "multicoin-address-validator": "^0.5.26",
    "ethers": "^5.7.2",
    "tronweb": "^5.3.0",
    "bech32": "^2.0.0",
    "bs58check": "^3.0.1"
  }
}
```

---

## 📚 **Standards & Specifications**

### **URI Format Standards**
- **Bitcoin BIP21**: `https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki`
- **Ethereum EIP-681**: `https://eips.ethereum.org/EIPS/eip-681`
- **Lightning BOLT11**: `https://github.com/lightning/bolts/blob/master/11-payment-encoding.md`
- **Tron Developer Docs**: `https://developers.tron.network/`

### **Testing Networks**
- **Bitcoin Testnet**: Use testnet addresses for development
- **Lightning Testnet**: Polar for local Lightning development  
- **Ethereum Testnets**: Goerli, Sepolia for testing
- **Tron Testnet**: Nile testnet for development

### **Wallet Compatibility Testing**
- **Bitcoin**: Electrum, Blue Wallet, Sparrow
- **Lightning**: Phoenix, Wallet of Satoshi, Zeus
- **Ethereum**: MetaMask, Trust Wallet, Coinbase Wallet
- **Tron**: TronLink, Trust Wallet, Klever

---

## 🔧 **Implementation Priority**

### **Phase 1.1 (Immediate)**
1. ✅ Fix current QR generation bugs (completed)
2. 🔄 Implement real exchange rate API integration
3. 🔄 Add proper Bitcoin BIP21 URI generation
4. 🔄 Fix USDT base units formatting

### **Phase 1.2 (Next Sprint)**
1. 🔄 Integrate LNBits for dynamic Lightning invoices
2. 🔄 Add wallet address validation
3. 🔄 Implement error handling and fallbacks
4. 🔄 Add QR code expiration handling

### **Phase 1.3 (Testing & Polish)**
1. 🔄 Test with real crypto wallets
2. 🔄 Add payment status monitoring
3. 🔄 Implement retry mechanisms
4. 🔄 Production environment setup

This guide provides the complete roadmap for implementing proper crypto payment QR generation in BitAgora POS. 