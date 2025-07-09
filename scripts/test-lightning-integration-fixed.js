#!/usr/bin/env node

/**
 * BitAgora Lightning Integration Test - Fixed Version
 * 
 * Comprehensive test suite for Lightning Network payments via Strike API
 * Fixed: Import issues, environment detection, network checks, rate limiting
 * 
 * @version 1.1.0
 * @author BitAgora Development Team
 */

require('dotenv').config({ path: '.env.local' })

// Test configuration
const TEST_AMOUNT = 1.50
const TEST_DESCRIPTION = 'BitAgora Lightning Integration Test'
const RATE_LIMIT_DELAY = 1000 // 1 second between API calls

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Module references (will be populated dynamically)
let StrikeLightningService, PaymentMonitoringService, generateCryptoQR

/**
 * Dynamic module imports (fixes CommonJS/ES module issues)
 */
async function importModules() {
  try {
    console.log('📦 Loading modules...')
    
    // Try ES module import first
    try {
      const strikeModule = await import('../lib/strike-lightning-service.js')
      const monitoringModule = await import('../lib/payment-monitoring.js')
      const qrModule = await import('../lib/payment/qr-generation.js')
      
      StrikeLightningService = strikeModule.StrikeLightningService
      PaymentMonitoringService = monitoringModule.PaymentMonitoringService
      generateCryptoQR = qrModule.generateCryptoQR
      
      console.log('✅ ES modules loaded successfully')
      return true
      
    } catch (esError) {
      console.log('⚠️ ES modules failed, trying CommonJS...')
      
      // Fallback to CommonJS
      StrikeLightningService = require('../lib/strike-lightning-service.js').StrikeLightningService
      PaymentMonitoringService = require('../lib/payment-monitoring.js').PaymentMonitoringService
      generateCryptoQR = require('../lib/payment/qr-generation.js').generateCryptoQR
      
      console.log('✅ CommonJS modules loaded successfully')
      return true
    }
    
  } catch (error) {
    console.error('❌ Module import failed:', error.message)
    console.log('\n🔧 To fix module imports:')
    console.log('1. Ensure all Lightning service files exist')
    console.log('2. Check file paths are correct')
    console.log('3. Verify exports are properly defined')
    return false
  }
}

/**
 * Environment detection and validation
 */
function detectEnvironment() {
  console.log('\n🌍 Environment Detection...')
  
  const environment = process.env.STRIKE_ENVIRONMENT || 'sandbox'
  const nodeEnv = process.env.NODE_ENV || 'development'
  const apiKey = process.env.STRIKE_API_KEY
  
  console.log(`   Environment: ${environment}`)
  console.log(`   Node ENV: ${nodeEnv}`)
  console.log(`   API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not configured'}`)
  
  if (environment === 'production') {
    console.log('\n⚠️  WARNING: PRODUCTION ENVIRONMENT DETECTED')
    console.log('   💰 Real money transactions possible!')
    console.log('   🧪 Test amounts will be small ($1.50)')
  } else {
    console.log('\n✅ SANDBOX ENVIRONMENT - Safe for testing')
  }
  
  return { environment, nodeEnv, apiKey: !!apiKey }
}

/**
 * Network connectivity test
 */
async function testNetworkConnectivity() {
  console.log('\n🌐 Testing Network Connectivity...')
  
  try {
    // Test Strike API reachability
    const strikeResponse = await fetch('https://api.strike.me', { 
      method: 'HEAD',
      timeout: 5000 
    })
    logTest('Strike API reachability', strikeResponse.ok, `Status: ${strikeResponse.status}`)
    
    // Test general internet connectivity
    const internetResponse = await fetch('https://google.com', { 
      method: 'HEAD',
      timeout: 5000 
    })
    logTest('Internet connectivity', internetResponse.ok, 'General connectivity working')
    
    return strikeResponse.ok && internetResponse.ok
    
  } catch (error) {
    logTest('Network connectivity', false, error.message)
    return false
  }
}

/**
 * Validate Lightning invoice format
 */
function validateLightningInvoice(qrContent) {
  if (!qrContent) {
    return { valid: false, reason: 'No QR content provided' }
  }
  
  if (!qrContent.startsWith('lnbc')) {
    return { valid: false, reason: 'Invalid Lightning invoice format (should start with lnbc)' }
  }
  
  if (qrContent.length < 50) {
    return { valid: false, reason: 'Lightning invoice too short' }
  }
  
  return { valid: true }
}

/**
 * Rate limiting delay
 */
async function rateLimitDelay() {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
}

/**
 * Test result logging
 */
function logTest(testName, passed, details = '') {
  testResults.total++
  if (passed) {
    testResults.passed++
    console.log(`✅ ${testName}`)
    if (details) console.log(`   ${details}`)
  } else {
    testResults.failed++
    console.log(`❌ ${testName}`)
    if (details) console.log(`   ${details}`)
  }
  testResults.details.push({ testName, passed, details })
}

/**
 * Test Strike API Configuration
 */
async function testStrikeConfiguration() {
  console.log('\n🔧 Testing Strike API Configuration...')
  
  try {
    // Test configuration validation
    const configValid = StrikeLightningService.validateConfiguration()
    logTest('Strike configuration validation', configValid)
    
    if (!configValid) {
      return false
    }
    
    // Test API connection
    await rateLimitDelay()
    const connectionWorking = await StrikeLightningService.testConnection()
    logTest('Strike API connection', connectionWorking)
    
    return connectionWorking
    
  } catch (error) {
    logTest('Strike configuration error', false, error.message)
    return false
  }
}

/**
 * Test Strike Lightning Service
 */
async function testStrikeLightningService() {
  console.log('\n⚡ Testing Strike Lightning Service...')
  
  try {
    // Test 1: Generate Lightning invoice
    console.log(`   Generating Lightning invoice for $${TEST_AMOUNT}...`)
    await rateLimitDelay()
    
    const startTime = Date.now()
    const lightningData = await StrikeLightningService.generateLightningQR(
      TEST_AMOUNT,
      TEST_DESCRIPTION
    )
    const generationTime = Date.now() - startTime
    
    logTest('Lightning invoice generation', !!lightningData, `Generated in ${generationTime}ms`)
    logTest('Invoice has ID', !!lightningData.invoiceId, `ID: ${lightningData.invoiceId}`)
    logTest('Invoice has QR content', !!lightningData.qrContent, `Length: ${lightningData.qrContent.length}`)
    
    // Validate Lightning invoice format
    const validation = validateLightningInvoice(lightningData.qrContent)
    logTest('Lightning invoice format', validation.valid, validation.reason || 'Valid bolt11 format')
    
    // Test 2: Get exchange rates
    await rateLimitDelay()
    const exchangeRate = await StrikeLightningService.getExchangeRate()
    logTest('Exchange rate retrieval', exchangeRate > 0, `BTC/USD: $${exchangeRate.toLocaleString()}`)
    
    // Test 3: Get balances
    await rateLimitDelay()
    const balances = await StrikeLightningService.getBalances()
    logTest('Balance retrieval', Array.isArray(balances), `Found ${balances.length} currencies`)
    
    // Test 4: Check payment status
    if (lightningData.invoiceId) {
      await rateLimitDelay()
      const paymentStatus = await StrikeLightningService.checkPaymentStatus(lightningData.invoiceId)
      logTest('Payment status check', !!paymentStatus, `Status: ${paymentStatus.state}`)
    }
    
    return {
      success: true,
      invoiceData: lightningData,
      exchangeRate,
      balances
    }
    
  } catch (error) {
    logTest('Strike Lightning service error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test QR Generation Integration
 */
async function testQRGeneration() {
  console.log('\n🔲 Testing QR Generation Integration...')
  
  try {
    console.log(`   Generating Lightning QR for $${TEST_AMOUNT}...`)
    await rateLimitDelay()
    
    const qrResult = await generateCryptoQR('lightning', TEST_AMOUNT)
    
    logTest('QR generation successful', !!qrResult, `Valid: ${qrResult.isValid}`)
    logTest('QR has content', !!qrResult.qrContent, `Length: ${qrResult.qrContent.length}`)
    logTest('QR has conversion result', !!qrResult.conversionResult, `Success: ${qrResult.conversionResult?.success}`)
    
    // Validate QR content
    if (qrResult.qrContent) {
      const validation = validateLightningInvoice(qrResult.qrContent)
      logTest('QR content validation', validation.valid, validation.reason || 'Valid Lightning invoice')
    }
    
    return { success: true, qrResult }
    
  } catch (error) {
    logTest('QR generation error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test Error Handling
 */
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...')
  
  try {
    // Test 1: Invalid amount
    try {
      await rateLimitDelay()
      await StrikeLightningService.generateLightningQR(-1, 'Invalid amount test')
      logTest('Invalid amount rejection', false, 'Should have rejected negative amount')
    } catch (error) {
      logTest('Invalid amount rejection', true, `Correctly rejected: ${error.message}`)
    }
    
    // Test 2: Invalid invoice ID
    try {
      await rateLimitDelay()
      await StrikeLightningService.checkPaymentStatus('invalid-invoice-id-123')
      logTest('Invalid invoice ID handling', false, 'Should have failed with invalid ID')
    } catch (error) {
      logTest('Invalid invoice ID handling', true, `Correctly failed: ${error.message}`)
    }
    
    return { success: true }
    
  } catch (error) {
    logTest('Error handling test error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Performance Tests (with rate limiting)
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...')
  
  try {
    // Test invoice generation speed (3 attempts)
    const invoiceTests = []
    for (let i = 0; i < 3; i++) {
      await rateLimitDelay()
      const startTime = Date.now()
      await StrikeLightningService.generateLightningQR(TEST_AMOUNT, `Performance Test ${i + 1}`)
      const duration = Date.now() - startTime
      invoiceTests.push(duration)
      console.log(`   Invoice ${i + 1}: ${duration}ms`)
    }
    
    const avgInvoiceTime = invoiceTests.reduce((a, b) => a + b, 0) / invoiceTests.length
    logTest('Invoice generation speed', avgInvoiceTime < 10000, `Average: ${avgInvoiceTime.toFixed(0)}ms`)
    
    // Test exchange rate caching
    await rateLimitDelay()
    const rateStartTime = Date.now()
    await StrikeLightningService.getExchangeRate()
    const firstRateTime = Date.now() - rateStartTime
    
    const cacheStartTime = Date.now()
    await StrikeLightningService.getExchangeRate()
    const cachedRateTime = Date.now() - cacheStartTime
    
    logTest('Exchange rate caching', cachedRateTime < firstRateTime, `First: ${firstRateTime}ms, Cached: ${cachedRateTime}ms`)
    
    return { success: true }
    
  } catch (error) {
    logTest('Performance test error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main test runner
 */
async function runLightningIntegrationTests() {
  console.log('🧪 BitAgora Lightning Integration Test Suite v1.1')
  console.log('=' .repeat(55))
  
  const startTime = Date.now()
  
  try {
    // Step 1: Environment setup
    const env = detectEnvironment()
    
    // Step 2: Load modules
    const modulesLoaded = await importModules()
    if (!modulesLoaded) {
      console.log('\n❌ Failed to load modules. Stopping tests.')
      process.exit(1)
    }
    
    // Step 3: Network connectivity
    const networkOk = await testNetworkConnectivity()
    if (!networkOk) {
      console.log('\n❌ Network connectivity issues. Check internet connection.')
      process.exit(1)
    }
    
    // Step 4: Strike configuration
    const configOk = await testStrikeConfiguration()
    if (!configOk) {
      console.log('\n❌ Strike configuration failed. Check API key and permissions.')
      process.exit(1)
    }
    
    // Step 5: Core functionality tests
    await testStrikeLightningService()
    await testQRGeneration()
    await testErrorHandling()
    await testPerformance()
    
    // Summary
    const totalTime = Date.now() - startTime
    const successRate = Math.round((testResults.passed / testResults.total) * 100)
    
    console.log('\n' + '=' .repeat(55))
    console.log('📊 Test Results Summary')
    console.log('=' .repeat(55))
    console.log(`✅ Passed: ${testResults.passed}`)
    console.log(`❌ Failed: ${testResults.failed}`)
    console.log(`📊 Total: ${testResults.total}`)
    console.log(`📈 Success Rate: ${successRate}%`)
    console.log(`⏱️ Total Time: ${(totalTime / 1000).toFixed(1)}s`)
    
    // Results interpretation
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT! Lightning integration is production-ready.')
      console.log('\n🚀 Ready for next steps:')
      console.log('   1. Test with real Lightning wallet (Phoenix, Strike app)')
      console.log('   2. Enable Lightning in BitAgora feature flags')
      console.log('   3. Test payment flow in POS interface')
      console.log('   4. Begin beta testing with customers')
    } else if (successRate >= 70) {
      console.log('\n⚠️ GOOD progress, but some issues need attention.')
      console.log('Review failed tests before production deployment.')
    } else {
      console.log('\n❌ SIGNIFICANT issues detected.')
      console.log('Please resolve failed tests before proceeding.')
    }
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error)
    process.exit(1)
  }
}

// Run tests if called directly
if (require.main === module) {
  runLightningIntegrationTests()
}

module.exports = {
  runLightningIntegrationTests,
  testResults
} 