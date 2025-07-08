import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'

// POST /api/debug/clear-all
export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Debug endpoints are only available in development' },
        { status: 403 }
      )
    }
    
    // Clear all mock data
    mockAPI.clearAllData()
    
    console.log('🗑️ Debug: All data cleared from server storage')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All data cleared successfully',
      clearedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in debug clear-all:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
} 