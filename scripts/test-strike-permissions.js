#!/usr/bin/env node
// Strike API Permissions Verification Script - FIXED VERSION
// This script tests each permission individually to identify what's missing

require('dotenv').config({ path: '.env.local' })

const STRIKE_API_KEY = process.env.STRIKE_API_KEY
const STRIKE_BASE_URL = process.env.STRIKE_BASE_URL || 'https://api.strike.me'
const STRIKE_ENVIRONMENT = process.env.STRIKE_ENVIRONMENT || 'production'

console.log('🔍 BitAgora Strike API Permissions Verification')
console.log('===============================================')
console.log(`Environment: ${STRIKE_ENVIRONMENT}`)
console.log(`Base URL: ${STRIKE_BASE_URL}`)
console.log(`API Key: ${STRIKE_API_KEY ? STRIKE_API_KEY.substring(0, 20) + '...' : '❌ Missing'}`)
console.log('')

if (!STRIKE_API_KEY) {
  console.error('❌ Strike API Key not configured!')
  console.log('Add STRIKE_API_KEY to your .env.local file')
  process.exit(1)
}

// Helper function for API calls with proper error handling
async function makeStrikeRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${STRIKE_BASE_URL}${endpoint}`, options)
    
    let data
    try {
      data = await response.json()
    } catch (e) {
      // If JSON parsing fails, get text
      data = await response.text()
    }
    
    return { response, data, status: response.status }
  } catch (error) {
    return { 
      response: null, 
      data: { error: error.message }, 
      status: 0,
      networkError: true 
    }
  }
}

// Test definitions with correct Strike API endpoints
const tests = [
  {
    name: 'Account Profile Read',
    permission: 'partner.account.profile.read',
    test: async () => {
      return await makeStrikeRequest('/v1/accounts/profile')
    }
  },
  {
    name: 'Account Balance Read', 
    permission: 'partner.balances.read',
    test: async () => {
      return await makeStrikeRequest('/v1/balances')
    }
  },
  {
    name: 'Exchange Rates Read',
    permission: 'partner.rates.ticker',
    test: async () => {
      return await makeStrikeRequest('/v1/rates/ticker')
    }
  },
  {
    name: 'Currency Exchange Quote',
    permission: 'partner.currency-exchange-quote.read',
    test: async () => {
      // Test with BTC to USD quote
      return await makeStrikeRequest('/v1/accounts/profile/currencies/BTC/quotes?amount=0.001&target=USD')
    }
  },
  {
    name: 'Invoice Creation',
    permission: 'partner.invoice.create',
    test: async () => {
      const invoiceData = {
        amount: {
          currency: 'USD',
          amount: '1.00'
        },
        description: 'BitAgora Permission Test - Invoice Creation'
      }
      return await makeStrikeRequest('/v1/invoices', 'POST', invoiceData)
    }
  },
  {
    name: 'Receive Request Creation',
    permission: 'partner.receive-request.create',
    test: async () => {
      const receiveRequestData = {
        amount: {
          currency: 'USD', 
          amount: '0.50'
        },
        description: 'BitAgora Permission Test - Receive Request'
      }
      return await makeStrikeRequest('/v1/accounts/profile/receive', 'POST', receiveRequestData)
    }
  },
  {
    name: 'Lightning Payment Quote',
    permission: 'partner.payment-quote.lightning.create',
    test: async () => {
      // Use a valid testnet Lightning invoice for testing
      const testInvoice = 'lnbc1500n1pjueszpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5vdhkven9v5sxyetpdeessp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs9qrsgq'
      
      const quoteData = {
        invoice: testInvoice,
        amount: {
          currency: 'USD',
          amount: '0.15'
        }
      }
      return await makeStrikeRequest('/v1/payment-quotes/lightning', 'POST', quoteData)
    }
  }
]

// Function to run all tests
async function runPermissionTests() {
  console.log('🧪 Running permission tests...\n')
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `)
    
    try {
      const result = await test.test()
      
      if (result.networkError) {
        console.log(`❌ NETWORK ERROR`)
        console.log(`   Error: ${result.data.error}`)
      } else if (result.status === 200 || result.status === 201) {
        console.log(`✅ PASS`)
        passedTests++
        
        // Show useful data for successful tests
        if (test.name === 'Account Profile Read' && result.data.id) {
          console.log(`   Account ID: ${result.data.id}`)
        }
        if (test.name === 'Account Balance Read' && result.data.length) {
          console.log(`   Balances found: ${result.data.length}`)
        }
        if (test.name === 'Invoice Creation' && result.data.invoiceId) {
          console.log(`   Invoice ID: ${result.data.invoiceId}`)
        }
      } else if (result.status === 403) {
        console.log(`❌ PERMISSION DENIED`)
        console.log(`   Missing permission: ${test.permission}`)
        console.log(`   Response: ${JSON.stringify(result.data)}`)
      } else if (result.status === 401) {
        console.log(`❌ UNAUTHORIZED`)
        console.log(`   Check API key validity`)
        console.log(`   Response: ${JSON.stringify(result.data)}`)
      } else if (result.status === 400) {
        console.log(`⚠️  BAD REQUEST`)
        console.log(`   Request format issue (may still have permission)`)
        console.log(`   Response: ${JSON.stringify(result.data)}`)
      } else {
        console.log(`❌ FAILED (${result.status})`)
        console.log(`   Response: ${JSON.stringify(result.data)}`)
      }
    } catch (error) {
      console.log(`❌ ERROR`)
      console.log(`   ${error.message}`)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('📊 Test Results Summary')
  console.log('======================')
  console.log(`Passed: ${passedTests}/${totalTests}`)
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests < totalTests) {
    console.log('\n🔧 Next Steps:')
    console.log('1. Check Strike API key permissions in dashboard')
    console.log('2. Ensure all required permissions are enabled')
    console.log('3. Verify API key environment (sandbox vs production)')
    console.log('4. Check Strike account verification status')
  } else {
    console.log('\n🎉 All tests passed! Strike integration ready.')
  }
}

// Check environment and run tests
async function main() {
  console.log('🔍 Environment Check')
  console.log('===================')
  
  // Check if using sandbox
  if (STRIKE_ENVIRONMENT === 'sandbox' || STRIKE_BASE_URL.includes('sandbox')) {
    console.log('⚠️  Using SANDBOX environment')
    console.log('   Real money will NOT be processed')
    console.log('   Perfect for testing!')
  } else {
    console.log('🔴 Using PRODUCTION environment')
    console.log('   Real money WILL be processed')
    console.log('   Be careful with test amounts!')
  }
  
  console.log('\n⏱️  Starting tests in 3 seconds...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  await runPermissionTests()
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error.message)
  process.exit(1)
}) 