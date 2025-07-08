import { NextRequest, NextResponse } from 'next/server'
import { PaymentSettingsDatabase } from '@/lib/payment-api'

// Use the unified payment settings system
const paymentDB = new PaymentSettingsDatabase()

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/payment-settings
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await paymentDB.getPaymentSettings(merchantId)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in payment-settings GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/payment-settings
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const settings = await request.json()
    
    const result = await paymentDB.savePaymentSettings(merchantId, settings)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in payment-settings PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 