import { NextRequest, NextResponse } from 'next/server'
import { getConfig, updateConfig } from '@/TestLab/bitcoin-monitoring/api/bitcoin-monitor'

/**
 * GET /api/testlab/bitcoin/config
 * Test Lab Bitcoin Monitoring - Get current configuration
 */
export async function GET(request: NextRequest) {
  return getConfig(request)
}

/**
 * POST /api/testlab/bitcoin/config
 * Test Lab Bitcoin Monitoring - Update configuration
 */
export async function POST(request: NextRequest) {
  return updateConfig(request)
} 