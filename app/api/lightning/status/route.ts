// Lightning Payment Status API
// Provides real-time Lightning payment status monitoring via LNBits

import { NextRequest, NextResponse } from 'next/server'
import { lightningService } from '@/lib/lightning-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentHash = searchParams.get('payment_hash')

    if (!paymentHash) {
      return NextResponse.json(
        { success: false, error: 'Payment hash required' },
        { status: 400 }
      )
    }

    // Check if Lightning service is configured
    if (!lightningService.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Lightning service not configured' },
        { status: 503 }
      )
    }

    // Get payment status from LNBits
    const status = await lightningService.checkInvoiceStatus(paymentHash)
    
    return NextResponse.json({
      success: true,
      data: {
        payment_hash: paymentHash,
        paid: status.paid,
        settled_at: status.settled_at,
        amount_paid: status.amount_paid,
        checking_id: status.checking_id,
        timestamp: Date.now()
      }
    })

  } catch (error) {
    console.error('Lightning status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Status check failed' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_hash, action } = body

    if (!payment_hash) {
      return NextResponse.json(
        { success: false, error: 'Payment hash required' },
        { status: 400 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'check':
        const status = await lightningService.checkInvoiceStatus(payment_hash)
        return NextResponse.json({
          success: true,
          data: status
        })

      case 'cleanup':
        lightningService.cleanupExpiredInvoices()
        return NextResponse.json({
          success: true,
          message: 'Expired invoices cleaned up'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Lightning status action error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Action failed' 
      },
      { status: 500 }
    )
  }
} 