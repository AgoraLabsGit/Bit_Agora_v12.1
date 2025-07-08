import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    const result = await mockAPI.authenticateUser(email, password)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 