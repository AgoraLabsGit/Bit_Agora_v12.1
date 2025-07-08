import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  emoji: z.string().min(1, 'Emoji is required'),
  description: z.string().optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().min(0, 'Stock quantity must be positive').default(0),
})

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const products = mockAPI.getProducts(merchantId)
    
    return NextResponse.json({ 
      success: true, 
      data: products,
      message: 'Products retrieved successfully'
    })
  } catch (error) {
    console.error('Error in products GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const productData = await request.json()
    
    const result = await mockAPI.createProduct(merchantId, productData)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in products POST:', error)
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
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const validation = ProductSchema.partial().safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const result = await mockAPI.updateProduct(merchantId, id, validation.data)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const result = await mockAPI.deleteProduct(merchantId, id)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 