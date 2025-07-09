"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Wallet, AlertTriangle, RefreshCw } from "lucide-react"

// BitAgora Payment Settings - Following new architecture patterns
import { usePaymentSettings } from './hooks/use-payment-settings'
import { handleBitAgoraError } from '@/lib/errors'

// New modular components
import { PaymentMethodCard } from './components/PaymentMethodCard'
import { CryptocurrencySection } from './components/CryptocurrencySection'
import { QRProvidersSection } from './components/QRProvidersSection'
import { SecuritySettingsSection } from './components/SecuritySettingsSection'
import { SaveControls } from './components/SaveControls'
import { PaymentMethodsPageSkeleton } from './components/SkeletonLoader'
import { 
  ErrorBoundary, 
  PaymentMethodErrorBoundary, 
  CryptoErrorBoundary, 
  QRProviderErrorBoundary 
} from './components/ErrorBoundary'

export default function PaymentMethodsPage() {
  // Use database settings instead of feature flags
  
  // Using our new custom hook following BitAgora patterns
  const {
    formData,
    fees,
    credentials,
    loading,
    errors,
    isSaved,
    updateField,
    updateFeeField,
    updateCredentialField,
    savePaymentData,
    reloadData,
    addQRProvider,
    removeQRProvider,
    updateQRProvider
  } = usePaymentSettings()

  // Updated handlers to use our new hook functions
  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('fees.')) {
      const feeType = field.split('.')[1] as keyof typeof fees
      updateFeeField(feeType, value as string)
    } else if (field.startsWith('credentials.')) {
      const credentialField = field.split('.')[1] as keyof typeof credentials
      updateCredentialField(credentialField, value as string)
    } else {
      updateField(field as keyof typeof formData, value)
    }
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    updateField(field as keyof typeof formData, checked)
  }

  const handleSubmit = async () => {
    try {
      await savePaymentData()
      console.log("Payment settings saved successfully")
    } catch (error) {
      console.error("Save failed:", error)
      const errorMessage = handleBitAgoraError(error)
      alert(`Save failed: ${errorMessage}`)
    }
  }

  // Show loading state with smooth skeleton animation
  if (loading.initial) {
    return <PaymentMethodsPageSkeleton />
  }

  // Show error state
  if (errors.settings) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Payment Settings Error</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Failed to Load Payment Settings</h2>
              <p className="text-muted-foreground mb-4">{errors.settings}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={reloadData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/admin'}>
                  Back to Admin
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallbackTitle="Payment Settings Error"
      fallbackDescription="There was an issue loading the payment settings page. This might be a temporary problem with the application."
      onError={(error, errorInfo) => {
        console.error('Payment Settings Page Error:', error.message)
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Payment Methods & QR Setup</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Configure your payment methods and QR payment systems to accept payments.
          </p>
        </div>

        <div className="space-y-6">
          {/* Demo Mode Warning */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    In production, payment settings would be validated and encrypted. For testing, you can configure any payment methods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Cards - Simple Database-Driven Checkboxes */}
          <PaymentMethodErrorBoundary>
            {/* Cash Payments */}
            <PaymentMethodCard
              title="Cash Payments"
              description="Physical cash payments - no fees, no setup required"
              icon={Wallet}
              enabled={formData.acceptCash}
              onEnabledChange={(enabled) => handleCheckboxChange('acceptCash', enabled)}
            />

            {/* Card Payments - Always show, let user enable/disable */}
            <PaymentMethodCard
              title="Card Payments"
              description="Credit/debit card processing with Stripe, PayPal, and Square"
              icon={CreditCard}
              enabled={formData.acceptCards}
              onEnabledChange={(enabled) => handleCheckboxChange('acceptCards', enabled)}
              status={formData.acceptCards ? 'active' : 'disabled'}
            >
              {formData.acceptCards && (
                <div className="space-y-4">
                  {/* Credit card configuration */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Credit Card Processing Enabled</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Configure your Stripe, PayPal, and Square integrations for credit and debit card payments.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stripe Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Stripe API Key</label>
                      <input 
                        type="password" 
                        placeholder="sk_live_..." 
                        className="w-full px-3 py-2 border rounded-md"
                        disabled 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Live Stripe secret key</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">PayPal Client ID</label>
                      <input 
                        type="text" 
                        placeholder="PayPal Client ID..." 
                        className="w-full px-3 py-2 border rounded-md"
                        disabled 
                      />
                      <p className="text-xs text-muted-foreground mt-1">PayPal REST API Client ID</p>
                    </div>
                  </div>
                </div>
              )}
            </PaymentMethodCard>
          </PaymentMethodErrorBoundary>

          {/* Cryptocurrency Payments with Error Boundary */}
          <CryptoErrorBoundary>
            <CryptocurrencySection
              data={{
                acceptBitcoin: formData.acceptBitcoin,
                acceptBitcoinLightning: formData.acceptBitcoinLightning,
                acceptUsdtEthereum: formData.acceptUsdtEthereum,
                acceptUsdtTron: formData.acceptUsdtTron,
                bitcoinWalletAddress: formData.bitcoinWalletAddress,
                bitcoinLightningAddress: formData.bitcoinLightningAddress,
                usdtEthereumWalletAddress: formData.usdtEthereumWalletAddress,
                usdtTronWalletAddress: formData.usdtTronWalletAddress,
                bitcoinDiscount: formData.bitcoinDiscount,
                lightningDiscount: formData.lightningDiscount,
                usdtEthDiscount: formData.usdtEthDiscount,
                usdtTronDiscount: formData.usdtTronDiscount
              }}
              onFieldChange={handleInputChange}
            />
          </CryptoErrorBoundary>

          {/* QR Payment Systems with Error Boundary */}
          <QRProviderErrorBoundary>
            <QRProvidersSection
              enableQRPayments={formData.enableQRPayments || false}
              qrProviders={formData.customQRProviders}
              onToggleQRPayments={(enabled) => handleCheckboxChange('enableQRPayments', enabled)}
              onAddProvider={addQRProvider}
              onUpdateProvider={updateQRProvider}
              onRemoveProvider={removeQRProvider}
            />
          </QRProviderErrorBoundary>

          {/* Security Settings */}
          <SecuritySettingsSection
            data={{
              requireSignature: formData.requireSignature,
              requireId: formData.requireId,
              autoSettle: formData.autoSettle
            }}
            onFieldChange={handleCheckboxChange}
          />

          {/* Save Controls */}
          <SaveControls
            onSave={handleSubmit}
            loading={loading.saving}
            saved={isSaved}
            error={errors.saving || undefined}
          />
        </div>
      </main>
    </div>
    </ErrorBoundary>
  )
}