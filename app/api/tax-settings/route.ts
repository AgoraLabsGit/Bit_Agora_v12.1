import { NextRequest, NextResponse } from 'next/server'
import { mockAPI } from '@/lib/mock-api'
import { TaxConfiguration, TAX_PRESETS, getRecommendedTaxPreset } from '@/lib/tax-calculation'
import { z } from 'zod'

function getCurrentMerchantId(): string {
  return 'dev-merchant-001' // Default for development
}

// Zod validation schema for tax configuration
const TaxConfigurationSchema = z.object({
  enabled: z.boolean(),
  defaultRate: z.number().min(0).max(1),
  secondaryRate: z.number().min(0).max(1).optional(),
  taxType: z.enum(['VAT', 'SALES_TAX', 'GST', 'IVA']),
  country: z.string(),
  region: z.string().optional(),
  includeTaxInPrice: z.boolean(),
  roundingMethod: z.enum(['round', 'ceil', 'floor']),
  taxName: z.string(),
  secondaryTaxName: z.string().optional(),
  // New tax display and manual entry options
  showTaxLine: z.boolean(),
  allowManualTaxEntry: z.boolean(),
  manualTaxRate: z.number().min(0).max(1).optional(),
  manualTaxName: z.string().optional(),
})

// GET /api/tax-settings
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const taxSettings = mockAPI.getTaxSettings(merchantId)
    
    return NextResponse.json({ 
      success: true, 
      data: taxSettings,
      message: 'Tax settings retrieved successfully'
    })
  } catch (error) {
    console.error('Error in tax-settings GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/tax-settings
export async function PUT(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    
    // Validate tax configuration
    const validation = TaxConfigurationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid tax configuration',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const result = await mockAPI.updateTaxSettings(merchantId, validation.data)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating tax settings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tax-settings/preset
export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const body = await request.json()
    const { country, region } = body
    
    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country is required' },
        { status: 400 }
      )
    }

    // Get recommended tax preset for the country/region
    const preset = getRecommendedTaxPreset(country, region)
    
    // Update tax settings with the preset
    const result = await mockAPI.updateTaxSettings(merchantId, preset)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Tax settings updated with ${country} preset`
    })
  } catch (error) {
    console.error('Error applying tax preset:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 