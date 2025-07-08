"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, Shield, AlertTriangle, Save, RefreshCw, CheckCircle, QrCode, Globe, Upload, ArrowLeft, Clock, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"

// BitAgora Payment Settings - Following new architecture patterns
import { usePaymentSettings } from './hooks/use-payment-settings'
import { handleBitAgoraError } from '@/lib/errors'

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Cash Payments
              </CardTitle>
              <CardDescription>Physical cash payment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-semibold text-foreground">Accept Cash</h3>
                  <p className="text-sm text-muted-foreground">Physical cash payments - no fees, no setup required</p>
                </div>
                <Checkbox 
                  id="acceptCash" 
                  checked={formData.acceptCash}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptCash', checked as boolean)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Card Payments
              </CardTitle>
              <CardDescription>Credit and debit card payment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
                <div>
                  <h3 className="font-semibold text-foreground">Accept Credit/Debit Cards</h3>
                  <p className="text-sm text-muted-foreground">Card payments processed via configured payment processors below</p>
                </div>
                <Checkbox 
                  id="acceptCards" 
                  checked={false}
                  disabled={true}
                />
              </div>
              
              {/* Coming Soon Notification */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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
            </CardContent>
          </Card>

          {/* Cryptocurrency Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Cryptocurrency Payments
              </CardTitle>
              <CardDescription>Bitcoin, Lightning Network, and USDT wallet configuration with QR codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bitcoin */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Bitcoin (BTC)</h3>
                    <p className="text-sm text-muted-foreground">Accept Bitcoin payments</p>
                  </div>
                  <Checkbox 
                    id="acceptBitcoin" 
                    checked={formData.acceptBitcoin}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptBitcoin', checked as boolean)}
                  />
                </div>
                
                {formData.acceptBitcoin && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bitcoinWalletAddress">Bitcoin Wallet Address</Label>
                      <div className="relative">
                        <Input
                          id="bitcoinWalletAddress"
                          value={formData.bitcoinWalletAddress}
                          onChange={(e) => handleInputChange('bitcoinWalletAddress', e.target.value)}
                          placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                          className="mt-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">QR code will be generated automatically at checkout</p>
                    </div>
                    <div>
                      <Label htmlFor="bitcoinDiscount">Bitcoin Discount (%)</Label>
                      <Input
                        id="bitcoinDiscount"
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={formData.bitcoinDiscount || ''}
                        onChange={(e) => handleInputChange('bitcoinDiscount', e.target.value)}
                        placeholder="2.5"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Discount to encourage Bitcoin payments (optional)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bitcoin Lightning */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Bitcoin Lightning Network</h3>
                    <p className="text-sm text-muted-foreground">Fast, low-fee Bitcoin payments</p>
                  </div>
                  <Checkbox 
                    id="acceptBitcoinLightning" 
                    checked={formData.acceptBitcoinLightning}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptBitcoinLightning', checked as boolean)}
                  />
                </div>
                
                {formData.acceptBitcoinLightning && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bitcoinLightningAddress">Lightning Address</Label>
                      <div className="relative">
                        <Input
                          id="bitcoinLightningAddress"
                          value={formData.bitcoinLightningAddress}
                          onChange={(e) => handleInputChange('bitcoinLightningAddress', e.target.value)}
                          placeholder="user@wallet.lightning.address"
                          className="mt-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">QR code will be generated automatically at checkout</p>
                    </div>
                    <div>
                      <Label htmlFor="lightningDiscount">Lightning Discount (%)</Label>
                      <Input
                        id="lightningDiscount"
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={formData.lightningDiscount || ''}
                        onChange={(e) => handleInputChange('lightningDiscount', e.target.value)}
                        placeholder="3.0"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Discount to encourage Lightning payments (optional)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* USDT Ethereum */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">USDT (Ethereum)</h3>
                    <p className="text-sm text-muted-foreground">Tether on Ethereum network</p>
                  </div>
                  <Checkbox 
                    id="acceptUsdtEthereum" 
                    checked={formData.acceptUsdtEthereum}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptUsdtEthereum', checked as boolean)}
                  />
                </div>
                
                {formData.acceptUsdtEthereum && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="usdtEthereumWalletAddress">Ethereum Wallet Address</Label>
                      <div className="relative">
                        <Input
                          id="usdtEthereumWalletAddress"
                          value={formData.usdtEthereumWalletAddress}
                          onChange={(e) => handleInputChange('usdtEthereumWalletAddress', e.target.value)}
                          placeholder="0x742d35...15e2f3"
                          className="mt-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">QR code will be generated automatically at checkout</p>
                    </div>
                    <div>
                      <Label htmlFor="usdtEthDiscount">USDT-ETH Discount (%)</Label>
                      <Input
                        id="usdtEthDiscount"
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={formData.usdtEthDiscount || ''}
                        onChange={(e) => handleInputChange('usdtEthDiscount', e.target.value)}
                        placeholder="1.5"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Discount to encourage USDT-ETH payments (optional)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* USDT Tron */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">USDT (Tron)</h3>
                    <p className="text-sm text-muted-foreground">Tether on Tron network</p>
                  </div>
                  <Checkbox 
                    id="acceptUsdtTron" 
                    checked={formData.acceptUsdtTron}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptUsdtTron', checked as boolean)}
                  />
                </div>
                
                {formData.acceptUsdtTron && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="usdtTronWalletAddress">Tron Wallet Address</Label>
                      <div className="relative">
                        <Input
                          id="usdtTronWalletAddress"
                          value={formData.usdtTronWalletAddress}
                          onChange={(e) => handleInputChange('usdtTronWalletAddress', e.target.value)}
                          placeholder="TR7NHq...1z3HQF"
                          className="mt-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">QR code will be generated automatically at checkout</p>
                    </div>
                    <div>
                      <Label htmlFor="usdtTronDiscount">USDT-TRX Discount (%)</Label>
                      <Input
                        id="usdtTronDiscount"
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={formData.usdtTronDiscount || ''}
                        onChange={(e) => handleInputChange('usdtTronDiscount', e.target.value)}
                        placeholder="1.0"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Discount to encourage USDT-TRX payments (optional)</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Payment Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Custom QR Payment Systems
              </CardTitle>
              <CardDescription>Add your own QR payment providers with custom names and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Multiple QR Provider Setup */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Enable QR Payments</h3>
                    <p className="text-sm text-muted-foreground">Accept payments via QR codes from your payment providers</p>
                  </div>
                  <Checkbox 
                    id="enableQRPayments" 
                    checked={formData.enableQRPayments || false}
                    onCheckedChange={(checked) => handleCheckboxChange('enableQRPayments', checked as boolean)}
                  />
                </div>
                
                {formData.enableQRPayments && (
                  <div className="space-y-4">
                    {/* QR Providers List */}
                    <div className="space-y-4">
                      {formData.customQRProviders.map((provider, index) => (
                        <div key={provider.id} className="p-4 border border-border rounded-lg bg-background">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">QR Provider #{index + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={provider.enabled}
                                onCheckedChange={(checked) => updateQRProvider(provider.id, 'enabled', checked)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQRProvider(provider.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Provider Name */}
                            <div>
                              <Label htmlFor={`qr-name-${provider.id}`}>Payment Provider Name</Label>
                              <Input
                                id={`qr-name-${provider.id}`}
                                value={provider.name}
                                onChange={(e) => updateQRProvider(provider.id, 'name', e.target.value)}
                                placeholder="e.g., Mercado Pago, PayPal, etc."
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">This name will appear on receipts and payment screens</p>
                            </div>

                            {/* QR Code Upload */}
                            <div>
                              <Label htmlFor={`qr-upload-${provider.id}`}>Upload QR Code Image</Label>
                              <div className="mt-1">
                                <input
                                  id={`qr-upload-${provider.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      updateQRProvider(provider.id, 'file', file)
                                    }
                                  }}
                                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Upload PNG, JPG, or SVG format</p>
                              </div>
                            </div>

                            {/* Fee Settings */}
                            <div>
                              <Label htmlFor={`qr-fee-${provider.id}`}>Transaction Fee (%)</Label>
                              <Input
                                id={`qr-fee-${provider.id}`}
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={provider.feePercentage}
                                onChange={(e) => updateQRProvider(provider.id, 'feePercentage', e.target.value)}
                                placeholder="2.5"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Percentage fee charged by your payment provider</p>
                            </div>

                            <div>
                              <Label htmlFor={`qr-fixed-fee-${provider.id}`}>Fixed Fee (USD)</Label>
                              <Input
                                id={`qr-fixed-fee-${provider.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={provider.fixedFee}
                                onChange={(e) => updateQRProvider(provider.id, 'fixedFee', e.target.value)}
                                placeholder="0.30"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Fixed fee per transaction (if any)</p>
                            </div>
                          </div>

                          {/* QR Code Preview */}
                          {provider.file && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <QrCode className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">QR Code: {provider.file.name}</p>
                                  <p className="text-xs text-muted-foreground">Ready for customer payments</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add New QR Provider Button */}
                      <Button
                        variant="outline"
                        onClick={addQRProvider}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New QR Payment Provider
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">How to Set Up QR Payments</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      1. Contact your bank or payment provider to get your business QR code<br/>
                      2. Download the QR code image from your provider's dashboard<br/>
                      3. Upload the image here and enter your provider's fee structure<br/>
                      4. Display the QR code at your point of sale for customer payments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Payment security and verification requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="requireSignature"
                  checked={formData.requireSignature}
                  onCheckedChange={(checked) => handleCheckboxChange('requireSignature', checked as boolean)}
                />
                <div>
                  <Label htmlFor="requireSignature" className="font-medium">Require Signature</Label>
                  <p className="text-sm text-muted-foreground">Require customer signature for payments over $25</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="requireId"
                  checked={formData.requireId}
                  onCheckedChange={(checked) => handleCheckboxChange('requireId', checked as boolean)}
                />
                <div>
                  <Label htmlFor="requireId" className="font-medium">Require ID Verification</Label>
                  <p className="text-sm text-muted-foreground">Check ID for credit card payments over $50</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="autoSettle"
                  checked={formData.autoSettle}
                  onCheckedChange={(checked) => handleCheckboxChange('autoSettle', checked as boolean)}
                />
                <div>
                  <Label htmlFor="autoSettle" className="font-medium">Automatic Settlement</Label>
                  <p className="text-sm text-muted-foreground">Automatically settle card payments at end of day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={loading.saving}
              className="min-w-[140px]"
            >
              {loading.saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
          
          {/* Error Message */}
          {errors.saving && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Save Failed</p>
                  <p className="text-sm text-destructive/80">{errors.saving}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}