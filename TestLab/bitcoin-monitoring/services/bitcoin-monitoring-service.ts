/**
 * Bitcoin Monitoring Service
 * Test Lab Development - Isolated from Production
 * 
 * This service monitors Bitcoin addresses for incoming transactions
 * and tracks confirmation status using blockchain APIs.
 */

import {
  BitcoinTransaction,
  BitcoinAddressInfo,
  BitcoinPaymentStatus,
  BitcoinMonitoringConfig,
  BitcoinAPIResponse,
  BitcoinMonitoringResult,
  MempoolTransaction,
  MempoolAddressInfo,
  TestLabBitcoinPayment,
  TestLabBitcoinConfig
} from '../types/bitcoin-monitoring'

export class BitcoinMonitoringService {
  private static instance: BitcoinMonitoringService
  private config: TestLabBitcoinConfig
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map()
  private paymentStatuses: Map<string, BitcoinPaymentStatus> = new Map()

  private constructor(config: TestLabBitcoinConfig) {
    this.config = config
    console.log('🧪 BitcoinMonitoringService initialized in Test Lab mode')
  }

  static getInstance(config?: TestLabBitcoinConfig): BitcoinMonitoringService {
    if (!BitcoinMonitoringService.instance) {
      if (!config) {
        throw new Error('BitcoinMonitoringService requires initial configuration')
      }
      BitcoinMonitoringService.instance = new BitcoinMonitoringService(config)
    }
    return BitcoinMonitoringService.instance
  }

  /**
   * Start monitoring a Bitcoin address for payments
   */
  async startMonitoring(
    address: string,
    expectedAmount: number,
    options: Partial<BitcoinMonitoringConfig> = {}
  ): Promise<BitcoinPaymentStatus> {
    const config = { ...this.config.monitoringConfig, ...options }
    
    console.log(`🔍 Starting Bitcoin monitoring for address: ${address}`)
    console.log(`💰 Expected amount: ${expectedAmount} satoshis`)
    
    // Initialize payment status
    const paymentStatus: BitcoinPaymentStatus = {
      address,
      expectedAmount,
      receivedAmount: 0,
      status: 'pending',
      confirmations: 0,
      targetConfirmations: config.targetConfirmations,
      transactions: [],
      lastChecked: Date.now()
    }

    this.paymentStatuses.set(address, paymentStatus)

    // Start polling
    this.startPolling(address, config)

    return paymentStatus
  }

  /**
   * Stop monitoring a Bitcoin address
   */
  stopMonitoring(address: string): void {
    console.log(`🛑 Stopping Bitcoin monitoring for address: ${address}`)
    
    const timer = this.activeMonitors.get(address)
    if (timer) {
      clearInterval(timer)
      this.activeMonitors.delete(address)
    }
    
    this.paymentStatuses.delete(address)
  }

  /**
   * Get current payment status for an address
   */
  getPaymentStatus(address: string): BitcoinPaymentStatus | null {
    return this.paymentStatuses.get(address) || null
  }

  /**
   * Check Bitcoin address for transactions (one-time check)
   */
  async checkAddress(address: string): Promise<BitcoinAddressInfo> {
    console.log(`🔍 Checking Bitcoin address: ${address}`)
    
    try {
      if (this.config.mockMode) {
        return this.getMockAddressInfo(address)
      }

      switch (this.config.monitoringConfig.blockchainApi) {
        case 'mempool':
          return await this.checkAddressMempool(address)
        case 'blockcypher':
          return await this.checkAddressBlockCypher(address)
        case 'blockchair':
          return await this.checkAddressBlockchair(address)
        default:
          throw new Error(`Unsupported blockchain API: ${this.config.monitoringConfig.blockchainApi}`)
      }
    } catch (error) {
      console.error('❌ Error checking Bitcoin address:', error)
      throw error
    }
  }

  /**
   * Start polling for address updates
   */
  private startPolling(address: string, config: BitcoinMonitoringConfig): void {
    const timer = setInterval(async () => {
      try {
        const result = await this.updatePaymentStatus(address)
        if (result.updated) {
          console.log(`📊 Bitcoin payment status updated for ${address}:`, result.status.status)
          
          // Check if monitoring should stop
          if (['confirmed', 'failed'].includes(result.status.status)) {
            console.log(`✅ Bitcoin monitoring completed for ${address}`)
            this.stopMonitoring(address)
          }
        }
      } catch (error) {
        console.error(`❌ Error updating Bitcoin payment status for ${address}:`, error)
      }
    }, config.pollInterval)

    this.activeMonitors.set(address, timer)

    // Set timeout to stop monitoring after specified time
    setTimeout(() => {
      if (this.activeMonitors.has(address)) {
        console.log(`⏰ Bitcoin monitoring timeout for ${address}`)
        const status = this.paymentStatuses.get(address)
        if (status && status.status === 'pending') {
          status.status = 'failed'
          status.lastChecked = Date.now()
        }
        this.stopMonitoring(address)
      }
    }, config.timeout)
  }

  /**
   * Update payment status for an address
   */
  private async updatePaymentStatus(address: string): Promise<BitcoinMonitoringResult> {
    const currentStatus = this.paymentStatuses.get(address)
    if (!currentStatus) {
      throw new Error(`No payment status found for address: ${address}`)
    }

    try {
      const addressInfo = await this.checkAddress(address)
      const previousStatus = currentStatus.status
      
      // Update transaction list
      currentStatus.transactions = addressInfo.transactions
      currentStatus.lastChecked = Date.now()
      
      // Calculate received amount
      const receivedAmount = addressInfo.transactions.reduce((sum, tx) => sum + tx.amount, 0)
      currentStatus.receivedAmount = receivedAmount
      
      // Determine payment status
      if (receivedAmount === 0) {
        currentStatus.status = 'pending'
        currentStatus.confirmations = 0
      } else if (receivedAmount < currentStatus.expectedAmount) {
        currentStatus.status = 'underpaid'
        currentStatus.confirmations = Math.max(...addressInfo.transactions.map(tx => tx.confirmations))
      } else if (receivedAmount > currentStatus.expectedAmount) {
        currentStatus.status = 'overpaid'
        currentStatus.confirmations = Math.max(...addressInfo.transactions.map(tx => tx.confirmations))
      } else {
        // Exact amount received
        const maxConfirmations = Math.max(...addressInfo.transactions.map(tx => tx.confirmations))
        currentStatus.confirmations = maxConfirmations
        
        if (maxConfirmations === 0) {
          currentStatus.status = 'unconfirmed'
        } else if (maxConfirmations < currentStatus.targetConfirmations) {
          currentStatus.status = 'confirming'
        } else {
          currentStatus.status = 'confirmed'
          currentStatus.completedAt = Date.now()
        }
      }
      
      const updated = previousStatus !== currentStatus.status
      
      return {
        status: currentStatus,
        updated,
      }
    } catch (error) {
      console.error('❌ Error updating payment status:', error)
      return {
        status: currentStatus,
        updated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check address using Mempool.space API
   */
  private async checkAddressMempool(address: string): Promise<BitcoinAddressInfo> {
    const network = this.config.useTestnet ? 'testnet' : 'mainnet'
    const baseUrl = network === 'testnet' ? 'https://mempool.space/testnet/api' : 'https://mempool.space/api'
    
    try {
      // Get address info
      const addressResponse = await fetch(`${baseUrl}/address/${address}`)
      if (!addressResponse.ok) {
        throw new Error(`Failed to fetch address info: ${addressResponse.status}`)
      }
      const addressData: MempoolAddressInfo = await addressResponse.json()
      
      // Get address transactions
      const txResponse = await fetch(`${baseUrl}/address/${address}/txs`)
      if (!txResponse.ok) {
        throw new Error(`Failed to fetch transactions: ${txResponse.status}`)
      }
      const txData: MempoolTransaction[] = await txResponse.json()
      
      // Convert to our format
      const transactions: BitcoinTransaction[] = txData
        .filter(tx => tx.vout.some(vout => vout.scriptpubkey_address === address))
        .map(tx => {
          const relevantVout = tx.vout.find(vout => vout.scriptpubkey_address === address)!
          return {
            txid: tx.txid,
            address,
            amount: relevantVout.value,
            confirmations: tx.status.confirmed ? 1 : 0, // Simplified - would need current block height for accurate count
            blockHeight: tx.status.block_height,
            blockHash: tx.status.block_hash,
            timestamp: tx.status.block_time || Date.now() / 1000,
            vout: tx.vout.indexOf(relevantVout)
          }
        })
      
      return {
        address,
        balance: addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum,
        totalReceived: addressData.chain_stats.funded_txo_sum,
        totalSent: addressData.chain_stats.spent_txo_sum,
        unconfirmedBalance: addressData.mempool_stats.funded_txo_sum - addressData.mempool_stats.spent_txo_sum,
        transactions
      }
    } catch (error) {
      console.error('❌ Mempool API error:', error)
      throw error
    }
  }

  /**
   * Check address using BlockCypher API
   */
  private async checkAddressBlockCypher(address: string): Promise<BitcoinAddressInfo> {
    const network = this.config.useTestnet ? 'test3' : 'main'
    const baseUrl = `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}`
    
    try {
      const response = await fetch(baseUrl)
      if (!response.ok) {
        throw new Error(`BlockCypher API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Convert to our format
      const transactions: BitcoinTransaction[] = (data.txrefs || []).map((tx: any) => ({
        txid: tx.tx_hash,
        address,
        amount: tx.value,
        confirmations: tx.confirmations || 0,
        blockHeight: tx.block_height,
        timestamp: new Date(tx.confirmed).getTime() / 1000,
        vout: tx.tx_output_n
      }))
      
      return {
        address,
        balance: data.balance || 0,
        totalReceived: data.total_received || 0,
        totalSent: data.total_sent || 0,
        unconfirmedBalance: data.unconfirmed_balance || 0,
        transactions
      }
    } catch (error) {
      console.error('❌ BlockCypher API error:', error)
      throw error
    }
  }

  /**
   * Check address using Blockchair API
   */
  private async checkAddressBlockchair(address: string): Promise<BitcoinAddressInfo> {
    const network = this.config.useTestnet ? 'bitcoin/testnet' : 'bitcoin'
    const baseUrl = `https://api.blockchair.com/${network}/dashboards/address/${address}`
    
    try {
      const response = await fetch(baseUrl)
      if (!response.ok) {
        throw new Error(`Blockchair API error: ${response.status}`)
      }
      
      const data = await response.json()
      const addressData = data.data[address]
      
      // Convert transactions to our format
      const transactions: BitcoinTransaction[] = Object.entries(data.data || {})
        .filter(([txid, tx]: [string, any]) => tx.outputs)
        .flatMap(([txid, tx]: [string, any]) => 
          tx.outputs
            .filter((output: any) => output.recipient === address)
            .map((output: any) => ({
              txid,
              address,
              amount: output.value,
              confirmations: tx.transaction.block_id ? 1 : 0, // Simplified
              blockHeight: tx.transaction.block_id,
              timestamp: new Date(tx.transaction.time).getTime() / 1000,
              vout: output.index
            }))
        )
      
      return {
        address,
        balance: addressData.address.balance || 0,
        totalReceived: addressData.address.received || 0,
        totalSent: addressData.address.spent || 0,
        unconfirmedBalance: addressData.address.balance_usd || 0,
        transactions
      }
    } catch (error) {
      console.error('❌ Blockchair API error:', error)
      throw error
    }
  }

  /**
   * Get mock address info for testing
   */
  private getMockAddressInfo(address: string): BitcoinAddressInfo {
    console.log('🧪 Using mock Bitcoin address data')
    
    // Simulate different scenarios based on address
    const mockTransactions: BitcoinTransaction[] = [
      {
        txid: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        address,
        amount: 50000, // 0.0005 BTC
        confirmations: 1,
        blockHeight: 800000,
        timestamp: Date.now() / 1000,
        vout: 0
      }
    ]
    
    return {
      address,
      balance: 50000,
      totalReceived: 50000,
      totalSent: 0,
      unconfirmedBalance: 0,
      transactions: mockTransactions
    }
  }
}

// Default Test Lab configuration
export const DEFAULT_TESTLAB_CONFIG: TestLabBitcoinConfig = {
  useTestnet: true,
  mockMode: false,
  apiEndpoint: 'https://mempool.space/testnet/api',
  monitoringConfig: {
    targetConfirmations: 1,
    pollInterval: 30000, // 30 seconds
    maxRetries: 3,
    timeout: 1800000, // 30 minutes
    blockchainApi: 'mempool',
    network: 'testnet'
  }
} 