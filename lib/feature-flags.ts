// BitAgora Feature Flags System
// Manages feature availability across the application
// Version: 2.0.0

export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  archived: boolean
  category: 'pos' | 'admin' | 'security' | 'ui' | 'integration'
  developmentStatus: 'active' | 'beta' | 'deprecated' | 'archived'
  version: string
  lastModified?: Date
  prerequisites?: string[]
  dependencies?: string[]
}

export const featureFlags: FeatureFlag[] = [
  // POS Features
  {
    key: 'INVENTORY_MANAGEMENT',
    name: 'Inventory Management',
    description: 'Enable inventory tracking and management features',
    enabled: true,
    archived: false,
    category: 'pos',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'RECEIPT_PRINTING',
    name: 'Receipt Printing',
    description: 'Enable receipt printing functionality',
    enabled: true,
    archived: false,
    category: 'pos',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'TRANSACTION_HISTORY',
    name: 'Transaction History',
    description: 'Enable transaction history and reporting',
    enabled: true,
    archived: false,
    category: 'pos',
    developmentStatus: 'active',
    version: '1.0.0'
  },

  // Admin Features
  {
    key: 'ADMIN_DASHBOARD',
    name: 'Admin Dashboard',
    description: 'Enable administrative dashboard and controls',
    enabled: true,
    archived: false,
    category: 'admin',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'USER_MANAGEMENT',
    name: 'User Management',
    description: 'Enable user account management and permissions',
    enabled: true,
    archived: false,
    category: 'admin',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'BUSINESS_SETTINGS',
    name: 'Business Settings',
    description: 'Enable business configuration and settings management',
    enabled: true,
    archived: false,
    category: 'admin',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'PAYMENT_SETTINGS',
    name: 'Payment Settings',
    description: 'Enable payment method configuration and settings',
    enabled: true,
    archived: false,
    category: 'admin',
    developmentStatus: 'active',
    version: '1.0.0'
  },

  // Security Features
  {
    key: 'PIN_PROTECTION',
    name: 'PIN Protection',
    description: 'Enable PIN-based access control for sensitive operations',
    enabled: true,
    archived: false,
    category: 'security',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'TWO_FACTOR_AUTH',
    name: 'Two-Factor Authentication',
    description: 'Enable two-factor authentication for enhanced security',
    enabled: false,
    archived: true, // Archived pending security implementation
    category: 'security',
    developmentStatus: 'archived',
    version: '1.0.0'
  },

  // UI Features
  {
    key: 'DARK_MODE',
    name: 'Dark Mode',
    description: 'Enable dark mode theme support',
    enabled: false,
    archived: true, // Archived pending UI theme implementation
    category: 'ui',
    developmentStatus: 'archived',
    version: '1.0.0'
  },
  {
    key: 'MINIMAL_UI',
    name: 'Minimal UI Mode',
    description: 'Enable minimal UI mode with simplified interface',
    enabled: true,
    archived: false,
    category: 'ui',
    developmentStatus: 'active',
    version: '1.0.0'
  },

  // Integration Features
  {
    key: 'STRIKE_API_INTEGRATION',
    name: 'Strike API Integration',
    description: 'Enable Strike API integration for Lightning payments',
    enabled: true, // ✅ ENABLED - Strike API working
    archived: false,
    category: 'integration',
    developmentStatus: 'active',
    version: '1.0.0'
  },
  {
    key: 'CRYPTO_QR_GENERATION',
    name: 'Crypto QR Generation',
    description: 'Enable cryptocurrency QR code generation for payments',
    enabled: true,
    archived: false,
    category: 'integration',
    developmentStatus: 'active',
    version: '1.0.0'
  }
]

// Feature flag utility functions
export const isFeatureEnabled = (key: string): boolean => {
  const feature = featureFlags.find(f => f.key === key)
  return feature ? feature.enabled && !feature.archived : false
}

export const getFeatureFlag = (key: string): FeatureFlag | undefined => {
  return featureFlags.find(f => f.key === key)
}

export const getEnabledFeatures = (): FeatureFlag[] => {
  return featureFlags.filter(f => f.enabled && !f.archived)
}

export const getArchivedFeatures = (): FeatureFlag[] => {
  return featureFlags.filter(f => f.archived)
}

export const getFeaturesByCategory = (category: FeatureFlag['category']): FeatureFlag[] => {
  return featureFlags.filter(f => f.category === category)
}

// Note: Payment methods are now controlled by database settings, not feature flags
// Use PaymentSettingsAPI.getSettings() to check enabled payment methods

export const updateFeatureFlag = (key: string, updates: Partial<FeatureFlag>): boolean => {
  const index = featureFlags.findIndex(f => f.key === key)
  if (index === -1) return false
  
  featureFlags[index] = {
    ...featureFlags[index],
    ...updates,
    lastModified: new Date()
  }
  
  return true
}

export const getFeatureFlagStats = () => {
  const total = featureFlags.length
  const enabled = featureFlags.filter(f => f.enabled && !f.archived).length
  const archived = featureFlags.filter(f => f.archived).length
  const beta = featureFlags.filter(f => f.developmentStatus === 'beta').length
  const active = featureFlags.filter(f => f.developmentStatus === 'active').length
  
  return {
    total,
    enabled,
    archived,
    beta,
    active,
    enabledPercentage: Math.round((enabled / total) * 100)
  }
}

// React hook for feature flags (for admin panel)
export const useFeatureFlag = (key: string) => {
  const feature = getFeatureFlag(key)
  return {
    isEnabled: feature?.enabled ?? false,
    isArchived: feature?.archived ?? false,
    feature: feature
  }
} 