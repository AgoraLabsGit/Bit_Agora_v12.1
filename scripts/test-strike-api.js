#!/usr/bin/env node

// Strike API Connection Test Script
// Run this after configuring your Strike API key
// Usage: node scripts/test-strike-api.js

require('dotenv').config({ path: '.env.local' })

const STRIKE_API_KEY = process.env.STRIKE_API_KEY
const STRIKE_BASE_URL = process.env.STRIKE_BASE_URL || 'https://api.strike.me'
const STRIKE_ENVIRONMENT = process.env.STRIKE_ENVIRONMENT || 'sandbox'

console.log('🔥 BitAgora Strike API Connection Test')
console.log('=====================================')
console.log(`Environment: ${STRIKE_ENVIRONMENT}`)
console.log(`Base URL: ${STRIKE_BASE_URL}`)
console.log(`API Key: ${STRIKE_API_KEY ? '✅ Configured' : '❌ Missing'}`)
console.log('')

if (!STRIKE_API_KEY || STRIKE_API_KEY === 'your_strike_api_key_here_from_dashboard') {
  console.error('❌ Strike API Key not configured!')
  console.error('Please update STRIKE_API_KEY in your .env.local file')
  process.exit(1)
}

async function testStrikeAPI() {
  try {
    console.log('🧪 Testing Strike API Connection...')
    
    // Test 1: Account Profile
    console.log('\n1. Testing Account Profile Read...')
    const profileResponse = await fetch(`${STRIKE_BASE_URL}/v1/accounts/profile`, {
      headers: {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Accept': 'application/json'
      }
    })
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json()
      console.log('   ✅ Account Profile: SUCCESS')
      console.log(`   📧 Email: ${profile.email || 'N/A'}`)
      console.log(`   👤 Display Name: ${profile.displayName || 'N/A'}`)
    } else {
      console.log('   ❌ Account Profile: FAILED')
      console.log(`   Status: ${profileResponse.status}`)
      const error = await profileResponse.text()
      console.log(`   Error: ${error}`)
    }
    
    // Test 2: Account Balance
    console.log('\n2. Testing Account Balance Read...')
    const balanceResponse = await fetch(`${STRIKE_BASE_URL}/v1/balances`, {
      headers: {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Accept': 'application/json'
      }
    })
    
    if (balanceResponse.ok) {
      const balances = await balanceResponse.json()
      console.log('   ✅ Account Balance: SUCCESS')
      console.log(`   💰 Available Balances: ${balances.length || 0}`)
      balances.forEach((balance, index) => {
        console.log(`   ${index + 1}. ${balance.currency}: ${balance.amount}`)
      })
    } else {
      console.log('   ❌ Account Balance: FAILED')
      console.log(`   Status: ${balanceResponse.status}`)
    }
    
    // Test 3: Currency Exchange Quote
    console.log('\n3. Testing Currency Exchange Quote...')
    const quoteResponse = await fetch(`${STRIKE_BASE_URL}/v1/rates/ticker`, {
      headers: {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Accept': 'application/json'
      }
    })
    
    if (quoteResponse.ok) {
      const rates = await quoteResponse.json()
      console.log('   ✅ Exchange Rates: SUCCESS')
      const btcRate = rates.find(r => r.sourceCurrency === 'BTC' && r.targetCurrency === 'USD')
      if (btcRate) {
        console.log(`   ₿ BTC/USD Rate: $${btcRate.amount}`)
      }
    } else {
      console.log('   ❌ Exchange Rates: FAILED')
      console.log(`   Status: ${quoteResponse.status}`)
    }
    
    // Test 4: Test Invoice Creation (Small Amount)
    console.log('\n4. Testing Invoice Creation ($1.00)...')
    const invoiceResponse = await fetch(`${STRIKE_BASE_URL}/v1/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: {
          currency: 'USD',
          amount: '1.00'
        },
        description: 'BitAgora POS API Test Invoice'
      })
    })
    
    if (invoiceResponse.ok) {
      const invoice = await invoiceResponse.json()
      console.log('   ✅ Invoice Creation: SUCCESS')
      console.log(`   📄 Invoice ID: ${invoice.invoiceId}`)
      console.log(`   💰 Amount: $${invoice.amount.amount} ${invoice.amount.currency}`)
      console.log(`   ⚡ Lightning: ${invoice.lnInvoice ? 'Available' : 'Not Available'}`)
      
      if (invoice.lnInvoice) {
        console.log(`   🔗 Lightning Invoice: ${invoice.lnInvoice.substring(0, 50)}...`)
      }
    } else {
      console.log('   ❌ Invoice Creation: FAILED')
      console.log(`   Status: ${invoiceResponse.status}`)
      const error = await invoiceResponse.text()
      console.log(`   Error: ${error}`)
    }
    
    console.log('\n🎉 Strike API Test Complete!')
    console.log('=====================================')
    
    if (profileResponse.ok && balanceResponse.ok && quoteResponse.ok && invoiceResponse.ok) {
      console.log('✅ ALL TESTS PASSED - Strike API is ready for BitAgora POS!')
      console.log('🚀 You can now proceed with Lightning payment integration')
    } else {
      console.log('⚠️  Some tests failed - Please check your API key permissions')
      console.log('📋 Required permissions: https://docs.strike.me/api/permissions')
    }
    
  } catch (error) {
    console.error('❌ Strike API Test Failed:', error.message)
    console.error('🔧 Check your internet connection and API key configuration')
  }
}

// Run the test
testStrikeAPI() 