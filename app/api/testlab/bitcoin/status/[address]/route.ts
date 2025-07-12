import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/TestLab/bitcoin-monitoring/api/bitcoin-monitor'

/**
 * GET /api/testlab/bitcoin/status/[address]
 * Test Lab Bitcoin Monitoring - Get payment status for a Bitcoin address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  return getPaymentStatus(request, params.address)
} 