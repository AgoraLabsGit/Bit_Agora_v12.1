// Tax Calculation Utility for BitAgora POS System
// Based on research of international POS tax calculation best practices
// Supports Argentina, South America, and USA tax requirements

export interface TaxConfiguration {
  enabled: boolean
  defaultRate: number // Primary tax rate (e.g., VAT, Sales Tax)
  secondaryRate?: number // Secondary tax rate (e.g., Service Tax, Municipal Tax)
  taxType: 'VAT' | 'SALES_TAX' | 'GST' | 'IVA' // Tax type based on region
  country: string
  region?: string
  includeTaxInPrice: boolean // Tax-inclusive vs tax-exclusive pricing
  roundingMethod: 'round' | 'ceil' | 'floor'
  taxName: string // Display name for tax (e.g., "VAT", "Sales Tax", "IVA")
  secondaryTaxName?: string
  // New tax display and manual entry options
  showTaxLine: boolean // Whether to show tax as separate line or just total
  allowManualTaxEntry: boolean // Whether to allow manual tax rate entry
  manualTaxRate?: number // Manual tax rate override
  manualTaxName?: string // Manual tax name override
}

export interface TaxCalculationResult {
  subtotal: number
  primaryTax: number
  secondaryTax: number
  totalTax: number
  total: number
  taxRate: number
  secondaryTaxRate: number
  breakdown: {
    primaryTaxName: string
    primaryTaxAmount: number
    secondaryTaxName?: string
    secondaryTaxAmount?: number
  }
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  taxExempt?: boolean
}

// Regional tax configuration presets based on research
export const TAX_PRESETS: Record<string, TaxConfiguration> = {
  // Argentina (IVA - Impuesto al Valor Agregado)
  AR: {
    enabled: true,
    defaultRate: 0.21, // 21% IVA general rate
    taxType: 'IVA',
    country: 'Argentina',
    includeTaxInPrice: true, // Common in Argentina
    roundingMethod: 'round',
    taxName: 'IVA',
    showTaxLine: true, // Show tax breakdown
    allowManualTaxEntry: true, // Allow manual tax entry
  },

  // USA (Sales Tax varies by state)
  US: {
    enabled: true,
    defaultRate: 0.08, // Average US sales tax rate
    taxType: 'SALES_TAX',
    country: 'United States',
    includeTaxInPrice: false, // Tax exclusive in US
    roundingMethod: 'round',
    taxName: 'Sales Tax',
    showTaxLine: true, // Show tax breakdown
    allowManualTaxEntry: true, // Allow manual tax entry
  },

  // Brazil (ICMS + PIS/COFINS)
  BR: {
    enabled: true,
    defaultRate: 0.18, // ICMS average rate
    secondaryRate: 0.0925, // PIS/COFINS combined
    taxType: 'VAT',
    country: 'Brazil',
    includeTaxInPrice: true,
    roundingMethod: 'round',
    taxName: 'ICMS',
    secondaryTaxName: 'PIS/COFINS',
    showTaxLine: true, // Show tax breakdown
    allowManualTaxEntry: true, // Allow manual tax entry
  },

  // Chile (IVA)
  CL: {
    enabled: true,
    defaultRate: 0.19, // 19% IVA
    taxType: 'IVA',
    country: 'Chile',
    includeTaxInPrice: true,
    roundingMethod: 'round',
    taxName: 'IVA',
    showTaxLine: true, // Show tax breakdown
    allowManualTaxEntry: true, // Allow manual tax entry
  },

  // Default/Generic configuration
  DEFAULT: {
    enabled: false,
    defaultRate: 0.10,
    taxType: 'VAT',
    country: 'Generic',
    includeTaxInPrice: false,
    roundingMethod: 'round',
    taxName: 'Tax',
    showTaxLine: true, // Show tax breakdown
    allowManualTaxEntry: true, // Allow manual tax entry
  },
}

export class TaxCalculator {
  private config: TaxConfiguration

  constructor(config: TaxConfiguration) {
    this.config = config
  }

  /**
   * Calculate tax for a cart of items
   * Based on professional POS tax calculation patterns from research
   */
  calculateCartTax(items: CartItem[]): TaxCalculationResult {
    if (!this.config.enabled) {
      const subtotal = this.calculateSubtotal(items)
      return {
        subtotal,
        primaryTax: 0,
        secondaryTax: 0,
        totalTax: 0,
        total: subtotal,
        taxRate: 0,
        secondaryTaxRate: 0,
        breakdown: {
          primaryTaxName: this.config.taxName,
          primaryTaxAmount: 0,
        },
      }
    }

    if (this.config.includeTaxInPrice) {
      return this.calculateTaxInclusive(items)
    } else {
      return this.calculateTaxExclusive(items)
    }
  }

  /**
   * Get effective tax rate (considers manual override)
   */
  private getEffectiveTaxRate(): number {
    if (this.config.allowManualTaxEntry && this.config.manualTaxRate !== undefined) {
      return this.config.manualTaxRate
    }
    return this.config.defaultRate
  }

  /**
   * Get effective tax name (considers manual override)
   */
  private getEffectiveTaxName(): string {
    if (this.config.allowManualTaxEntry && this.config.manualTaxName) {
      return this.config.manualTaxName
    }
    return this.config.taxName
  }

  /**
   * Calculate subtotal (pre-tax amount)
   */
  private calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      if (item.taxExempt) return total
      return total + (item.price * item.quantity)
    }, 0)
  }

  /**
   * Tax-exclusive calculation (US style)
   * Tax is added on top of the listed price
   */
  private calculateTaxExclusive(items: CartItem[]): TaxCalculationResult {
    const subtotal = this.calculateSubtotal(items)
    
    // Calculate primary tax using effective rate
    const effectiveRate = this.getEffectiveTaxRate()
    const primaryTax = this.roundAmount(subtotal * effectiveRate)
    
    // Calculate secondary tax if applicable
    const secondaryTax = this.config.secondaryRate 
      ? this.roundAmount(subtotal * this.config.secondaryRate)
      : 0

    const totalTax = primaryTax + secondaryTax
    const total = subtotal + totalTax

    return {
      subtotal,
      primaryTax,
      secondaryTax,
      totalTax,
      total,
      taxRate: effectiveRate,
      secondaryTaxRate: this.config.secondaryRate || 0,
      breakdown: {
        primaryTaxName: this.getEffectiveTaxName(),
        primaryTaxAmount: primaryTax,
        secondaryTaxName: this.config.secondaryTaxName,
        secondaryTaxAmount: secondaryTax,
      },
    }
  }

  /**
   * Tax-inclusive calculation (Argentina/EU style)
   * Tax is included in the displayed price and extracted
   */
  private calculateTaxInclusive(items: CartItem[]): TaxCalculationResult {
    const totalWithTax = this.calculateSubtotal(items)
    
    // Calculate tax rate multiplier using effective rate
    const effectiveRate = this.getEffectiveTaxRate()
    const totalTaxRate = effectiveRate + (this.config.secondaryRate || 0)
    const taxMultiplier = 1 + totalTaxRate
    
    // Extract pre-tax amount
    const subtotal = this.roundAmount(totalWithTax / taxMultiplier)
    
    // Calculate individual taxes
    const primaryTax = this.roundAmount(subtotal * effectiveRate)
    const secondaryTax = this.config.secondaryRate 
      ? this.roundAmount(subtotal * this.config.secondaryRate)
      : 0

    const totalTax = primaryTax + secondaryTax

    return {
      subtotal,
      primaryTax,
      secondaryTax,
      totalTax,
      total: totalWithTax,
      taxRate: effectiveRate,
      secondaryTaxRate: this.config.secondaryRate || 0,
      breakdown: {
        primaryTaxName: this.getEffectiveTaxName(),
        primaryTaxAmount: primaryTax,
        secondaryTaxName: this.config.secondaryTaxName,
        secondaryTaxAmount: secondaryTax,
      },
    }
  }

  /**
   * Round amount based on configuration
   */
  private roundAmount(amount: number): number {
    switch (this.config.roundingMethod) {
      case 'ceil':
        return Math.ceil(amount * 100) / 100
      case 'floor':
        return Math.floor(amount * 100) / 100
      case 'round':
      default:
        return Math.round(amount * 100) / 100
    }
  }

  /**
   * Get tax configuration
   */
  getConfiguration(): TaxConfiguration {
    return { ...this.config }
  }

  /**
   * Update tax configuration
   */
  updateConfiguration(newConfig: Partial<TaxConfiguration>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

/**
 * Helper function to create a tax calculator with preset configuration
 */
export function createTaxCalculator(countryCode: string, customConfig?: Partial<TaxConfiguration>): TaxCalculator {
  const preset = TAX_PRESETS[countryCode.toUpperCase()] || TAX_PRESETS.DEFAULT
  const config = customConfig ? { ...preset, ...customConfig } : preset
  return new TaxCalculator(config)
}

/**
 * Helper function to format tax amount for display
 */
export function formatTaxAmount(amount: number, currencySymbol: string = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`
}

/**
 * Helper function to get appropriate tax preset for business location
 */
export function getRecommendedTaxPreset(country: string, region?: string): TaxConfiguration {
  const countryCode = country.toUpperCase()
  
  // Special handling for specific regions
  if (countryCode === 'US' && region) {
    // Could add state-specific tax rates here
    const statePresets: Record<string, Partial<TaxConfiguration>> = {
      'CA': { defaultRate: 0.0825, region: 'California' }, // California
      'NY': { defaultRate: 0.08, region: 'New York' }, // New York
      'TX': { defaultRate: 0.0625, region: 'Texas' }, // Texas
      'FL': { defaultRate: 0.06, region: 'Florida' }, // Florida
    }
    
    const stateConfig = statePresets[region.toUpperCase()]
    if (stateConfig) {
      return { ...TAX_PRESETS.US, ...stateConfig }
    }
  }
  
  return TAX_PRESETS[countryCode] || TAX_PRESETS.DEFAULT
} 