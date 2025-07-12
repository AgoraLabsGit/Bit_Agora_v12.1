import { NextRequest, NextResponse } from 'next/server'
import { stopMonitoring } from '@/TestLab/bitcoin-monitoring/api/bitcoin-monitor'

/**
 * POST /api/testlab/bitcoin/stop/[address]
 * Test Lab Bitcoin Monitoring - Stop monitoring a Bitcoin address
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  return stopMonitoring(request, params.address)
} 