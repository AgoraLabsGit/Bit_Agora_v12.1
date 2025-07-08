import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'
import { z } from 'zod'

const TransactionSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    category: z.string(),
    emoji: z.string(),
  })),
  total: z.number().min(0, 'Total must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'bitcoin', 'lightning', 'usdt-eth', 'usdt-tron', 'qr-code', 'stripe']),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  customerId: z.string().optional(),
  createdAt: z.string().optional(), // Allow updating creation date for admin purposes
  customerAddress: z.string().optional(), // Allow crypto customer addresses
  refundedBy: z.string().optional(), // Track who processed refunds
  refundedAt: z.string().optional(), // Track when refunds were processed
  // Cash payment specific fields
  amountTendered: z.number().optional(), // Amount customer gave
  change: z.number().optional(), // Change returned to customer
})

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/transactions
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const transactions = mockAPI.getTransactions(merchantId)
    
    return NextResponse.json({ 
      success: true, 
      data: transactions,
      message: 'Transactions retrieved successfully'
    })
  } catch (error) {
    console.error('Error in transactions GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const transactionData = await request.json()
    
    // Validate the transaction data
    const validation = TransactionSchema.safeParse(transactionData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid transaction data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }
    
    const result = await mockAPI.createTransaction({
      ...validation.data,
      merchantId
    })
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in transactions POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const validation = TransactionSchema.partial().safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid transaction data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const result = await mockAPI.updateTransaction(merchantId, id, validation.data)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
} 