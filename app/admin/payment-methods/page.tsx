"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Wallet, AlertTriangle, RefreshCw, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"

// BitAgora Payment Settings - Following new architecture patterns
import { usePaymentSettings } from './hooks/use-payment-settings'
import { handleBitAgoraError } from '@/lib/errors'

// New modular components
import { PaymentMethodCard } from './components/PaymentMethodCard'
import { CryptocurrencySection } from './components/CryptocurrencySection'
import { QRProvidersSection } from './components/QRProvidersSection'
import { SecuritySettingsSection } from './components/SecuritySettingsSection'
import { SaveControls } from './components/SaveControls'

export default function PaymentMethodsPage() {
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
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('fees.')) {
      const feeType = field.split('.')[1] as keyof typeof fees
      updateFeeField(feeType, value)
    } else if (field.startsWith('credentials.')) {
      const credentialField = field.split('.')[1] as keyof typeof credentials
      updateCredentialField(credentialField, value)
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

  // Show loading state
  if (loading.initial) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold text-foreground">Payment Methods & QR Setup</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading payment settings...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (errors.settings) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <h1 className="text-xl font-semibold text-foreground">Payment Settings Error</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Payment Methods & QR Setup</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Cash Payments */}
          <PaymentMethodCard
            title="Cash Payments"
            description="Physical cash payments - no fees, no setup required"
            icon={Wallet}
            enabled={formData.acceptCash}
            onEnabledChange={(enabled) => handleCheckboxChange('acceptCash', enabled)}
          />

          {/* Card Payments */}
          <PaymentMethodCard
            title="Card Payments"
            description="Credit/debit card processing with Stripe, PayPal, and Square"
            icon={CreditCard}
            enabled={false}
            onEnabledChange={() => {}}
            status="coming-soon"
            statusText="Coming Soon in Phase 2"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Coming Soon in Phase 2</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Credit/debit card processing with Stripe, PayPal, and Square will be available in Phase 2 of our development roadmap. 
                    For now, focus on cash and regional QR payments for your MVP.
                  </p>
                </div>
              </div>
            </div>
          </PaymentMethodCard>

          {/* Cryptocurrency Payments */}
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

          {/* QR Payment Systems */}
          <QRProvidersSection
            enableQRPayments={formData.enableQRPayments || false}
            qrProviders={formData.customQRProviders}
            onToggleQRPayments={(enabled) => handleCheckboxChange('enableQRPayments', enabled)}
            onAddProvider={addQRProvider}
            onUpdateProvider={updateQRProvider}
            onRemoveProvider={removeQRProvider}
          />

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
            error={errors.saving}
          />
        </div>
      </main>
    </div>
  )
}