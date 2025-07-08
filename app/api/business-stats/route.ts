import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/business-stats
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const stats = mockAPI.getEnhancedBusinessStats(merchantId)
    
    return NextResponse.json({ 
      success: true, 
      data: stats,
      message: 'Business stats retrieved successfully'
    })
  } catch (error) {
    console.error('Error in business-stats GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/business-stats
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    
    // Update business setup data
    const updatedStats = mockAPI.updateBusinessSetup(merchantId, body)
    
    return NextResponse.json({ 
      success: true, 
      data: updatedStats,
      message: 'Business setup updated successfully'
    })
  } catch (error) {
    console.error('Error in business-stats PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 