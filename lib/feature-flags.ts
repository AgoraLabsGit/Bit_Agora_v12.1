// BitAgora Feature Management System
// Allows archiving/restoring features without losing development progress

export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  archived: boolean
  category: 'payment' | 'ui' | 'admin' | 'pos' | 'analytics'
  developmentStatus: 'completed' | 'in-progress' | 'experimental' | 'deprecated'
  dependencies?: string[]
  archiveReason?: string
  archiveDate?: string
  lastModified: string
  version: string
}

// Core feature definitions
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Payment Method Features
  LIGHTNING_PAYMENTS: {
    key: 'LIGHTNING_PAYMENTS',
    name: 'Lightning Network Payments',
    description: 'Enable Lightning Network payment processing via Strike API',
    enabled: false, // Currently archived until Strike API setup
    archived: true,
    category: 'payment',
    developmentStatus: 'in-progress',
    archiveReason: 'Waiting for Strike API integration completion',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.2.0'
  },
  
  CREDIT_CARD_PAYMENTS: {
    key: 'CREDIT_CARD_PAYMENTS',
    name: 'Credit/Debit Card Payments',
    description: 'Enable credit and debit card processing via Stripe',
    enabled: false, // Archive until Stripe integration ready
    archived: true,
    category: 'payment',
    developmentStatus: 'experimental',
    archiveReason: 'Phase 3 feature - focus on QR payments first',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  STRIPE_TERMINAL_NFC: {
    key: 'STRIPE_TERMINAL_NFC',
    name: 'Mobile NFC Terminal',
    description: 'Turn merchant phone into NFC payment terminal',
    enabled: false,
    archived: true,
    category: 'payment',
    developmentStatus: 'experimental',
    dependencies: ['CREDIT_CARD_PAYMENTS'],
    archiveReason: 'Requires Stripe Terminal SDK integration',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  MERCADO_PAGO_INTEGRATION: {
    key: 'MERCADO_PAGO_INTEGRATION',
    name: 'Mercado Pago QR Payments',
    description: 'Enable LATAM payments via Mercado Pago API',
    enabled: false,
    archived: true,
    category: 'payment',
    developmentStatus: 'experimental',
    archiveReason: 'MVP 2 feature - implement after Lightning fix',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  // UI/UX Features
  ADVANCED_PRODUCT_SEARCH: {
    key: 'ADVANCED_PRODUCT_SEARCH',
    name: 'Advanced Product Search',
    description: 'Enhanced product search with filters and categories',
    enabled: true,
    archived: false,
    category: 'pos',
    developmentStatus: 'completed',
    lastModified: '2025-01-11',
    version: '1.1.0'
  },
  
  INVENTORY_INDICATORS: {
    key: 'INVENTORY_INDICATORS',
    name: 'Visual Inventory Indicators',
    description: 'Red/orange indicators for 86\'d and low stock items',
    enabled: false,
    archived: true,
    category: 'pos',
    developmentStatus: 'in-progress',
    archiveReason: 'Focus on payment improvements first',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  RECEIPT_PRINTER_INTEGRATION: {
    key: 'RECEIPT_PRINTER_INTEGRATION',
    name: 'Physical Receipt Printing',
    description: 'Integration with thermal receipt printers',
    enabled: false,
    archived: true,
    category: 'pos',
    developmentStatus: 'experimental',
    archiveReason: 'Optional hardware feature - implement after core payments',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  // Admin Features
  EMPLOYEE_SCHEDULING: {
    key: 'EMPLOYEE_SCHEDULING',
    name: 'Employee Scheduling System',
    description: 'Schedule management and time tracking for employees',
    enabled: false,
    archived: true,
    category: 'admin',
    developmentStatus: 'experimental',
    archiveReason: 'Advanced admin feature - implement after core POS complete',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  ADVANCED_ANALYTICS: {
    key: 'ADVANCED_ANALYTICS',
    name: 'Advanced Analytics Dashboard',
    description: 'Enhanced analytics with charts and detailed reporting',
    enabled: false,
    archived: true,
    category: 'analytics',
    developmentStatus: 'experimental',
    archiveReason: 'Phase 4 feature - basic analytics sufficient for MVP',
    archiveDate: '2025-01-11',
    lastModified: '2025-01-11',
    version: '1.0.0'
  },
  
  // Core Features (Always Enabled)
  BITCOIN_PAYMENTS: {
    key: 'BITCOIN_PAYMENTS',
    name: 'Bitcoin Payments',
    description: 'On-chain Bitcoin payment processing',
    enabled: true,
    archived: false,
    category: 'payment',
    developmentStatus: 'completed',
    lastModified: '2025-01-11',
    version: '1.1.0'
  },
  
  USDT_PAYMENTS: {
    key: 'USDT_PAYMENTS',
    name: 'USDT Stablecoin Payments',
    description: 'USDT payments on Ethereum and Tron networks',
    enabled: true,
    archived: false,
    category: 'payment',
    developmentStatus: 'completed',
    lastModified: '2025-01-11',
    version: '1.1.0'
  },
  
  CASH_PAYMENTS: {
    key: 'CASH_PAYMENTS',
    name: 'Cash Payment Processing',
    description: 'Manual cash payment entry and change calculation',
    enabled: true,
    archived: false,
    category: 'payment',
    developmentStatus: 'completed',
    lastModified: '2025-01-11',
    version: '1.1.0'
  },
  
  CUSTOM_QR_UPLOAD: {
    key: 'CUSTOM_QR_UPLOAD',
    name: 'Custom QR Code Upload',
    description: 'Allow merchants to upload QR codes from any payment provider',
    enabled: true,
    archived: false,
    category: 'payment',
    developmentStatus: 'completed',
    lastModified: '2025-01-11',
    version: '1.1.0'
  }
}

// Feature flag service
class FeatureFlagService {
  /**
   * Check if a feature is enabled and not archived
   */
  static isEnabled(featureKey: string): boolean {
    const feature = FEATURE_FLAGS[featureKey]
    if (!feature) {
      console.warn(`Feature flag not found: ${featureKey}`)
      return false
    }
    return feature.enabled && !feature.archived
  }
  
  /**
   * Check if a feature exists but is archived
   */
  static isArchived(featureKey: string): boolean {
    const feature = FEATURE_FLAGS[featureKey]
    return feature ? feature.archived : false
  }
  
  /**
   * Get feature information
   */
  static getFeature(featureKey: string): FeatureFlag | null {
    return FEATURE_FLAGS[featureKey] || null
  }
  
  /**
   * Get all features by category
   */
  static getFeaturesByCategory(category: string): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS).filter(feature => feature.category === category)
  }
  
  /**
   * Get all archived features
   */
  static getArchivedFeatures(): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS).filter(feature => feature.archived)
  }
  
  /**
   * Get enabled features
   */
  static getEnabledFeatures(): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS).filter(feature => feature.enabled && !feature.archived)
  }
  
  /**
   * Archive a feature (disable and mark as archived)
   */
  static archiveFeature(featureKey: string, reason: string): void {
    const feature = FEATURE_FLAGS[featureKey]
    if (feature) {
      feature.enabled = false
      feature.archived = true
      feature.archiveReason = reason
      feature.archiveDate = new Date().toISOString().split('T')[0]
      feature.lastModified = new Date().toISOString().split('T')[0]
      console.log(`🗄️ Feature archived: ${feature.name} - ${reason}`)
    }
  }
  
  /**
   * Restore a feature from archive
   */
  static restoreFeature(featureKey: string): void {
    const feature = FEATURE_FLAGS[featureKey]
    if (feature) {
      feature.enabled = true
      feature.archived = false
      feature.archiveReason = undefined
      feature.archiveDate = undefined
      feature.lastModified = new Date().toISOString().split('T')[0]
      console.log(`🚀 Feature restored: ${feature.name}`)
    }
  }
  
  /**
   * Toggle a feature on/off (if not archived)
   */
  static toggleFeature(featureKey: string): boolean {
    const feature = FEATURE_FLAGS[featureKey]
    if (feature && !feature.archived) {
      feature.enabled = !feature.enabled
      feature.lastModified = new Date().toISOString().split('T')[0]
      console.log(`🔄 Feature toggled: ${feature.name} - ${feature.enabled ? 'enabled' : 'disabled'}`)
      return feature.enabled
    }
    return false
  }
  
  /**
   * Check feature dependencies
   */
  static checkDependencies(featureKey: string): boolean {
    const feature = FEATURE_FLAGS[featureKey]
    if (!feature || !feature.dependencies) return true
    
    return feature.dependencies.every(depKey => this.isEnabled(depKey))
  }
  
  /**
   * Get features that depend on a given feature
   */
  static getDependentFeatures(featureKey: string): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS).filter(feature => 
      feature.dependencies?.includes(featureKey)
    )
  }
}

export default FeatureFlagService

// Utility hook for React components
export const useFeatureFlag = (featureKey: string) => {
  return {
    isEnabled: FeatureFlagService.isEnabled(featureKey),
    isArchived: FeatureFlagService.isArchived(featureKey),
    feature: FeatureFlagService.getFeature(featureKey),
    checkDependencies: () => FeatureFlagService.checkDependencies(featureKey)
  }
}

// Environment-based feature overrides
export const getEnvironmentFeatures = () => {
  const envFeatures: Partial<Record<string, boolean>> = {}
  
  // Allow environment variable overrides
  Object.keys(FEATURE_FLAGS).forEach(key => {
    const envKey = `NEXT_PUBLIC_FEATURE_${key}`
    const envValue = process.env[envKey]
    if (envValue !== undefined) {
      envFeatures[key] = envValue === 'true'
    }
  })
  
  return envFeatures
} 