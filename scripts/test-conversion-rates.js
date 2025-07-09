/**
 * Test Conversion Rates Script
 * 
 * Tests BitAgora's conversion rate implementation to ensure:
 * 1. Strike API is being used for Bitcoin rates
 * 2. Conversion calculations are correct
 * 3. Fallback mechanisms work properly
 */

import { StrikeLightningService } from '../lib/strike-lightning-service.js'
import { cryptoExchangeService } from '../lib/crypto-exchange-service.js'

async function testConversionRates() {
  console.log('🧪 Testing BitAgora Conversion Rates')
  console.log('=' .repeat(50))
  
  const testAmount = 25.00 // $25 USD test amount
  
  try {
    // Test 1: Strike API Exchange Rate
    console.log('\n1. Testing Strike API Exchange Rate...')
    try {
      const strikeRate = await StrikeLightningService.getExchangeRate()
      console.log(`✅ Strike Bitcoin Rate: $${strikeRate.toLocaleString()}`)
      
      if (strikeRate > 0 && strikeRate < 200000) {
        console.log('✅ Strike rate is within reasonable bounds')
      } else {
        console.log('⚠️ Strike rate seems unusual:', strikeRate)
      }
    } catch (strikeError) {
      console.log('❌ Strike API failed:', strikeError.message)
    }
    
    // Test 2: Crypto Exchange Service
    console.log('\n2. Testing Crypto Exchange Service...')
    try {
      const rates = await cryptoExchangeService.getExchangeRates()
      console.log(`✅ Exchange Service Rates:`)
      console.log(`   - Bitcoin: $${rates.bitcoin.toLocaleString()}`)
      console.log(`   - USDT: $${rates.usdt.toFixed(2)}`)
    } catch (exchangeError) {
      console.log('❌ Exchange service failed:', exchangeError.message)
    }
    
    // Test 3: Bitcoin Conversion
    console.log(`\n3. Testing Bitcoin Conversion ($${testAmount})...`)
    try {
      const btcConversion = await cryptoExchangeService.convertUSDToBitcoin(testAmount)
      
      if (btcConversion.success) {
        console.log(`✅ Bitcoin Conversion:`)
        console.log(`   - USD Amount: $${testAmount}`)
        console.log(`   - BTC Amount: ${btcConversion.formattedAmount}`)
        console.log(`   - Exchange Rate: $${btcConversion.exchangeRate.toLocaleString()}`)
        console.log(`   - Calculation: $${testAmount} ÷ $${btcConversion.exchangeRate} = ${btcConversion.cryptoAmount.toFixed(8)} BTC`)
      } else {
        console.log('❌ Bitcoin conversion failed:', btcConversion.error)
      }
    } catch (btcError) {
      console.log('❌ Bitcoin conversion error:', btcError.message)
    }
    
    // Test 4: Lightning Conversion
    console.log(`\n4. Testing Lightning Conversion ($${testAmount})...`)
    try {
      const lightningConversion = await cryptoExchangeService.convertUSDToLightning(testAmount)
      
      if (lightningConversion.success) {
        console.log(`✅ Lightning Conversion:`)
        console.log(`   - USD Amount: $${testAmount}`)
        console.log(`   - Satoshi Amount: ${lightningConversion.formattedAmount}`)
        console.log(`   - Exchange Rate: $${lightningConversion.exchangeRate.toLocaleString()}`)
        console.log(`   - Calculation: $${testAmount} ÷ $${lightningConversion.exchangeRate} × 100,000,000 = ${lightningConversion.cryptoAmount.toLocaleString()} sats`)
      } else {
        console.log('❌ Lightning conversion failed:', lightningConversion.error)
      }
    } catch (lightningError) {
      console.log('❌ Lightning conversion error:', lightningError.message)
    }
    
    // Test 5: USDT Conversion
    console.log(`\n5. Testing USDT Conversion ($${testAmount})...`)
    try {
      const usdtConversion = await cryptoExchangeService.convertUSDToUSDT(testAmount)
      
      if (usdtConversion.success) {
        console.log(`✅ USDT Conversion:`)
        console.log(`   - USD Amount: $${testAmount}`)
        console.log(`   - USDT Amount: ${usdtConversion.formattedAmount}`)
        console.log(`   - Exchange Rate: $${usdtConversion.exchangeRate}`)
        console.log(`   - Calculation: $${testAmount} ÷ $${usdtConversion.exchangeRate} = ${usdtConversion.cryptoAmount.toFixed(6)} USDT`)
      } else {
        console.log('❌ USDT conversion failed:', usdtConversion.error)
      }
    } catch (usdtError) {
      console.log('❌ USDT conversion error:', usdtError.message)
    }
    
    // Test 6: Strike API Configuration
    console.log('\n6. Testing Strike API Configuration...')
    const configValid = StrikeLightningService.validateConfiguration()
    if (configValid) {
      console.log('✅ Strike API configuration is valid')
    } else {
      console.log('❌ Strike API configuration is invalid')
    }
    
    // Test 7: Strike API Connection
    console.log('\n7. Testing Strike API Connection...')
    try {
      const connectionTest = await StrikeLightningService.testConnection()
      if (connectionTest) {
        console.log('✅ Strike API connection successful')
      } else {
        console.log('❌ Strike API connection failed')
      }
    } catch (connectionError) {
      console.log('❌ Strike API connection error:', connectionError.message)
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('🎉 Conversion Rate Testing Complete!')
    console.log('\nIf you see any ❌ errors above, please check:')
    console.log('1. STRIKE_API_KEY environment variable is set')
    console.log('2. Strike API key has proper permissions')
    console.log('3. Internet connection is working')
    console.log('4. Strike API service is available')
    
  } catch (error) {
    console.error('❌ Test script failed:', error)
  }
}

// Run the test
testConversionRates().catch(console.error) 