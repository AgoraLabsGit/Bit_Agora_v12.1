#!/usr/bin/env node

/**
 * BitAgora Lightning Integration Test
 * 
 * Comprehensive test suite for Lightning Network payments via Strike API
 * Tests all integration points: Strike service, QR generation, payment monitoring
 * 
 * @version 1.0.0
 * @author BitAgora Development Team
 */

// Import modules dynamically to handle ES modules
let StrikeLightningService, PaymentMonitoringService, generateCryptoQR, isLightningEnabled, getLightningFeatureStatus

async function loadModules() {
  try {
    // Try to import Strike Lightning Service
    const strikeModule = await import('../lib/strike-lightning-service.js')
    StrikeLightningService = strikeModule.StrikeLightningService
    
    // Try to import Payment Monitoring Service
    const monitoringModule = await import('../lib/payment-monitoring.js')
    PaymentMonitoringService = monitoringModule.PaymentMonitoringService
    
    // Try to import QR Generation
    const qrModule = await import('../lib/payment/qr-generation.js')
    generateCryptoQR = qrModule.generateCryptoQR
    
    // Try to import Feature Flags
    const flagsModule = await import('../lib/feature-flags.js')
    isLightningEnabled = flagsModule.isLightningEnabled
    getLightningFeatureStatus = flagsModule.getLightningFeatureStatus
    
    return true
  } catch (error) {
    console.error('Failed to load modules:', error.message)
    return false
  }
}

// Test configuration
const TEST_AMOUNT = 1.50 // $1.50 USD
const TEST_DESCRIPTION = 'BitAgora Lightning Integration Test'
const TEST_TIMEOUT = 30000 // 30 seconds max per test

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
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
    // Test 1: Environment variables
    const apiKey = process.env.STRIKE_API_KEY
    const environment = process.env.STRIKE_ENVIRONMENT
    
    logTest('Strike API key configured', !!apiKey, apiKey ? `Key: ${apiKey.substring(0, 10)}...` : 'No API key found')
    logTest('Strike environment configured', !!environment, `Environment: ${environment || 'not set'}`)
    
    // Test 2: Configuration validation
    const configValid = StrikeLightningService.validateConfiguration()
    logTest('Strike configuration validation', configValid)
    
    // Test 3: API connection
    const connectionWorking = await StrikeLightningService.testConnection()
    logTest('Strike API connection', connectionWorking)
    
    return configValid && connectionWorking
    
  } catch (error) {
    logTest('Strike configuration error', false, error.message)
    return false
  }
}

/**
 * Test Feature Flags
 */
async function testFeatureFlags() {
  console.log('\n🚩 Testing Feature Flags...')
  
  try {
    // Test 1: Lightning feature enabled
    const lightningEnabled = isLightningEnabled()
    logTest('Lightning payments enabled', lightningEnabled)
    
    // Test 2: Feature status
    const featureStatus = getLightningFeatureStatus()
    logTest('Lightning feature status', featureStatus.ready, JSON.stringify(featureStatus))
    
    // Test 3: Prerequisites
    const hasApiIntegration = featureStatus.apiIntegration
    const hasQrGeneration = featureStatus.qrGeneration
    
    logTest('Strike API integration flag', hasApiIntegration)
    logTest('QR generation flag', hasQrGeneration)
    
    return lightningEnabled && featureStatus.ready
    
  } catch (error) {
    logTest('Feature flags error', false, error.message)
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
    const startTime = Date.now()
    
    const lightningData = await StrikeLightningService.generateLightningQR(
      TEST_AMOUNT,
      TEST_DESCRIPTION
    )
    
    const generationTime = Date.now() - startTime
    
    logTest('Lightning invoice generation', !!lightningData, `Generated in ${generationTime}ms`)
    logTest('Invoice has ID', !!lightningData.invoiceId, `ID: ${lightningData.invoiceId}`)
    logTest('Invoice has QR content', !!lightningData.qrContent, `Length: ${lightningData.qrContent.length}`)
    logTest('Invoice has expiry', !!lightningData.expires, `Expires: ${lightningData.expires}`)
    
    // Test 2: Get exchange rates
    const exchangeRate = await StrikeLightningService.getExchangeRate()
    logTest('Exchange rate retrieval', exchangeRate > 0, `BTC/USD: $${exchangeRate.toLocaleString()}`)
    
    // Test 3: Get balances
    const balances = await StrikeLightningService.getBalances()
    logTest('Balance retrieval', Array.isArray(balances), `Found ${balances.length} currencies`)
    
    // Test 4: Check payment status
    const paymentStatus = await StrikeLightningService.checkPaymentStatus(lightningData.invoiceId)
    logTest('Payment status check', !!paymentStatus, `Status: ${paymentStatus.state}`)
    
    return {
      success: true,
      invoiceData: lightningData,
      exchangeRate,
      balances,
      paymentStatus
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
    // Test 1: Generate Lightning QR
    console.log(`   Generating Lightning QR for $${TEST_AMOUNT}...`)
    const qrResult = await generateCryptoQR('lightning', TEST_AMOUNT)
    
    logTest('QR generation successful', !!qrResult, `Valid: ${qrResult.isValid}`)
    logTest('QR has content', !!qrResult.qrContent, `Length: ${qrResult.qrContent.length}`)
    logTest('QR has address', !!qrResult.address, `Address set: ${!!qrResult.address}`)
    logTest('QR has conversion result', !!qrResult.conversionResult, `Success: ${qrResult.conversionResult?.success}`)
    
    // Test 2: Check for Strike-specific fields
    logTest('QR has invoice ID', !!qrResult.invoiceId, `Invoice ID: ${qrResult.invoiceId}`)
    logTest('QR has expiry', !!qrResult.expires, `Expires: ${qrResult.expires}`)
    
    // Test 3: Validate QR result
    const isValid = qrResult.isValid && !qrResult.error
    logTest('QR validation', isValid, qrResult.error || 'Valid QR generated')
    
    return {
      success: isValid,
      qrResult
    }
    
  } catch (error) {
    logTest('QR generation error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test Payment Monitoring
 */
async function testPaymentMonitoring() {
  console.log('\n👁️ Testing Payment Monitoring...')
  
  try {
    // First generate an invoice to monitor
    const lightningData = await StrikeLightningService.generateLightningQR(
      TEST_AMOUNT,
      'Payment Monitoring Test'
    )
    
    if (!lightningData.invoiceId) {
      logTest('Payment monitoring setup', false, 'No invoice ID generated')
      return { success: false }
    }
    
    logTest('Test invoice generated', true, `Invoice: ${lightningData.invoiceId}`)
    
    // Test 1: Start monitoring (with timeout)
    let monitoringStarted = false
    let statusUpdates = 0
    let monitoringCompleted = false
    
    const monitoringPromise = new Promise((resolve) => {
      PaymentMonitoringService.monitorLightningPayment({
        invoiceId: lightningData.invoiceId,
        onUpdate: (status) => {
          statusUpdates++
          console.log(`   Status update #${statusUpdates}: ${status.state}`)
          
          if (statusUpdates === 1) {
            monitoringStarted = true
          }
          
          // Stop monitoring after a few updates for testing
          if (statusUpdates >= 3) {
            PaymentMonitoringService.cancelMonitoring(lightningData.invoiceId)
            resolve({ statusUpdates, cancelled: true })
          }
        },
        onComplete: (status) => {
          monitoringCompleted = true
          resolve({ statusUpdates, completed: true, finalStatus: status })
        },
        onError: (error) => {
          resolve({ statusUpdates, error: error.message })
        },
        maxAttempts: 10, // Limit attempts for testing
        pollingInterval: 2000 // 2 seconds for faster testing
      })
    })
    
    // Wait for monitoring with timeout
    const monitoringResult = await Promise.race([
      monitoringPromise,
      new Promise(resolve => setTimeout(() => resolve({ timeout: true }), 10000))
    ])
    
    logTest('Payment monitoring started', monitoringStarted, `Started monitoring ${lightningData.invoiceId}`)
    logTest('Status updates received', statusUpdates > 0, `Received ${statusUpdates} updates`)
    logTest('Monitoring cleanup', !monitoringResult.timeout, monitoringResult.timeout ? 'Timeout' : 'Completed')
    
    // Test 2: Check active monitors
    const activeMonitors = PaymentMonitoringService.getActiveMonitors()
    logTest('Active monitors tracking', Array.isArray(activeMonitors), `Active: ${activeMonitors.length}`)
    
    // Test 3: Cancel all monitoring
    PaymentMonitoringService.cancelAllMonitoring()
    const monitorsAfterCancel = PaymentMonitoringService.getActiveMonitors()
    logTest('Monitor cancellation', monitorsAfterCancel.length === 0, `Remaining: ${monitorsAfterCancel.length}`)
    
    return {
      success: true,
      statusUpdates,
      monitoringResult
    }
    
  } catch (error) {
    logTest('Payment monitoring error', false, error.message)
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
      await StrikeLightningService.generateLightningQR(-1, 'Invalid amount test')
      logTest('Invalid amount rejection', false, 'Should have rejected negative amount')
    } catch (error) {
      logTest('Invalid amount rejection', true, `Correctly rejected: ${error.message}`)
    }
    
    // Test 2: Invalid invoice ID
    try {
      await StrikeLightningService.checkPaymentStatus('invalid-invoice-id')
      logTest('Invalid invoice ID handling', false, 'Should have failed with invalid ID')
    } catch (error) {
      logTest('Invalid invoice ID handling', true, `Correctly failed: ${error.message}`)
    }
    
    // Test 3: QR generation fallback
    // Temporarily disable Strike API to test fallback
    const originalApiKey = process.env.STRIKE_API_KEY
    process.env.STRIKE_API_KEY = 'invalid-key'
    
    try {
      const qrResult = await generateCryptoQR('lightning', TEST_AMOUNT)
      const hasFallback = qrResult.qrContent && qrResult.error
      logTest('QR generation fallback', hasFallback, qrResult.error || 'No fallback triggered')
    } finally {
      // Restore original API key
      process.env.STRIKE_API_KEY = originalApiKey
    }
    
    return { success: true }
    
  } catch (error) {
    logTest('Error handling test error', false, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Performance Tests
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...')
  
  try {
    // Test 1: Invoice generation speed
    const invoiceTests = []
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now()
      await StrikeLightningService.generateLightningQR(TEST_AMOUNT, `Performance Test ${i + 1}`)
      const duration = Date.now() - startTime
      invoiceTests.push(duration)
    }
    
    const avgInvoiceTime = invoiceTests.reduce((a, b) => a + b, 0) / invoiceTests.length
    logTest('Invoice generation speed', avgInvoiceTime < 5000, `Average: ${avgInvoiceTime}ms`)
    
    // Test 2: QR generation speed
    const qrTests = []
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now()
      await generateCryptoQR('lightning', TEST_AMOUNT)
      const duration = Date.now() - startTime
      qrTests.push(duration)
    }
    
    const avgQrTime = qrTests.reduce((a, b) => a + b, 0) / qrTests.length
    logTest('QR generation speed', avgQrTime < 6000, `Average: ${avgQrTime}ms`)
    
    // Test 3: Exchange rate caching
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
  console.log('🧪 BitAgora Lightning Integration Test Suite')
  console.log('=' .repeat(50))
  
  const startTime = Date.now()
  
  try {
    // Load modules first
    console.log('📦 Loading Lightning integration modules...')
    const modulesLoaded = await loadModules()
    
    if (!modulesLoaded) {
      console.log('❌ Failed to load required modules. Stopping tests.')
      return
    }
    
    console.log('✅ All modules loaded successfully\n')
    
    // Run all test suites
    const configOk = await testStrikeConfiguration()
    const featuresOk = await testFeatureFlags()
    
    if (!configOk || !featuresOk) {
      console.log('\n❌ Configuration or feature flags failed. Stopping tests.')
      return
    }
    
    await testStrikeLightningService()
    await testQRGeneration()
    await testPaymentMonitoring()
    await testErrorHandling()
    await testPerformance()
    
    // Summary
    const totalTime = Date.now() - startTime
    const successRate = Math.round((testResults.passed / testResults.total) * 100)
    
    console.log('\n' + '=' .repeat(50))
    console.log('📊 Test Results Summary')
    console.log('=' .repeat(50))
    console.log(`✅ Passed: ${testResults.passed}`)
    console.log(`❌ Failed: ${testResults.failed}`)
    console.log(`📊 Total: ${testResults.total}`)
    console.log(`📈 Success Rate: ${successRate}%`)
    console.log(`⏱️ Total Time: ${totalTime}ms`)
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Lightning integration is ready for production.')
      console.log('\n🚀 Next steps:')
      console.log('   1. Test with real Lightning wallet')
      console.log('   2. Verify payment flow in BitAgora POS')
      console.log('   3. Monitor initial transactions')
      console.log('   4. Enable for customer payments')
    } else {
      console.log(`\n⚠️ ${testResults.failed} tests failed. Please review and fix issues before production.`)
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error)
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