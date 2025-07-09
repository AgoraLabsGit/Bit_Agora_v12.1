#!/usr/bin/env node
// Lightning Integration Test Script
// Tests LNBits connectivity and invoice generation

const { lightningService } = require('../lib/lightning-service')

async function testLightningIntegration() {
  console.log('🚀 Starting Lightning Integration Tests...\n')

  // Test 1: Service Configuration
  console.log('1️⃣ Testing Service Configuration...')
  const isConfigured = lightningService.isConfigured()
  console.log(`Configuration Status: ${isConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`)
  
  if (!isConfigured) {
    console.log('⚠️  Required environment variables:')
    console.log('   - LNBITS_URL (current:', process.env.LNBITS_URL || 'NOT SET', ')')
    console.log('   - LNBITS_API_KEY (current:', process.env.LNBITS_API_KEY ? 'SET' : 'NOT SET', ')')
    console.log('   - LNBITS_WALLET_ID (current:', process.env.LNBITS_WALLET_ID || 'NOT SET', ')')
    console.log('\nPlease configure these variables before proceeding.\n')
    return
  }

  // Test 2: Health Check
  console.log('\n2️⃣ Testing LNBits Connection...')
  try {
    const health = await lightningService.healthCheck()
    console.log(`Health Check: ${health.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`)
    if (!health.healthy) {
      console.log(`Error: ${health.error}`)
      return
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return
  }

  // Test 3: Invoice Generation
  console.log('\n3️⃣ Testing Invoice Generation...')
  try {
    const testAmount = 1.50 // $1.50 USD
    console.log(`Generating invoice for $${testAmount} USD...`)
    
    const invoice = await lightningService.generateInvoice(
      testAmount,
      'BitAgora Test Payment',
      5 // 5 minute expiry for testing
    )

    console.log('✅ Invoice generated successfully!')
    console.log(`Payment Request: ${invoice.payment_request.substring(0, 50)}...`)
    console.log(`Payment Hash: ${invoice.payment_hash}`)
    console.log(`Amount (sats): ${invoice.amount_satoshis}`)
    console.log(`Amount (USD): $${invoice.amount_usd}`)
    console.log(`Expires: ${new Date(invoice.expires_at).toLocaleString()}`)

    // Test 4: Invoice Validation
    console.log('\n4️⃣ Testing Invoice Validation...')
    const validation = await lightningService.validateInvoice(invoice.payment_request)
    console.log(`Validation: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`)
    if (validation.isValid) {
      console.log(`Amount: ${validation.amount} sats`)
      console.log(`Description: ${validation.description}`)
      console.log(`Expired: ${validation.isExpired ? 'YES' : 'NO'}`)
    } else {
      console.log(`Error: ${validation.error}`)
    }

    // Test 5: Payment Status Check
    console.log('\n5️⃣ Testing Payment Status Check...')
    const status = await lightningService.checkInvoiceStatus(invoice.payment_hash)
    console.log(`Payment Status: ${status.paid ? '✅ PAID' : '⏳ PENDING'}`)
    console.log(`Checking ID: ${status.checking_id}`)

    // Test 6: QR Code Generation
    console.log('\n6️⃣ Testing QR Code Generation...')
    try {
      const { generateCryptoQR } = require('../lib/payment/qr-generation')
      const qrData = await generateCryptoQR('lightning', testAmount, {}, {
        validateAddresses: true,
        includeFallbacks: false
      })

      if (qrData && qrData.isValid) {
        console.log('✅ QR generation successful!')
        console.log(`QR Content: ${qrData.qrContent.substring(0, 50)}...`)
        console.log(`Crypto Amount: ${qrData.cryptoAmount} sats`)
        console.log(`Exchange Rate: ${qrData.exchangeRate.toFixed(2)} sats/USD`)
      } else {
        console.log('❌ QR generation failed:', qrData?.error || 'Unknown error')
      }
    } catch (qrError) {
      console.log('❌ QR generation error:', qrError.message)
    }

    console.log('\n🎉 All tests completed!')
    console.log('\n📱 Test this invoice with a Lightning wallet:')
    console.log(`Invoice: ${invoice.payment_request}`)
    console.log('\n💡 Recommended wallets for testing:')
    console.log('   - Phoenix Wallet (mobile)')
    console.log('   - Blue Wallet (mobile)')
    console.log('   - Alby (browser extension)')
    console.log('   - Zeus (mobile)')

  } catch (error) {
    console.error('❌ Invoice generation failed:', error.message)
  }
}

// Utility function to decode Lightning invoice
async function decodeLightningInvoice(invoice) {
  console.log('\n🔍 Decoding Lightning Invoice...')
  try {
    const bolt11 = require('bolt11')
    const decoded = bolt11.decode(invoice)
    
    console.log('✅ Invoice decoded successfully!')
    console.log(`Network: ${decoded.network?.bech32 || 'bitcoin'}`)
    console.log(`Amount: ${decoded.satoshis || 0} sats`)
    console.log(`Description: ${decoded.tags?.find(t => t.tagName === 'description')?.data || 'No description'}`)
    console.log(`Expiry: ${decoded.timeExpireDate ? new Date(decoded.timeExpireDate * 1000).toLocaleString() : 'No expiry'}`)
    console.log(`Payment Hash: ${decoded.tags?.find(t => t.tagName === 'payment_hash')?.data || 'Not found'}`)
    
    return decoded
  } catch (error) {
    console.error('❌ Invoice decoding failed:', error.message)
    return null
  }
}

// Run tests if called directly
if (require.main === module) {
  testLightningIntegration().catch(console.error)
}

module.exports = {
  testLightningIntegration,
  decodeLightningInvoice
} 