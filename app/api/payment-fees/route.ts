import { NextRequest, NextResponse } from 'next/server'

// Simple server-side storage simulation
let serverStorage: Record<string, any> = {}

function getStorageKey(type: string, merchantId: string): string {
  return `bitagora_${type}_${merchantId}`
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 16)
}

function getServerSideData(key: string): any {
  return serverStorage[key] || null
}

function setServerSideData(key: string, data: any): void {
  serverStorage[key] = data
}

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/payment-fees
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const key = getStorageKey('payment_fees', merchantId)
    const stored = getServerSideData(key)
    
    if (!stored) {
      // Return default fees
      const defaultFees = [
        {
          id: generateId(),
          merchantId,
          paymentMethod: 'cash',
          percentageFee: 0,
          fixedFee: 0,
          currency: 'USD',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          merchantId,
          paymentMethod: 'card',
          percentageFee: 2.9,
          fixedFee: 0.30,
          currency: 'USD',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
      
      setServerSideData(key, defaultFees)
      return NextResponse.json({ success: true, data: defaultFees })
    }
    
    return NextResponse.json({ success: true, data: stored })
  } catch (error) {
    console.error('Error in payment-fees GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/payment-fees
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const fees = await request.json()
    const key = getStorageKey('payment_fees', merchantId)
    
    // Update all fees with timestamps
    const updatedFees = fees.map((fee: any) => ({
      ...fee,
      merchantId,
      id: fee.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: fee.createdAt || new Date().toISOString(),
    }))
    
    setServerSideData(key, updatedFees)
    
    return NextResponse.json({ 
      success: true, 
      data: updatedFees,
      message: 'Payment fees saved successfully'
    })
  } catch (error) {
    console.error('Error in payment-fees PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 