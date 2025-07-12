import { NextRequest, NextResponse } from 'next/server'
import { checkAddress } from '@/TestLab/bitcoin-monitoring/api/bitcoin-monitor'

/**
 * GET /api/testlab/bitcoin/check/[address]
 * Test Lab Bitcoin Monitoring - Check Bitcoin address for transactions (one-time check)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  return checkAddress(request, params.address)
} 