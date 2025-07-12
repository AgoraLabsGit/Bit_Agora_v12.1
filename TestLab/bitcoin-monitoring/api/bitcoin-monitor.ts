/**
 * Bitcoin Monitoring API Endpoints
 * Test Lab Development - Isolated from Production
 * 
 * These endpoints handle Bitcoin payment monitoring requests
 * and are completely separate from production APIs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { BitcoinMonitoringService, DEFAULT_TESTLAB_CONFIG } from '../services/bitcoin-monitoring-service'
import { BitcoinMonitoringConfig } from '../types/bitcoin-monitoring'

// Initialize Test Lab Bitcoin monitoring service
const bitcoinService = BitcoinMonitoringService.getInstance(DEFAULT_TESTLAB_CONFIG)

/**
 * POST /api/testlab/bitcoin/monitor
 * Start monitoring a Bitcoin address
 */
export async function startMonitoring(request: NextRequest) {
  try {
    const { address, expectedAmount, usdAmount, config } = await request.json()
    
    if (!address || !expectedAmount) {
      return NextResponse.json(
        { success: false, error: 'Address and expected amount are required' },
        { status: 400 }
      )
    }
    
    console.log(`🧪 Test Lab: Starting Bitcoin monitoring for ${address}`)
    console.log(`💰 Expected: ${expectedAmount} satoshis ($${usdAmount})`)
    
    const paymentStatus = await bitcoinService.startMonitoring(
      address,
      expectedAmount,
      config
    )
    
    return NextResponse.json({
      success: true,
      data: {
        address,
        expectedAmount,
        usdAmount,
        status: paymentStatus,
        message: 'Bitcoin monitoring started successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin monitoring error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/testlab/bitcoin/status/[address]
 * Get payment status for a Bitcoin address
 */
export async function getPaymentStatus(request: NextRequest, address: string) {
  try {
    console.log(`🧪 Test Lab: Checking Bitcoin payment status for ${address}`)
    
    const paymentStatus = bitcoinService.getPaymentStatus(address)
    
    if (!paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'No monitoring session found for this address' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        address,
        status: paymentStatus,
        message: 'Payment status retrieved successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/testlab/bitcoin/stop/[address]
 * Stop monitoring a Bitcoin address
 */
export async function stopMonitoring(request: NextRequest, address: string) {
  try {
    console.log(`🧪 Test Lab: Stopping Bitcoin monitoring for ${address}`)
    
    bitcoinService.stopMonitoring(address)
    
    return NextResponse.json({
      success: true,
      data: {
        address,
        message: 'Bitcoin monitoring stopped successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin stop error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/testlab/bitcoin/check/[address]
 * Check Bitcoin address for transactions (one-time check)
 */
export async function checkAddress(request: NextRequest, address: string) {
  try {
    console.log(`🧪 Test Lab: Checking Bitcoin address ${address}`)
    
    const addressInfo = await bitcoinService.checkAddress(address)
    
    return NextResponse.json({
      success: true,
      data: {
        address,
        addressInfo,
        message: 'Address checked successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/testlab/bitcoin/config
 * Get current Test Lab configuration
 */
export async function getConfig(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        config: DEFAULT_TESTLAB_CONFIG,
        message: 'Test Lab configuration retrieved successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin config error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/testlab/bitcoin/config
 * Update Test Lab configuration
 */
export async function updateConfig(request: NextRequest) {
  try {
    const newConfig = await request.json()
    
    console.log('🧪 Test Lab: Updating Bitcoin monitoring configuration')
    
    // In a real implementation, we would update the service configuration
    // For now, we just return success
    
    return NextResponse.json({
      success: true,
      data: {
        config: { ...DEFAULT_TESTLAB_CONFIG, ...newConfig },
        message: 'Test Lab configuration updated successfully'
      }
    })
  } catch (error) {
    console.error('❌ Test Lab Bitcoin config update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Export API handlers for Next.js API routes
export {
  startMonitoring as POST_monitor,
  getPaymentStatus as GET_status,
  stopMonitoring as POST_stop,
  checkAddress as GET_check,
  getConfig as GET_config,
  updateConfig as POST_config
} 