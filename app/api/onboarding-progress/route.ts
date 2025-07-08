import { NextRequest, NextResponse } from 'next/server'
import { paymentAPI, getCurrentMerchantId } from '@/lib/payment-api'

// GET /api/onboarding-progress
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await paymentAPI.getOnboardingProgress(merchantId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/onboarding-progress
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const progress = await request.json()
    
    const result = await paymentAPI.updateOnboardingProgress(merchantId, progress)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 