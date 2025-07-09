import { NextRequest, NextResponse } from 'next/server'
import { StrikeLightningService } from '@/lib/strike-lightning-service'

export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json()

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Generate Lightning invoice using Strike API
    const invoiceData = await StrikeLightningService.generateLightningQR(
      amount,
      description || `BitAgora POS Payment - $${amount.toFixed(2)}`
    )

    return NextResponse.json({
      success: true,
      data: invoiceData
    })

  } catch (error) {
    console.error('Lightning invoice generation failed:', error)
    
    // Return fallback response for development
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        invoiceId: `fallback-${Date.now()}`,
        amount: 0,
        qrContent: 'lnbc1500n1pjhm9j7pp5zq0q6p8p9p0p1p2p3p4p5p6p7p8p9p0p1p2p3p4p5p6p7p8p9p0p1',
        expires: new Date(Date.now() + 15 * 60 * 1000),
        paymentRequest: 'lnbc1500n1pjhm9j7pp5zq0q6p8p9p0p1p2p3p4p5p6p7p8p9p0p1p2p3p4p5p6p7p8p9p0p1'
      }
    }, { status: 500 })
  }
} 