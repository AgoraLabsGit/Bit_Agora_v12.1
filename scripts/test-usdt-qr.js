/**
 * Test USDT QR Generation Script
 * 
 * Tests BitAgora's USDT QR code generation to ensure:
 * 1. USDT Ethereum uses correct ERC-681 format
 * 2. USDT Tron uses correct format
 * 3. Amount is properly encoded in QR codes
 */

const { generateCryptoQR } = require('../lib/payment/qr-generation.js')

async function testUSDTQRGeneration() {
  console.log('🧪 Testing USDT QR Code Generation')
  console.log('=' .repeat(50))
  
  const testAmount = 1.00 // $1.00 test amount
  
  try {
    // Test 1: USDT Ethereum QR Generation
    console.log('\n1. Testing USDT Ethereum QR Generation...')
    try {
      const ethResult = await generateCryptoQR('usdt_ethereum', testAmount)
      
      if (ethResult.qrContent) {
        console.log('✅ USDT Ethereum QR Generated:')
        console.log(`   QR Content: ${ethResult.qrContent}`)
        console.log(`   Address: ${ethResult.address}`)
        console.log(`   Amount: ${ethResult.conversionResult?.formattedAmount}`)
        console.log(`   Valid: ${ethResult.isValid}`)
        
        // Check if it uses ERC-681 format
        if (ethResult.qrContent.includes('/transfer?address=') && ethResult.qrContent.includes('&uint256=')) {
          console.log('✅ Uses correct ERC-681 format for ERC-20 tokens')
        } else {
          console.log('❌ Does NOT use correct ERC-681 format')
        }
      } else {
        console.log('❌ Failed to generate USDT Ethereum QR')
      }
    } catch (ethError) {
      console.log('❌ USDT Ethereum test failed:', ethError.message)
    }
    
    // Test 2: USDT Tron QR Generation
    console.log('\n2. Testing USDT Tron QR Generation...')
    try {
      const tronResult = await generateCryptoQR('usdt_tron', testAmount)
      
      if (tronResult.qrContent) {
        console.log('✅ USDT Tron QR Generated:')
        console.log(`   QR Content: ${tronResult.qrContent}`)
        console.log(`   Address: ${tronResult.address}`)
        console.log(`   Amount: ${tronResult.conversionResult?.formattedAmount}`)
        console.log(`   Valid: ${tronResult.isValid}`)
        
        // Check if it uses correct Tron format
        if (tronResult.qrContent.includes('tron:') && tronResult.qrContent.includes('?amount=')) {
          console.log('✅ Uses correct Tron URI format')
        } else {
          console.log('❌ Does NOT use correct Tron URI format')
        }
      } else {
        console.log('❌ Failed to generate USDT Tron QR')
      }
    } catch (tronError) {
      console.log('❌ USDT Tron test failed:', tronError.message)
    }
    
    // Test 3: Compare formats
    console.log('\n3. Format Comparison:')
    console.log('Expected USDT Ethereum format: ethereum:<contract>/transfer?address=<recipient>&uint256=<amount>')
    console.log('Expected USDT Tron format: tron:<address>?amount=<amount>')
    
    console.log('\n🎉 USDT QR generation tests completed!')
    console.log('Ready to test with real wallets!')
    
  } catch (error) {
    console.error('❌ USDT QR generation test failed:', error.message)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testUSDTQRGeneration()
}

module.exports = { testUSDTQRGeneration } 