/**
 * Bitcoin Payment Monitoring Types
 * Test Lab Development - Isolated from Production
 */

export interface BitcoinTransaction {
  txid: string
  address: string
  amount: number // in satoshis
  confirmations: number
  blockHeight?: number
  blockHash?: string
  timestamp: number
  vout: number // output index
}

export interface BitcoinAddressInfo {
  address: string
  balance: number // in satoshis
  totalReceived: number // in satoshis
  totalSent: number // in satoshis
  unconfirmedBalance: number // in satoshis
  transactions: BitcoinTransaction[]
}

export interface BitcoinPaymentStatus {
  address: string
  expectedAmount: number // in satoshis
  receivedAmount: number // in satoshis
  status: 'pending' | 'unconfirmed' | 'confirming' | 'confirmed' | 'overpaid' | 'underpaid' | 'failed'
  confirmations: number
  targetConfirmations: number
  transactions: BitcoinTransaction[]
  lastChecked: number
  completedAt?: number
}

export interface BitcoinMonitoringConfig {
  targetConfirmations: number // Default: 1 for small amounts, 6 for large amounts
  pollInterval: number // Default: 30 seconds
  maxRetries: number // Default: 3
  timeout: number // Default: 30 minutes
  blockchainApi: 'mempool' | 'blockcypher' | 'blockchair' | 'custom'
  network: 'mainnet' | 'testnet'
}

export interface BitcoinAPIResponse {
  success: boolean
  data?: any
  error?: string
  rateLimitRemaining?: number
  rateLimitReset?: number
}

export interface BitcoinMonitoringResult {
  status: BitcoinPaymentStatus
  updated: boolean
  error?: string
}

export interface BitcoinPaymentEvent {
  type: 'payment_received' | 'confirmation_update' | 'payment_confirmed' | 'payment_failed'
  address: string
  transaction?: BitcoinTransaction
  status: BitcoinPaymentStatus
  timestamp: number
}

// Mempool.space API types
export interface MempoolTransaction {
  txid: string
  version: number
  locktime: number
  vin: Array<{
    txid: string
    vout: number
    prevout: {
      scriptpubkey: string
      scriptpubkey_asm: string
      scriptpubkey_type: string
      scriptpubkey_address: string
      value: number
    }
  }>
  vout: Array<{
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address: string
    value: number
  }>
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
}

export interface MempoolAddressInfo {
  address: string
  chain_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
}

// Test Lab specific types
export interface TestLabBitcoinPayment {
  id: string
  address: string
  expectedAmount: number
  usdAmount: number
  exchangeRate: number
  status: BitcoinPaymentStatus
  createdAt: number
  completedAt?: number
  testNotes?: string
}

export interface TestLabBitcoinConfig {
  useTestnet: boolean
  mockMode: boolean
  apiEndpoint: string
  apiKey?: string
  webhookUrl?: string
  monitoringConfig: BitcoinMonitoringConfig
} 