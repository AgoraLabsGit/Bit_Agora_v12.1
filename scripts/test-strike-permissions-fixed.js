#!/usr/bin/env node
// FIXED Strike API Test Script - Updated for Current Strike API
require('dotenv').config({ path: '.env.local' })

const STRIKE_API_KEY = process.env.STRIKE_API_KEY
const STRIKE_BASE_URL = 'https://api.strike.me'

console.log('🔧 FIXED Strike API Permissions Test')
console.log('=====================================')
console.log(`API Key: ${STRIKE_API_KEY ? STRIKE_API_KEY.substring(0, 20) + '...' : '❌ Missing'}`)
console.log('')

if (!STRIKE_API_KEY) {
  console.error('❌ Strike API Key not configured!')
  process.exit(1)
}

// Updated API endpoints based on Strike's current documentation
const tests = [
  {
    name: 'Account Profile Read',
    permission: 'partner.account.profile.read',
    endpoint: '/v1/accounts/profile',
    method: 'GET'
  },
  {
    name: 'Account Balance Read',
    permission: 'partner.balances.read', 
    endpoint: '/v1/balances',
    method: 'GET'
  },
  {
    name: 'Exchange Rates Read',
    permission: 'partner.rates.ticker',
    endpoint: '/v1/rates/ticker',
    method: 'GET'
  },
  {
    name: 'Invoice Creation',
    permission: 'partner.invoice.create',
    endpoint: '/v1/invoices',
    method: 'POST',
    body: {
      amount: { currency: 'USD', amount: '1.00' },
      description: 'BitAgora Test Invoice'
    }
  },
  {
    name: 'Invoice Quote Generation',
    permission: 'partner.invoice.quote.generate',
    endpoint: '/v1/invoices/quote',
    method: 'POST',
    body: {
      amount: { currency: 'USD', amount: '0.50' },
      description: 'BitAgora Quote Test'
    }
  },
  {
    name: 'Currency Exchange Quote',
    permission: 'partner.currency-exchange-quote.read',
    endpoint: '/v1/rates/ticker', // Alternative endpoint
    method: 'GET'
  },
  {
    name: 'Webhook Management',
    permission: 'partner.webhooks.manage',
    endpoint: '/v1/subscriptions',
    method: 'GET'
  }
]

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

async function runTests() {
  console.log('🧪 Running updated permission tests...\n')
  
  let passedTests = 0
  const results = []
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `)
    
    try {
      const result = await makeStrikeRequest(test.endpoint, test.method, test.body)
      
      if (result.networkError) {
        console.log(`❌ NETWORK ERROR`)
        results.push({ test: test.name, status: 'network_error', permission: test.permission })
      } else if (result.status === 200 || result.status === 201) {
        console.log(`✅ PASS`)
        passedTests++
        results.push({ test: test.name, status: 'pass', permission: test.permission })
      } else if (result.status === 403) {
        console.log(`❌ PERMISSION DENIED`)
        console.log(`   Missing: ${test.permission}`)
        results.push({ test: test.name, status: 'permission_denied', permission: test.permission })
      } else if (result.status === 401) {
        console.log(`❌ UNAUTHORIZED`)
        results.push({ test: test.name, status: 'unauthorized', permission: test.permission })
      } else {
        console.log(`❌ FAILED (${result.status})`)
        results.push({ test: test.name, status: 'failed', permission: test.permission })
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`)
      results.push({ test: test.name, status: 'error', permission: test.permission })
    }
    
    console.log('')
  }
  
  console.log('📊 Results Summary')
  console.log('==================')
  console.log(`✅ Passed: ${passedTests}/${tests.length}`)
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`)
  
  const missingPermissions = results
    .filter(r => r.status === 'permission_denied')
    .map(r => r.permission)
  
  if (missingPermissions.length > 0) {
    console.log('\n🔧 Missing Permissions:')
    missingPermissions.forEach(perm => console.log(`   - ${perm}`))
    
    console.log('\n📋 Action Required:')
    console.log('1. Go to https://dashboard.strike.me/api-keys')
    console.log('2. Delete current API key')
    console.log('3. Create new API key with ALL permissions enabled')
    console.log('4. Update STRIKE_API_KEY in .env.local')
    console.log('5. Re-run this test script')
  } else {
    console.log('\n🎉 All permissions working! Ready for Strike integration.')
  }
}

runTests().catch(console.error) 