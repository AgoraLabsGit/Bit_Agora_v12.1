import { NextRequest, NextResponse } from 'next/server'
import { paymentAPI, getCurrentMerchantId } from '@/lib/payment-api'

// GET /api/qr-providers
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await paymentAPI.getQRProviders(merchantId)
    
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

// POST /api/qr-providers
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const provider = await request.json()
    
    const result = await paymentAPI.saveQRProvider(merchantId, provider)
    
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

// PUT /api/qr-providers
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const qrConfig = await request.json()
    
    const result = await paymentAPI.updateQRConfiguration(merchantId, qrConfig)
    
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

// DELETE /api/qr-providers
export async function DELETE(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('id')
    
    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      )
    }
    
    const result = await paymentAPI.deleteQRProvider(merchantId, providerId)
    
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