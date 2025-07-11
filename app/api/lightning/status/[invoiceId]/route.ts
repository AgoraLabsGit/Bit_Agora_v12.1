import { NextRequest, NextResponse } from 'next/server'
import { StrikeLightningService } from '@/lib/strike-lightning-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params

    // Validate input
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Checking Strike invoice status: ${invoiceId}`)

    // Check Strike invoice status
    const statusResult = await StrikeLightningService.checkInvoiceStatus(invoiceId)

    if (statusResult.state === 'ERROR') {
      return NextResponse.json(
        { 
          error: statusResult.error || 'Failed to check invoice status',
          state: 'ERROR'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      state: statusResult.state,
      invoice: statusResult.invoice,
      checked: new Date().toISOString()
    })

  } catch (error) {
    console.error('Strike invoice status check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      state: 'ERROR'
    }, { status: 500 })
  }
} 