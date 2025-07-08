import { NextRequest, NextResponse } from 'next/server'
import { PaymentSettingsDatabase } from '@/lib/payment-api'

// Use the unified payment settings system
const paymentDB = new PaymentSettingsDatabase()

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/payment-credentials
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await paymentDB.getPaymentCredentials(merchantId)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in payment-credentials GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/payment-credentials
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const { processorName, ...credentialData } = await request.json()
    
    const result = await paymentDB.savePaymentCredentials(merchantId, processorName, credentialData)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in payment-credentials POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 