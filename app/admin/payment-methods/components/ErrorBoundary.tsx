// BitAgora Error Boundary Component
// Advanced error boundaries with recovery options and detailed reporting

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, FileText, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BitAgoraError, BitAgoraErrorType } from '@/lib/errors'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  isRecovering: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
  showErrorDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRecover?: () => void
  recoveryComponent?: ReactNode
  className?: string
}

// Error logging utility
const logError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  console.group(`🚨 BitAgora Error Boundary - ${errorId}`)
  console.error('Error:', error)
  console.error('Error Info:', errorInfo)
  console.error('Component Stack:', errorInfo.componentStack)
  console.error('Error Stack:', error.stack)
  console.groupEnd()
  
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // errorReporting.captureException(error, { extra: errorInfo })
  }
}

// Generate unique error ID
const generateErrorId = () => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRecovering: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      isRecovering: false
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || generateErrorId()
    
    // Log error with details
    logError(error, errorInfo, errorId)
    
    // Update state with error info
    this.setState({
      errorInfo,
      errorId
    })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        isRecovering: true
      })
      
      // Call recovery callback
      if (this.props.onRecover) {
        this.props.onRecover()
      }
      
      // Reset recovering state after a short delay
      setTimeout(() => {
        this.setState({ isRecovering: false })
      }, 1000)
    }
  }

  handleReset = () => {
    this.retryCount = 0
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRecovering: false
    })
  }

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = "Something went wrong",
        fallbackDescription = "An unexpected error occurred. Please try again or contact support if the problem persists.",
        showErrorDetails = process.env.NODE_ENV === 'development',
        recoveryComponent,
        className = ""
      } = this.props

      const { error, errorInfo, errorId } = this.state
      const canRetry = this.retryCount < this.maxRetries

      return (
        <div className={`min-h-[400px] flex items-center justify-center p-4 ${className}`}>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                {fallbackTitle}
              </CardTitle>
              <CardDescription>{fallbackDescription}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error ID */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Bug className="h-4 w-4" />
                  <span className="font-medium">Error ID:</span>
                  <code className="bg-background px-2 py-1 rounded text-xs">{errorId}</code>
                </div>
              </div>

              {/* Error Details (Development Only) */}
              {showErrorDetails && error && (
                <div className="space-y-3">
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">Error Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Message:</span>
                        <code className="ml-2 bg-background px-2 py-1 rounded text-xs">
                          {error.message}
                        </code>
                      </div>
                      {error.stack && (
                        <div>
                          <span className="font-medium">Stack Trace:</span>
                          <pre className="mt-1 bg-background p-2 rounded text-xs overflow-x-auto">
                            {error.stack.split('\n').slice(0, 10).join('\n')}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button onClick={this.handleRetry} variant="default" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}
                
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Reset Component
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Custom Recovery Component */}
              {recoveryComponent && (
                <div className="pt-4 border-t">
                  {recoveryComponent}
                </div>
              )}

              {/* Support Information */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>
                  If this error persists, please contact support with Error ID: 
                  <code className="ml-1 bg-muted px-2 py-1 rounded">{errorId}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different sections
export function PaymentMethodErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackTitle="Payment Method Error"
      fallbackDescription="There was an issue loading the payment methods. This might be a temporary problem."
      onError={(error, errorInfo) => {
        // Log specific payment method errors
        console.error('Payment Method Error:', error.message)
      }}
      recoveryComponent={
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Try refreshing the page or clearing your browser cache. 
            Payment method settings are saved automatically.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function CryptoErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackTitle="Cryptocurrency Configuration Error"
      fallbackDescription="There was an issue with the cryptocurrency payment settings. This might be related to address validation."
      onError={(error, errorInfo) => {
        // Log crypto-specific errors
        console.error('Crypto Configuration Error:', error.message)
      }}
      recoveryComponent={
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Tip:</strong> Check your wallet addresses for correct formatting. 
            Bitcoin addresses start with 1, 3, or bc1. Ethereum addresses start with 0x.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function QRProviderErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackTitle="QR Provider Error"
      fallbackDescription="There was an issue with the QR payment provider settings. This might be related to file uploads or provider configuration."
      onError={(error, errorInfo) => {
        // Log QR provider errors
        console.error('QR Provider Error:', error.message)
      }}
      recoveryComponent={
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            💡 <strong>Tip:</strong> Ensure QR code images are in PNG, JPG, or SVG format 
            and are less than 5MB in size.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
} 