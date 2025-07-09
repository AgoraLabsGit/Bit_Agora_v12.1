// /lib/payment/qr-generation.ts
// Shared QR generation utility for inline display and payment processing

export interface QRData {
  address: string
  qrContent: string
  method: string
  amount: number
}

export const generateCryptoQR = async (
  method: string, 
  amount: number, 
  paymentSettings: any
): Promise<QRData | null> => {
  console.log('🔥 Generating QR for:', method)

  let address = ''
  let qrContent = ''
  
  // Fallback addresses for testing when settings are not configured
  const fallbackAddresses = {
    lightning: 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w',
    bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'usdt-eth': '0x742d35Cc6634C0532925a3b8D25c5cf943C1D88B',
    'usdt-tron': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oREqjN'
  }
  
  switch (method) {
    case 'lightning':
      address = paymentSettings?.bitcoinLightningAddress || fallbackAddresses.lightning
      qrContent = address
      break
    case 'bitcoin':
      address = paymentSettings?.bitcoinWalletAddress || fallbackAddresses.bitcoin
      const btcAmount = (amount / 100000000).toFixed(8)
      qrContent = `bitcoin:${address}?amount=${btcAmount}`
      break
    case 'usdt-eth':
      address = paymentSettings?.usdtEthereumWalletAddress || fallbackAddresses['usdt-eth']
      qrContent = `ethereum:${address}?amount=${amount}&token=0xdac17f958d2ee523a2206206994597c13d831ec7`
      break
    case 'usdt-tron':
      address = paymentSettings?.usdtTronWalletAddress || fallbackAddresses['usdt-tron']
      qrContent = `tron:${address}?amount=${amount}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
      break
    default:
      console.error('❌ Unknown payment method:', method)
      return null
  }
  
  if (!address) {
    console.error('❌ No address available for method:', method)
    return null
  }
  
  const result = {
    address,
    qrContent,
    method,
    amount
  }
  
  console.log('✅ QR generated successfully')
  return result
}

export const formatQRForDisplay = (qrData: QRData | null): string => {
  if (!qrData) return ''
  
  switch (qrData.method) {
    case 'lightning':
      return 'Lightning Network Payment'
    case 'bitcoin':
      return 'Bitcoin Payment'
    case 'usdt-eth':
      return 'USDT (Ethereum) Payment'
    case 'usdt-tron':
      return 'USDT (Tron) Payment'
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