import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'
import { z } from 'zod'

const CartSessionSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    category: z.string(),
    emoji: z.string(),
  })),
  total: z.number().min(0, 'Total must be positive'),
})

function getCurrentMerchantId(): string {
  // In a real app, this would come from authentication
  // For now, use a default merchant ID
  return 'dev-merchant-001'
}

export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    
    if (employeeId) {
      // Get specific employee's cart session
      const result = await mockAPI.getCartSession(merchantId, employeeId)
      
      if (!result.success) {
        return NextResponse.json(result, { status: 404 })
      }
      
      return NextResponse.json(result)
    } else {
      // Get all cart sessions for the merchant
      const sessions = mockAPI.getCartSessions(merchantId)
      
      return NextResponse.json({
        success: true,
        data: sessions,
        message: 'Cart sessions retrieved successfully'
      })
    }
  } catch (error) {
    console.error('Error fetching cart sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    
    const validation = CartSessionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid cart session data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const result = await mockAPI.saveCartSession({
      ...validation.data,
      merchantId
    })
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating cart session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create cart session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    
    const validation = CartSessionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid cart session data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // Update cart session (same as POST, it will replace existing session)
    const result = await mockAPI.saveCartSession({
      ...validation.data,
      merchantId
    })
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating cart session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const result = await mockAPI.clearCartSession(merchantId, employeeId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting cart session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete cart session' },
      { status: 500 }
    )
  }
} 