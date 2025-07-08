import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const users = mockAPI.getUsers()
    
    return NextResponse.json({ 
      success: true, 
      data: users,
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Error in users GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    const result = await mockAPI.createUser(userData)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in users POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 