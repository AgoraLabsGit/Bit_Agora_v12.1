import { NextRequest, NextResponse } from 'next/server'
import { startMonitoring } from '@/TestLab/bitcoin-monitoring/api/bitcoin-monitor'

/**
 * POST /api/testlab/bitcoin/monitor
 * Test Lab Bitcoin Monitoring - Start monitoring a Bitcoin address
 */
export async function POST(request: NextRequest) {
  return startMonitoring(request)
} 