// BitAgora Implementation Guide - Applying Best Practices
// Based on React Component Best Practices v1.0

// ====================
// 1. PAGE STRUCTURE TEMPLATE
// ====================

// /app/[feature]/page.tsx - Standard page structure
"use client"

import { PageHeader } from "@/components/common/PageHeader"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

// Feature-specific components
import { FeatureContent } from "./components/FeatureContent"
import { FeatureProvider } from "./context/FeatureContext"

// Custom hooks
import { useFeatureData } from "./hooks/useFeatureData"

export default function FeaturePage() {
  const { data, loading, error, retry } = useFeatureData()

  if (loading) return <LoadingState message="Loading feature data..." />
  if (error) return <ErrorDisplay error={error} onRetry={retry} />

  return (
    <ErrorBoundary>
      <FeatureProvider>
        <div className="min-h-screen bg-background">
          <PageHeader 
            title="Feature Management"
            description="Manage your feature settings and configuration"
            backTo="/admin"
          />
          
          <main className="max-w-6xl mx-auto px-4 py-8">
            <FeatureContent data={data} />
          </main>
        </div>
      </FeatureProvider>
    </ErrorBoundary>
  )
}

// ====================
// 2. COMPONENT ORGANIZATION
// ====================

// /components/[feature]/
// ├── types/
// │   ├── index.ts
// │   └── api-types.ts
// ├── services/
// │   ├── api.ts
// │   └── validation.ts
// ├── hooks/
// │   ├── useFeatureData.ts
// │   ├── useFormValidation.ts
// │   └── useFeatureActions.ts
// ├── components/
// │   ├── FeatureCard.tsx
// │   ├── FeatureForm.tsx
// │   └── FeatureList.tsx
// ├── context/
// │   └── FeatureContext.tsx
// └── index.ts

// ====================
// 3. STANDARDIZED HOOK PATTERNS
// ====================

// /hooks/useFeatureData.ts - Standard data fetching pattern
import { useState, useEffect } from "react"
import { FeatureAPI } from "../services/api"
import { FeatureData } from "../types"

export const useFeatureData = () => {
  const [state, setState] = useState<{
    data: FeatureData | null
    loading: boolean
    error: string | null
  }>({
    data: null,
    loading: true,
    error: null
  })

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await FeatureAPI.loadData()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    ...state,
    retry: loadData,
    refresh: loadData
  }
}

// /hooks/useFormActions.ts - Standard form management
import { useState, useCallback } from "react"
import { FeatureAPI } from "../services/api"

export const useFormActions = <T>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }, [])

  const save = useCallback(async () => {
    setIsSaving(true)
    try {
      await FeatureAPI.saveData(formData)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [formData])

  const reset = useCallback(() => {
    setFormData(initialData)
    setIsSaved(false)
  }, [initialData])

  return {
    formData,
    updateField,
    save,
    reset,
    isSaving,
    isSaved
  }
}

// ====================
// 4. COMMON COMPONENTS
// ====================

// /components/common/PageHeader.tsx - Reusable page header
interface PageHeaderProps {
  title: string
  description?: string
  backTo?: string
  actions?: React.ReactNode
}

export const PageHeader = ({ title, description, backTo, actions }: PageHeaderProps) => (
  <header className="bg-card border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          {backTo && (
            <Button variant="outline" size="sm" asChild>
              <Link href={backTo} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  </header>
)

// /components/common/LoadingState.tsx - Consistent loading UI
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingState = ({ message = "Loading...", size = 'md' }: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <RefreshCw className={`${sizeClasses[size]} animate-spin text-primary mx-auto mb-4`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// /components/common/ErrorDisplay.tsx - Standardized error handling
interface ErrorDisplayProps {
  error: string | Error
  action?: string
  onRetry?: () => void
  showDetails?: boolean
}

export const ErrorDisplay = ({ 
  error, 
  action = 'load data',
  onRetry,
  showDetails = false 
}: ErrorDisplayProps) => {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to {action}</h3>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {showDetails && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// ====================
// 5. SERVICE LAYER TEMPLATE
// ====================

// /services/api.ts - Standard API service
export class FeatureAPI {
  private static baseUrl = '/api/feature'

  static async loadData(): Promise<FeatureData> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load data')
      }
      
      return this.transformApiData(data.data)
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to load feature data')
    }
  }

  static async saveData(data: FeatureData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.transformFormData(data))
      })
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save data')
      }
    } catch (error) {
      console.error('Save Error:', error)
      throw error
    }
  }

  private static transformApiData(apiData: any): FeatureData {
    // Transform API response to frontend format
    return {
      // ... transformation logic
    }
  }

  private static transformFormData(formData: FeatureData): any {
    // Transform frontend format to API format
    return {
      // ... transformation logic
    }
  }
}

// ====================
// 6. VALIDATION PATTERNS
// ====================

// /services/validation.ts - Centralized validation
export const validationRules = {
  required: (value: any) => !value ? 'This field is required' : null,
  email: (value: string) => 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : null,
  minLength: (min: number) => (value: string) => 
    value.length < min ? `Minimum ${min} characters required` : null,
  walletAddress: (type: 'bitcoin' | 'ethereum' | 'tron') => (value: string) => {
    const patterns = {
      bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/,
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      tron: /^T[A-Za-z1-9]{33}$/
    }
    return !patterns[type].test(value) ? `Invalid ${type} address format` : null
  }
}

export const validateField = (value: any, rules: Array<(value: any) => string | null>): string | null => {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// ====================
// 7. CONTEXT PATTERN
// ====================

// /context/FeatureContext.tsx - Feature-specific context
interface FeatureContextType {
  settings: FeatureData
  updateSettings: (updates: Partial<FeatureData>) => void
  saveSettings: () => Promise<void>
  isLoading: boolean
  hasUnsavedChanges: boolean
}

const FeatureContext = createContext<FeatureContextType | null>(null)

export const FeatureProvider = ({ children }: { children: React.ReactNode }) => {
  const { formData, updateField, save, isSaving } = useFormActions(defaultFeatureData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateSettings = useCallback((updates: Partial<FeatureData>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateField(key as keyof FeatureData, value)
    })
    setHasUnsavedChanges(true)
  }, [updateField])

  const saveSettings = useCallback(async () => {
    await save()
    setHasUnsavedChanges(false)
  }, [save])

  return (
    <FeatureContext.Provider value={{
      settings: formData,
      updateSettings,
      saveSettings,
      isLoading: isSaving,
      hasUnsavedChanges
    }}>
      {children}
    </FeatureContext.Provider>
  )
}

export const useFeatureContext = () => {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error('useFeatureContext must be used within FeatureProvider')
  }
  return context
}

// ====================
// 8. FORM COMPONENT TEMPLATE
// ====================

// /components/FeatureForm.tsx - Standard form component
interface FeatureFormProps {
  onSave?: () => void
  className?: string
}

export const FeatureForm = ({ onSave, className }: FeatureFormProps) => {
  const { settings, updateSettings, hasUnsavedChanges } = useFeatureContext()
  const { errors, validateField } = useFormValidation(settings)

  const handleFieldChange = (field: keyof FeatureData, value: any) => {
    updateSettings({ [field]: value })
    validateField(field, value)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
        <CardDescription>Configure your feature preferences</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <FormField
          label="Setting Name"
          value={settings.settingName}
          onChange={(value) => handleFieldChange('settingName', value)}
          error={errors.settingName}
          required
        />
        
        {/* More form fields... */}
        
        {hasUnsavedChanges && (
          <div className="flex justify-end">
            <SaveButton onSave={onSave} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ====================
// 9. ERROR BOUNDARY IMPLEMENTATION
// ====================

// /components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback = ({ error }: { error?: Error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  </div>
)