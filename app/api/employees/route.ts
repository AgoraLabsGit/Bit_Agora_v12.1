import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'
import { z } from 'zod'

const EmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must be numeric'),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  status: z.enum(['active', 'inactive']).default('active'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  // Security permissions
  permissions: z.object({
    canProcessRefunds: z.boolean().default(false),
    canModifyProducts: z.boolean().default(false),
    canManageEmployees: z.boolean().default(false),
    canViewReports: z.boolean().default(false),
    canModifySettings: z.boolean().default(false),
    canAccessAdmin: z.boolean().default(false)
  }).optional(),
})

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    
    // Get existing employees
    let employees = mockAPI.getEmployees(merchantId)
    
    // If no employees exist, initialize test employees for development
    if (employees.length === 0) {
      const initResult = await mockAPI.initializeTestEmployees(merchantId)
      if (initResult.success && initResult.data) {
        employees = initResult.data
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: employees,
      message: `Retrieved ${employees.length} employees`
    })
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST /api/employees
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const employeeData = await request.json()
    
    const result = await mockAPI.createEmployee(merchantId, employeeData)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in employees POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const validation = EmployeeSchema.partial().safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid employee data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // For now, we'll simulate updating an employee by getting current employees and updating
    const employees = mockAPI.getEmployees(merchantId)
    const index = employees.findIndex(e => e.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    const updatedEmployee = {
      ...employees[index],
      ...validation.data,
      updatedAt: new Date().toISOString()
    }

    employees[index] = updatedEmployee
    localStorage.setItem(`bitagora_employees_${merchantId}`, JSON.stringify(employees))

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully'
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    )
  }
} 