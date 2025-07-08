# Payment Settings Improvement Action Plan
## Staged Implementation Strategy

*Created: 2025-01-08 | Version: 1.0*  
*Based on Payment Settings Audit Feedback*

---

## 🎯 **Overview**

This document outlines the step-by-step implementation plan for improving the Payment Settings component (`app/admin/payment-methods/page.tsx`) from a monolithic 800+ line component to a well-structured, maintainable architecture.

### **Current State**
- ✅ **Functionality**: All payment features working correctly
- ✅ **UI/UX**: Good user experience with shadcn/ui components
- ⚠️ **Architecture**: Monolithic component with mixed concerns
- ⚠️ **Maintainability**: Difficult to extend and test

### **Target State**
- ✅ **Modular Architecture**: Decomposed into focused components
- ✅ **Type Safety**: Comprehensive TypeScript interfaces
- ✅ **Service Layer**: Centralized API operations
- ✅ **Custom Hooks**: Reusable state management
- ✅ **Testing**: Unit tests for critical functionality

---

## 📋 **Phase 1: Foundation (Week 1)**
*Priority: HIGH | Risk: LOW | Estimated: 8-12 hours*

### **1.1 Extract TypeScript Interfaces**
**Goal**: Create comprehensive type definitions for better code clarity and IDE support

**Tasks**:
- [ ] Create `types/payment-settings.ts` file
- [ ] Define comprehensive interfaces
- [ ] Update component imports

**Implementation**:
```typescript
// types/payment-settings.ts
export interface PaymentFormData {
  acceptCash: boolean
  acceptCards: boolean
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUSDT: boolean
  acceptCustomQR: boolean
  acceptUSBankTransfer: boolean
  acceptInternationalWire: boolean
  acceptStripe: boolean
  acceptVenmo: boolean
  acceptPayPal: boolean
  acceptApplePay: boolean
  acceptGooglePay: boolean
  acceptCashApp: boolean
  acceptZelle: boolean
}

export interface PaymentFees {
  cashFee: number
  cardFee: number
  bitcoinFee: number
  bitcoinLightningFee: number
  usdtFee: number
  customQRFee: number
  usBankTransferFee: number
  internationalWireFee: number
  stripeFee: number
  venmoFee: number
  payPalFee: number
  applePayFee: number
  googlePayFee: number
  cashAppFee: number
  zelleFee: number
}

export interface QRProvider {
  id: string
  name: string
  enabled: boolean
  fee: number
  providerType: 'bitcoin' | 'lightning' | 'usdt' | 'custom'
  address?: string
  qrCodeImageData?: string
}

export interface PaymentCredentials {
  bitcoinAddress: string
  bitcoinLightningAddress: string
  usdtAddress: string
  stripePublishableKey: string
  stripeSecretKey: string
}

export interface LoadingState {
  settings: boolean
  fees: boolean
  credentials: boolean
  qrProviders: boolean
  saving: boolean
}

export interface ErrorState {
  settings: string | null
  fees: string | null
  credentials: string | null
  qrProviders: string | null
  saving: string | null
}
```

**Success Criteria**:
- [ ] All types properly defined
- [ ] No TypeScript errors
- [ ] Component imports updated
- [ ] Intellisense working correctly

---

### **1.2 Create Service Layer**
**Goal**: Centralize API operations and improve error handling using BitAgora patterns

**Tasks**:
- [ ] Create `services/payment-settings-api.ts` following BitAgora API patterns
- [ ] Implement centralized API operations with merchant context
- [ ] Add comprehensive error handling with BitAgoraError types

**Implementation**:
```typescript
// services/payment-settings-api.ts
import { 
  PaymentFormData, 
  PaymentFees, 
  PaymentCredentials, 
  QRProvider 
} from '../types/payment-settings'
import { BitAgoraError, BitAgoraErrorType } from '@/lib/errors'

export class PaymentSettingsAPI {
  private static baseUrl = '/api/payment-settings'
  
  private static async makeRequest(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-ID': getCurrentMerchantId(), // BitAgora multi-tenant pattern
          ...options?.headers
        }
      })
      
      if (!response.ok) {
        throw new BitAgoraError(
          BitAgoraErrorType.NETWORK_ERROR,
          `HTTP ${response.status}: ${response.statusText}`
        )
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new BitAgoraError(
          BitAgoraErrorType.VALIDATION_ERROR,
          data.error || 'Operation failed'
        )
      }
      
      return data
    } catch (error) {
      if (error instanceof BitAgoraError) {
        throw error
      }
      
      throw new BitAgoraError(
        BitAgoraErrorType.NETWORK_ERROR,
        `Failed to ${endpoint}: ${error.message}`
      )
    }
  }

  static async loadSettings(): Promise<PaymentFormData> {
    const response = await this.makeRequest('/api/payment-settings')
    return this.transformApiData(response.data)
  }

  static async saveSettings(data: PaymentFormData): Promise<void> {
    await this.makeRequest('/api/payment-settings', {
      method: 'PUT',
      body: JSON.stringify(this.transformFormData(data))
    })
  }

  private static transformApiData(apiData: any): PaymentFormData {
    // Transform API response to frontend format following BitAgora patterns
    return {
      acceptCash: apiData.acceptCash || false,
      acceptCards: apiData.acceptCards || false,
      acceptBitcoin: apiData.acceptBitcoin || false,
      acceptBitcoinLightning: apiData.acceptBitcoinLightning || false,
      acceptUSDT: apiData.acceptUSDT || false,
      acceptCustomQR: apiData.acceptCustomQR || false,
      acceptUSBankTransfer: apiData.acceptUSBankTransfer || false,
      acceptInternationalWire: apiData.acceptInternationalWire || false,
      acceptStripe: apiData.acceptStripe || false,
      acceptVenmo: apiData.acceptVenmo || false,
      acceptPayPal: apiData.acceptPayPal || false,
      acceptApplePay: apiData.acceptApplePay || false,
      acceptGooglePay: apiData.acceptGooglePay || false,
      acceptCashApp: apiData.acceptCashApp || false,
      acceptZelle: apiData.acceptZelle || false,
    }
  }

  private static transformFormData(formData: PaymentFormData): any {
    // Transform frontend format to API format following BitAgora patterns
    return {
      ...formData,
      merchantId: getCurrentMerchantId()
    }
  }

  static async loadFees(): Promise<PaymentFees> {
    try {
      const response = await fetch('/api/payment-fees')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      this.handleError(error, 'load payment fees')
    }
  }

  static async saveFees(fees: PaymentFees): Promise<void> {
    try {
      const response = await fetch('/api/payment-fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fees)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.handleError(error, 'save payment fees')
    }
  }

  static async loadCredentials(): Promise<PaymentCredentials> {
    try {
      const response = await fetch('/api/payment-credentials')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      this.handleError(error, 'load payment credentials')
    }
  }

  static async saveCredentials(credentials: PaymentCredentials): Promise<void> {
    try {
      const response = await fetch('/api/payment-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.handleError(error, 'save payment credentials')
    }
  }

  static async loadQRProviders(): Promise<QRProvider[]> {
    try {
      const response = await fetch('/api/qr-providers')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data || []
    } catch (error) {
      this.handleError(error, 'load QR providers')
    }
  }

  static async saveQRProvider(provider: Omit<QRProvider, 'id'>): Promise<QRProvider> {
    try {
      const response = await fetch('/api/qr-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      this.handleError(error, 'save QR provider')
    }
  }

  static async deleteQRProvider(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/qr-providers?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.handleError(error, 'delete QR provider')
    }
  }
}
```

**Success Criteria**:
- [ ] All API calls centralized
- [ ] Comprehensive error handling
- [ ] Type-safe operations
- [ ] Easy to test and mock

---

### **1.3 Update Component to Use Service Layer**
**Goal**: Replace inline API calls with service layer

**Tasks**:
- [ ] Import PaymentSettingsAPI
- [ ] Replace fetch calls with service methods
- [ ] Implement proper error handling

**Implementation**:
```typescript
// In payment-methods/page.tsx
import { PaymentSettingsAPI } from './services/payment-settings-api'

// Replace this:
const response = await fetch('/api/payment-settings')
const data = await response.json()

// With this:
const data = await PaymentSettingsAPI.loadSettings()
```

**Success Criteria**:
- [ ] All API calls use service layer
- [ ] Error handling improved
- [ ] Code is more readable
- [ ] Functionality preserved

---

## 📋 **Phase 2: Component Decomposition (Week 2)**
*Priority: MEDIUM | Risk: MEDIUM | Estimated: 12-16 hours*

### **2.1 Create Payment Method Components**
**Goal**: Break down monolithic component into focused sections

**Tasks**:
- [ ] Create `components/payment-methods/` directory
- [ ] Implement individual payment method components
- [ ] Maintain existing styling and behavior

**Implementation**:
```typescript
// components/payment-methods/CashPaymentSection.tsx
interface CashPaymentSectionProps {
  enabled: boolean
  fee: number
  onToggle: (enabled: boolean) => void
  onFeeChange: (fee: number) => void
}

export const CashPaymentSection: React.FC<CashPaymentSectionProps> = ({
  enabled,
  fee,
  onToggle,
  onFeeChange
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Cash Payments</h3>
          <p className="text-sm text-gray-600">Accept cash payments</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      
      {enabled && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cash-fee">Processing Fee (%)</Label>
            <Input
              id="cash-fee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={fee}
              onChange={(e) => onFeeChange(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
```

**Components to Create**:
- [ ] `CashPaymentSection.tsx`
- [ ] `CardPaymentSection.tsx`
- [ ] `CryptoPaymentSection.tsx`
- [ ] `BankTransferSection.tsx`
- [ ] `DigitalWalletSection.tsx`
- [ ] `CustomQRSection.tsx`

**Success Criteria**:
- [ ] Each component < 100 lines
- [ ] Single responsibility principle
- [ ] Props-based configuration
- [ ] Consistent styling

---

### **2.2 Create Custom Hooks**
**Goal**: Extract complex state management logic

**Tasks**:
- [ ] Create `hooks/use-payment-settings.ts`
- [ ] Implement state management hooks
- [ ] Add loading and error states

**Implementation**:
```typescript
// hooks/use-payment-settings.ts
import { useState, useEffect } from 'react'
import { PaymentSettingsAPI } from '../services/payment-settings-api'
import { PaymentFormData, LoadingState, ErrorState } from '../types/payment-settings'

export const usePaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentFormData | null>(null)
  const [loading, setLoading] = useState<LoadingState>({
    settings: false,
    fees: false,
    credentials: false,
    qrProviders: false,
    saving: false
  })
  const [errors, setErrors] = useState<ErrorState>({
    settings: null,
    fees: null,
    credentials: null,
    qrProviders: null,
    saving: null
  })

  const loadSettings = async () => {
    setLoading(prev => ({ ...prev, settings: true }))
    setErrors(prev => ({ ...prev, settings: null }))
    
    try {
      const data = await PaymentSettingsAPI.loadSettings()
      setSettings(data)
    } catch (error) {
      setErrors(prev => ({ ...prev, settings: error.message }))
    } finally {
      setLoading(prev => ({ ...prev, settings: false }))
    }
  }

  const saveSettings = async (data: PaymentFormData) => {
    setLoading(prev => ({ ...prev, saving: true }))
    setErrors(prev => ({ ...prev, saving: null }))
    
    try {
      await PaymentSettingsAPI.saveSettings(data)
      setSettings(data)
      return true
    } catch (error) {
      setErrors(prev => ({ ...prev, saving: error.message }))
      return false
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  const updateSetting = <K extends keyof PaymentFormData>(
    key: K,
    value: PaymentFormData[K]
  ) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    errors,
    saveSettings,
    updateSetting,
    reloadSettings: loadSettings
  }
}
```

**Hooks to Create**:
- [ ] `usePaymentSettings.ts`
- [ ] `usePaymentFees.ts`
- [ ] `usePaymentCredentials.ts`
- [ ] `useQRProviders.ts`

**Success Criteria**:
- [ ] Complex state logic extracted
- [ ] Reusable across components
- [ ] Comprehensive error handling
- [ ] Loading states managed

---

### **2.3 Refactor Main Component**
**Goal**: Simplify main component by using sub-components and hooks

**Tasks**:
- [ ] Replace sections with components
- [ ] Use custom hooks for state management
- [ ] Maintain exact same functionality

**Implementation**:
```typescript
// app/admin/payment-methods/page.tsx (refactored)
import { usePaymentSettings } from './hooks/use-payment-settings'
import { CashPaymentSection } from './components/payment-methods/CashPaymentSection'
import { CardPaymentSection } from './components/payment-methods/CardPaymentSection'
// ... other imports

export default function PaymentMethodsPage() {
  const { settings, loading, errors, saveSettings, updateSetting } = usePaymentSettings()
  
  if (loading.settings) {
    return <LoadingSpinner message="Loading payment settings..." />
  }
  
  if (errors.settings) {
    return <ErrorDisplay error={errors.settings} onRetry={reloadSettings} />
  }
  
  return (
    <div className="space-y-6">
      <CashPaymentSection
        enabled={settings.acceptCash}
        fee={fees.cashFee}
        onToggle={(enabled) => updateSetting('acceptCash', enabled)}
        onFeeChange={(fee) => updateFee('cashFee', fee)}
      />
      
      <CardPaymentSection
        enabled={settings.acceptCards}
        fee={fees.cardFee}
        onToggle={(enabled) => updateSetting('acceptCards', enabled)}
        onFeeChange={(fee) => updateFee('cardFee', fee)}
      />
      
      {/* ... other sections */}
    </div>
  )
}
```

**Success Criteria**:
- [ ] Main component < 200 lines
- [ ] Clear separation of concerns
- [ ] All functionality preserved
- [ ] Easier to read and maintain

---

## 📋 **Phase 3: Advanced Patterns (Week 3)**
*Priority: LOW | Risk: LOW | Estimated: 8-12 hours*

### **3.1 Form Validation Enhancement**
**Goal**: Add comprehensive form validation with BitAgora-specific crypto validation

**Tasks**:
- [ ] Create BitAgora validation schemas with crypto address validation
- [ ] Implement conditional validation for payment methods
- [ ] Add real-time validation with BitAgora form patterns

**Implementation**:
```typescript
// validation/payment-settings-schema.ts
import { z } from 'zod'
import { cryptoValidation } from '@/lib/crypto-validation'

export const paymentSettingsSchema = z.object({
  acceptCash: z.boolean(),
  acceptCards: z.boolean(),
  acceptBitcoin: z.boolean(),
  acceptBitcoinLightning: z.boolean(),
  acceptUSDT: z.boolean(),
  acceptCustomQR: z.boolean(),
  // ... other fields
}).refine((data) => {
  // BitAgora requirement: At least one payment method must be enabled
  const enabledMethods = Object.values(data).some(Boolean)
  return enabledMethods
}, {
  message: "At least one payment method must be enabled"
})

export const paymentCredentialsSchema = z.object({
  bitcoinAddress: z.string().optional().refine((value) => {
    if (!value) return true
    return cryptoValidation.bitcoin(value) === null
  }, "Invalid Bitcoin address format"),
  
  bitcoinLightningAddress: z.string().optional().refine((value) => {
    if (!value) return true
    return cryptoValidation.lightning(value) === null
  }, "Invalid Lightning address format"),
  
  usdtAddress: z.string().optional().refine((value) => {
    if (!value) return true
    return cryptoValidation.tron(value) === null
  }, "Invalid USDT (Tron) address format"),
})

export const paymentFeesSchema = z.object({
  cashFee: z.number().min(0).max(100),
  cardFee: z.number().min(0).max(100),
  bitcoinFee: z.number().min(0).max(100),
  bitcoinLightningFee: z.number().min(0).max(100),
  usdtFee: z.number().min(0).max(100),
  // ... other fees
})

// BitAgora-specific form validation hook
export const useBitAgoraPaymentValidation = (formData: PaymentFormData) => {
  return useBitAgoraForm(formData, {
    bitcoinAddress: {
      validate: cryptoValidation.bitcoin,
      condition: (data) => data.acceptBitcoin
    },
    bitcoinLightningAddress: {
      validate: cryptoValidation.lightning,
      condition: (data) => data.acceptBitcoinLightning
    },
    usdtAddress: {
      validate: cryptoValidation.tron,
      condition: (data) => data.acceptUSDT
    }
  })
}
```

**Success Criteria**:
- [ ] Comprehensive validation rules
- [ ] Real-time validation feedback
- [ ] Better error messages
- [ ] Type-safe validation

---

### **3.2 Error Boundary Implementation**
**Goal**: Improve error handling with BitAgora-specific error types and recovery

**Tasks**:
- [ ] Create error boundary component using BitAgora patterns
- [ ] Implement fallback UI with payment-specific error messages
- [ ] Add error reporting and recovery mechanisms

**Implementation**:
```typescript
// components/ErrorBoundary.tsx
import { BitAgoraError, BitAgoraErrorType, handleBitAgoraError } from '@/lib/errors'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

export const PaymentSettingsErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback = PaymentSettingsErrorFallback 
}) => {
  return (
    <ReactErrorBoundary 
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        console.error('Payment Settings Error:', error, errorInfo)
        
        // BitAgora-specific error handling
        if (error instanceof BitAgoraError) {
          switch (error.type) {
            case BitAgoraErrorType.PAYMENT_ERROR:
              // Handle payment-specific errors
              break
            case BitAgoraErrorType.AUTHENTICATION_ERROR:
              // Redirect to login
              break
            case BitAgoraErrorType.NETWORK_ERROR:
              // Retry mechanism
              break
          }
        }
        
        // Optional: Send to error reporting service
        reportError(error, 'payment-settings')
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

const PaymentSettingsErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const errorMessage = error instanceof BitAgoraError 
    ? handleBitAgoraError(error)
    : 'An unexpected error occurred while loading payment settings'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Settings Error</h1>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/admin'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Success Criteria**:
- [ ] Graceful error handling
- [ ] User-friendly error messages
- [ ] Error recovery options
- [ ] Error reporting integration

---

### **3.3 Performance Optimization**
**Goal**: Optimize component performance and loading

**Tasks**:
- [ ] Add React.memo to expensive components
- [ ] Implement proper useCallback usage
- [ ] Add lazy loading for heavy sections

**Implementation**:
```typescript
// Memoized components
const MemoizedCryptoSection = memo(CryptoPaymentSection)
const MemoizedQRSection = memo(CustomQRSection)

// Optimized event handlers
const handleSettingChange = useCallback((key: string, value: any) => {
  updateSetting(key, value)
}, [updateSetting])
```

**Success Criteria**:
- [ ] Reduced re-renders
- [ ] Faster load times
- [ ] Better user experience
- [ ] Maintained functionality

---

## 🧪 **Phase 4: Testing & Quality Assurance (Week 4)**
*Priority: HIGH | Risk: LOW | Estimated: 8-12 hours*

### **4.1 Unit Tests**
**Goal**: Add comprehensive unit tests using BitAgora testing patterns

**Tasks**:
- [ ] Set up testing framework with BitAgora providers
- [ ] Test custom hooks with BitAgora context
- [ ] Test service layer with merchant isolation
- [ ] Test component logic with crypto validation

**Implementation**:
```typescript
// __tests__/services/payment-settings-api.test.ts
import { PaymentSettingsAPI } from '../../services/payment-settings-api'
import { mockBitAgoraServices, renderWithBitAgoraProviders } from '@/lib/test-utils'
import { BitAgoraError, BitAgoraErrorType } from '@/lib/errors'

describe('PaymentSettingsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load settings successfully with merchant context', async () => {
    const mockData = { 
      success: true, 
      data: { acceptCash: true, acceptCards: false } 
    }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    })
    
    const result = await PaymentSettingsAPI.loadSettings()
    
    expect(global.fetch).toHaveBeenCalledWith('/api/payment-settings', {
      headers: expect.objectContaining({
        'X-Merchant-ID': expect.any(String)
      })
    })
    expect(result).toEqual(mockData.data)
  })
  
  it('should handle BitAgora errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    
    await expect(PaymentSettingsAPI.loadSettings()).rejects.toThrow(BitAgoraError)
    await expect(PaymentSettingsAPI.loadSettings()).rejects.toHaveProperty('type', BitAgoraErrorType.NETWORK_ERROR)
  })

  it('should validate crypto addresses', async () => {
    const invalidBitcoinAddress = 'invalid-address'
    const validBitcoinAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    
    expect(cryptoValidation.bitcoin(invalidBitcoinAddress)).toBe('Invalid Bitcoin address format')
    expect(cryptoValidation.bitcoin(validBitcoinAddress)).toBeNull()
  })
})

// __tests__/hooks/use-payment-settings.test.ts
import { renderHook, act } from '@testing-library/react'
import { usePaymentSettings } from '../../hooks/use-payment-settings'
import { renderWithBitAgoraProviders } from '@/lib/test-utils'

describe('usePaymentSettings', () => {
  it('should load settings on mount', async () => {
    mockBitAgoraServices.PaymentSettings.loadSettings.mockResolvedValue({
      acceptCash: true,
      acceptCards: false
    })

    const { result } = renderHook(() => usePaymentSettings(), {
      wrapper: ({ children }) => renderWithBitAgoraProviders(children)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.settings).toEqual({
      acceptCash: true,
      acceptCards: false
    })
    expect(result.current.loading.settings).toBe(false)
    expect(result.current.errors.settings).toBeNull()
  })

  it('should handle save operations', async () => {
    const mockSettings = { acceptCash: true, acceptCards: true }
    mockBitAgoraServices.PaymentSettings.saveSettings.mockResolvedValue(undefined)

    const { result } = renderHook(() => usePaymentSettings(), {
      wrapper: ({ children }) => renderWithBitAgoraProviders(children)
    })

    await act(async () => {
      const success = await result.current.saveSettings(mockSettings)
      expect(success).toBe(true)
    })

    expect(mockBitAgoraServices.PaymentSettings.saveSettings).toHaveBeenCalledWith(mockSettings)
    expect(result.current.settings).toEqual(mockSettings)
  })
})
```

**Success Criteria**:
- [ ] Critical paths tested
- [ ] Edge cases covered
- [ ] Mocking implemented
- [ ] High test coverage

---

### **4.2 Integration Testing**
**Goal**: Test component interactions and user flows

**Tasks**:
- [ ] Test complete user workflows
- [ ] Test API integration
- [ ] Test error scenarios

**Success Criteria**:
- [ ] End-to-end workflows tested
- [ ] API integration verified
- [ ] Error handling tested
- [ ] User experience validated

---

### **4.3 Performance Testing**
**Goal**: Ensure refactoring doesn't impact performance

**Tasks**:
- [ ] Measure component render times
- [ ] Test loading performance
- [ ] Validate memory usage

**Success Criteria**:
- [ ] No performance regression
- [ ] Faster load times
- [ ] Memory usage optimized
- [ ] Smooth user experience

---

## 🚀 **Implementation Guidelines**

### **Development Workflow**
1. **Create feature branch** for each phase
2. **Small, focused commits** with clear messages
3. **Test each change** before moving to next
4. **Code review** before merging
5. **Rollback plan** ready for each phase

### **Quality Checkpoints**
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] ESLint warnings minimal
- [ ] Functionality preserved
- [ ] Performance maintained

### **Risk Mitigation**
- [ ] Backup current working version
- [ ] Test on staging environment
- [ ] Have rollback plan ready
- [ ] Document any breaking changes

---

## 📊 **Success Metrics**

### **Code Quality**
- [ ] Component size < 300 lines
- [ ] Cyclomatic complexity < 10
- [ ] TypeScript errors = 0
- [ ] Test coverage > 80%

### **Performance**
- [ ] Load time < 2 seconds
- [ ] No memory leaks
- [ ] Smooth interactions
- [ ] Bundle size optimized

### **Maintainability**
- [ ] Clear separation of concerns
- [ ] Reusable components
- [ ] Comprehensive documentation
- [ ] Easy to extend

---

## 🎯 **Timeline Summary**

| Phase | Duration | Priority | Risk | Deliverables |
|-------|----------|----------|------|-------------|
| Phase 1 | Week 1 | HIGH | LOW | Types, Service Layer, Basic Refactoring |
| Phase 2 | Week 2 | MEDIUM | MEDIUM | Component Decomposition, Custom Hooks |
| Phase 3 | Week 3 | LOW | LOW | Advanced Patterns, Validation, Error Boundaries |
| Phase 4 | Week 4 | HIGH | LOW | Testing, Quality Assurance, Documentation |

---

## 🏗️ **BitAgora-Specific Implementation Notes**

### **Multi-Tenant Architecture**
- All API calls must include `X-Merchant-ID` header
- Use `getCurrentMerchantId()` helper function
- Implement proper merchant isolation in data handling

### **Payment Processing Integration**
- QR code generation for crypto payments
- Real-time payment status monitoring
- Support for Bitcoin, Lightning, USDT, and custom QR providers
- Base64 image storage for custom QR codes

### **Crypto Address Validation**
- Bitcoin: `bc1|[13]` pattern validation
- Lightning: Email-like format validation
- USDT: Tron address format validation
- Conditional validation based on enabled payment methods

### **Error Handling**
- Use `BitAgoraError` with specific error types
- Implement contextual error messages
- Provide recovery mechanisms for common errors
- Integrate with BitAgora error reporting system

### **Testing Approach**
- Use `renderWithBitAgoraProviders` for component testing
- Mock `mockBitAgoraServices` for API testing
- Test crypto validation with valid/invalid addresses
- Verify merchant context in all API calls

---

## 🔗 **Related Documents**

- [BitAgora Implementation Guide](./bitagora-implementation-guide.ts)
- [BitAgora Specific Patterns](./bitagora-specific-patterns.ts)
- [React Component Best Practices](../02-Protocols/React%20Component%20Best%20Practices.md)
- [Data Handling Protocol](../02-Protocols/Data%20Handling%20Protocol)
- [Testing Strategy](./Testing%20Strategy.md)

---

*This plan should be executed incrementally with thorough testing at each phase to ensure stability and functionality preservation.* 