"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, ArrowLeft, CheckCircle, CreditCard, Wallet, Bitcoin, Shield, AlertTriangle, Upload, ExternalLink } from "lucide-react"
import { validateCryptoAddress, getCurrencyInfo } from "@/lib/crypto-validation"

export default function PaymentSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Crypto Options
    acceptBitcoin: false,
    acceptBitcoinLightning: false,
    acceptUsdtEthereum: false,
    acceptUsdtTron: false,
    
    // Crypto Wallets
    bitcoinWalletAddress: "",
    bitcoinLightningAddress: "",
    usdtEthereumWalletAddress: "",
    usdtTronWalletAddress: "",
    
    // Payment Processors
    stripeEnabled: false,
    paypalEnabled: false,
    squareEnabled: false,
    
    // API Keys (mock - would be encrypted in production)
    stripeApiKey: "",
    paypalClientId: "",
    squareApplicationId: "",
    
    // Settings
    acceptCash: true,
    acceptCards: true,
    
    // Payment Method Specific Fees
    fees: {
      cash: "0",
      bitcoin: "0",
      bitcoinLightning: "0",
      usdtEthereum: "0",
      usdtTron: "0",
      stripe: "2.9",
      paypal: "3.5",
      square: "2.6"
    },
    
    // Security
    requireSignature: true,
    requireId: false,
    autoSettle: true
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [validationSuccess, setValidationSuccess] = useState<Record<string, boolean>>({})

  // Load data from API on component mount
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load payment settings
        const settingsResponse = await fetch('/api/payment-settings')
        const settingsData = await settingsResponse.json()
        
        // Load payment fees
        const feesResponse = await fetch('/api/payment-fees')
        const feesData = await feesResponse.json()
        
        // Load payment credentials
        const credentialsResponse = await fetch('/api/payment-credentials')
        const credentialsData = await credentialsResponse.json()
        
        if (settingsData.success && feesData.success && credentialsData.success) {
          const settings = settingsData.data
          const fees = feesData.data
          const credentials = credentialsData.data
          
          // Convert fees array to object
          const feesObject = fees.reduce((acc: any, fee: any) => {
            acc[fee.paymentMethod] = fee.percentageFee.toString()
            return acc
          }, {})
          
          // Extract credentials
          const stripeCredentials = credentials.find((c: any) => c.processorName === 'stripe')
          const paypalCredentials = credentials.find((c: any) => c.processorName === 'paypal')
          const squareCredentials = credentials.find((c: any) => c.processorName === 'square')
          
          setFormData({
            // Payment Methods
            acceptCash: settings.acceptCash,
            acceptCards: settings.acceptCards,
            acceptBitcoin: settings.acceptBitcoin,
            acceptBitcoinLightning: settings.acceptBitcoinLightning,
            acceptUsdtEthereum: settings.acceptUsdtEthereum,
            acceptUsdtTron: settings.acceptUsdtTron,
            
            // Wallet Addresses
            bitcoinWalletAddress: settings.bitcoinWalletAddress || "",
            bitcoinLightningAddress: settings.bitcoinLightningAddress || "",
            usdtEthereumWalletAddress: settings.usdtEthereumWalletAddress || "",
            usdtTronWalletAddress: settings.usdtTronWalletAddress || "",
            
            // Payment Processors
            stripeEnabled: settings.stripeEnabled,
            paypalEnabled: settings.paypalEnabled,
            squareEnabled: settings.squareEnabled,
            
            // API Keys
            stripeApiKey: stripeCredentials?.apiKeyEncrypted || "",
            paypalClientId: paypalCredentials?.clientIdEncrypted || "",
            squareApplicationId: squareCredentials?.applicationIdEncrypted || "",
            
            // Fees
            fees: feesObject,
            
            // Security
            requireSignature: settings.requireSignature,
            requireId: settings.requireId,
            autoSettle: settings.autoSettle
          })
        }
      } catch (error) {
        console.error('Failed to load payment data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadPaymentData()
  }, [])

  const validateAddress = (field: string, address: string, expectedType: string) => {
    if (!address.trim()) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
      setValidationSuccess(prev => ({ ...prev, [field]: false }))
      return
    }

    const result = validateCryptoAddress(address, expectedType)
    
    if (result.isValid) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
      setValidationSuccess(prev => ({ ...prev, [field]: true }))
    } else {
      setValidationErrors(prev => ({ ...prev, [field]: result.error || 'Invalid address' }))
      setValidationSuccess(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('fees.')) {
      const feeType = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        fees: {
          ...prev.fees,
          [feeType]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))

      // Real-time validation for crypto addresses
      if (field === 'bitcoinWalletAddress') {
        validateAddress(field, value, 'bitcoin')
      } else if (field === 'bitcoinLightningAddress') {
        validateAddress(field, value, 'lightning')
      } else if (field === 'usdtEthereumWalletAddress') {
        validateAddress(field, value, 'usdt_ethereum')
      } else if (field === 'usdtTronWalletAddress') {
        validateAddress(field, value, 'usdt_tron')
      }
    }
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Save payment settings
      const settingsResponse = await fetch('/api/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptCash: formData.acceptCash,
          acceptCards: formData.acceptCards,
          acceptBitcoin: formData.acceptBitcoin,
          acceptBitcoinLightning: formData.acceptBitcoinLightning,
          acceptUsdtEthereum: formData.acceptUsdtEthereum,
          acceptUsdtTron: formData.acceptUsdtTron,
          bitcoinWalletAddress: formData.bitcoinWalletAddress,
          bitcoinLightningAddress: formData.bitcoinLightningAddress,
          usdtEthereumWalletAddress: formData.usdtEthereumWalletAddress,
          usdtTronWalletAddress: formData.usdtTronWalletAddress,
          stripeEnabled: formData.stripeEnabled,
          paypalEnabled: formData.paypalEnabled,
          squareEnabled: formData.squareEnabled,
          requireSignature: formData.requireSignature,
          requireId: formData.requireId,
          autoSettle: formData.autoSettle
        })
      })
      
      const settingsData = await settingsResponse.json()
      if (!settingsData.success) {
        throw new Error(settingsData.error || 'Failed to save payment settings')
      }
      
      // Save payment credentials
      const credentialsPromises = []
      
      if (formData.stripeEnabled && formData.stripeApiKey) {
        credentialsPromises.push(
          fetch('/api/payment-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              processorName: 'stripe',
              apiKeyEncrypted: formData.stripeApiKey,
              environment: 'sandbox',
              active: true
            })
          })
        )
      }
      
      if (formData.paypalEnabled && formData.paypalClientId) {
        credentialsPromises.push(
          fetch('/api/payment-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              processorName: 'paypal',
              clientIdEncrypted: formData.paypalClientId,
              environment: 'sandbox',
              active: true
            })
          })
        )
      }
      
      if (formData.squareEnabled && formData.squareApplicationId) {
        credentialsPromises.push(
          fetch('/api/payment-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              processorName: 'square',
              applicationIdEncrypted: formData.squareApplicationId,
              environment: 'sandbox',
              active: true
            })
          })
        )
      }
      
      await Promise.all(credentialsPromises)
      
      // Save payment fees
      const feesArray = Object.entries(formData.fees).map(([paymentMethod, percentageFee]) => ({
        paymentMethod,
        percentageFee: parseFloat(percentageFee as string),
        fixedFee: paymentMethod === 'stripe' ? 0.3 : 
                 paymentMethod === 'paypal' ? 0.3 :
                 paymentMethod === 'square' ? 0.1 : 0,
        currency: 'USD',
        active: true
      }))
      
      const feesResponse = await fetch('/api/payment-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feesArray)
      })
      
      const feesData = await feesResponse.json()
      if (!feesData.success) {
        throw new Error(feesData.error || 'Failed to save payment fees')
      }
      
      // Update onboarding progress
      const progressResponse = await fetch('/api/onboarding-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentSetupCompleted: true,
          currentStep: 'qr-setup'
        })
      })
      
      const progressData = await progressResponse.json()
      if (!progressData.success) {
        throw new Error(progressData.error || 'Failed to update progress')
      }
      
      console.log("Payment setup saved successfully")
      
      // Redirect to QR setup
      router.push('/onboarding/qr-setup')
    } catch (error) {
      console.error("Setup failed:", error)
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-light tracking-tight">
                <span className="text-foreground">Bit</span>
                <span className="font-semibold text-foreground">Agora</span>
              </span>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/onboarding/business-setup">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Setup Progress</span>
            <span className="text-sm text-muted-foreground">Step 3 of 4</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Admin Setup</span>
            <span>Business Setup</span>
            <span>Payment Setup</span>
            <span>QR Setup</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-8">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading payment settings...</p>
            </div>
          ) : (
            <>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Set Up Payment Methods
            </h1>
            <p className="text-muted-foreground">
              Configure your crypto wallets and payment processors to complete your payment setup.
            </p>
          </div>

          <div className="space-y-8">
            {/* Cash Payments */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Cash Payments</h2>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
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
              </div>
            </div>

            {/* Card Payments */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Card Payments</h2>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Accept Credit/Debit Cards</h3>
                    <p className="text-sm text-muted-foreground">Card payments processed via configured payment processors below</p>
                  </div>
                  <Checkbox 
                    id="acceptCards" 
                    checked={formData.acceptCards}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptCards', checked as boolean)}
                  />
                </div>
              </div>
            </div>

            {/* Cryptocurrency Payments */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Bitcoin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Cryptocurrency Payments</h2>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      In production, wallet addresses would be validated and encrypted. For testing, you can enter any valid-format addresses.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
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
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bitcoinWalletAddress">Bitcoin Wallet Address</Label>
                        <Input
                          id="bitcoinWalletAddress"
                          value={formData.bitcoinWalletAddress}
                          onChange={(e) => handleInputChange('bitcoinWalletAddress', e.target.value)}
                          placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                          className={`mt-2 ${
                            validationErrors.bitcoinWalletAddress 
                              ? "border-destructive" 
                              : validationSuccess.bitcoinWalletAddress 
                                ? "border-green-500" 
                                : ""
                          }`}
                        />
                        {validationErrors.bitcoinWalletAddress && (
                          <p className="text-sm text-destructive mt-1">{validationErrors.bitcoinWalletAddress}</p>
                        )}
                        {validationSuccess.bitcoinWalletAddress && (
                          <p className="text-sm text-green-600 mt-1">✅ Valid Bitcoin address</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports Legacy (1...), SegWit (3...), and Native SegWit (bc1...) addresses
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="bitcoinFee">Processing Fee (%)</Label>
                        <Input
                          id="bitcoinFee"
                          type="number"
                          step="0.1"
                          value={formData.fees.bitcoin}
                          onChange={(e) => handleInputChange('fees.bitcoin', e.target.value)}
                          placeholder="0"
                          disabled
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">No merchant fees - you receive BTC directly</p>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Need a Bitcoin wallet?</p>
                        <a 
                          href="https://muun.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Get Muun Wallet <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bitcoin Lightning */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Bitcoin Lightning</h3>
                      <p className="text-sm text-muted-foreground">Accept instant Bitcoin Lightning payments</p>
                    </div>
                    <Checkbox 
                      id="acceptBitcoinLightning" 
                      checked={formData.acceptBitcoinLightning}
                      onCheckedChange={(checked) => handleCheckboxChange('acceptBitcoinLightning', checked as boolean)}
                    />
                  </div>
                  
                  {formData.acceptBitcoinLightning && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bitcoinLightningAddress">Bitcoin Lightning Address</Label>
                        <Input
                          id="bitcoinLightningAddress"
                          value={formData.bitcoinLightningAddress}
                          onChange={(e) => handleInputChange('bitcoinLightningAddress', e.target.value)}
                          placeholder="lnbc1500n1ps0jyppqxyz..."
                          className={`mt-2 ${
                            validationErrors.bitcoinLightningAddress 
                              ? "border-destructive" 
                              : validationSuccess.bitcoinLightningAddress 
                                ? "border-green-500" 
                                : ""
                          }`}
                        />
                        {validationErrors.bitcoinLightningAddress && (
                          <p className="text-sm text-destructive mt-1">{validationErrors.bitcoinLightningAddress}</p>
                        )}
                        {validationSuccess.bitcoinLightningAddress && (
                          <p className="text-sm text-green-600 mt-1">✅ Valid Lightning invoice</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          BOLT-11 Lightning Network payment request
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="lightningFee">Processing Fee (%)</Label>
                        <Input
                          id="lightningFee"
                          type="number"
                          step="0.1"
                          value={formData.fees.bitcoinLightning}
                          onChange={(e) => handleInputChange('fees.bitcoinLightning', e.target.value)}
                          placeholder="0"
                          disabled
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">No merchant fees - instant Bitcoin payments</p>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Need a Lightning wallet?</p>
                        <a 
                          href="https://muun.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Get Muun Wallet <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* USDT Ethereum */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">USDT (Ethereum Network)</h3>
                      <p className="text-sm text-muted-foreground">Accept USDT on Ethereum blockchain</p>
                    </div>
                                        <Checkbox 
                      id="acceptUsdtEthereum"
                      checked={formData.acceptUsdtEthereum}
                      onCheckedChange={(checked) => handleCheckboxChange('acceptUsdtEthereum', checked as boolean)}
                    />
                  </div>
                  
                                      {formData.acceptUsdtEthereum && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="usdtEthereumWalletAddress">USDT Ethereum Wallet Address</Label>
                          <Input
                            id="usdtEthereumWalletAddress"
                            value={formData.usdtEthereumWalletAddress}
                            onChange={(e) => handleInputChange('usdtEthereumWalletAddress', e.target.value)}
                            placeholder="0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
                            className={`mt-2 ${
                              validationErrors.usdtEthereumWalletAddress 
                                ? "border-destructive" 
                                : validationSuccess.usdtEthereumWalletAddress 
                                  ? "border-green-500" 
                                  : ""
                            }`}
                          />
                          {validationErrors.usdtEthereumWalletAddress && (
                            <p className="text-sm text-destructive mt-1">{validationErrors.usdtEthereumWalletAddress}</p>
                          )}
                          {validationSuccess.usdtEthereumWalletAddress && (
                            <p className="text-sm text-green-600 mt-1">✅ Valid Ethereum address</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            ERC-20 USDT token address on Ethereum network
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="usdtEthFee">Processing Fee (%)</Label>
                          <Input
                            id="usdtEthFee"
                            type="number"
                            step="0.1"
                            value={formData.fees.usdtEthereum}
                            onChange={(e) => handleInputChange('fees.usdtEthereum', e.target.value)}
                            placeholder="0"
                            disabled
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">No merchant fees - you receive USDT directly</p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Need a USDT wallet?</p>
                          <a 
                            href="https://trustwallet.com/usdt-wallet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Get Trust Wallet <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                </div>

                {/* USDT Tron */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">USDT (Tron Network)</h3>
                      <p className="text-sm text-muted-foreground">Accept USDT on Tron blockchain</p>
                    </div>
                                        <Checkbox 
                      id="acceptUsdtTron"
                      checked={formData.acceptUsdtTron}
                      onCheckedChange={(checked) => handleCheckboxChange('acceptUsdtTron', checked as boolean)}
                    />
                  </div>
                  
                                      {formData.acceptUsdtTron && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="usdtTronWalletAddress">USDT Tron Wallet Address</Label>
                          <Input
                            id="usdtTronWalletAddress"
                            value={formData.usdtTronWalletAddress}
                            onChange={(e) => handleInputChange('usdtTronWalletAddress', e.target.value)}
                            placeholder="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                            className={`mt-2 ${
                              validationErrors.usdtTronWalletAddress 
                                ? "border-destructive" 
                                : validationSuccess.usdtTronWalletAddress 
                                  ? "border-green-500" 
                                  : ""
                            }`}
                          />
                          {validationErrors.usdtTronWalletAddress && (
                            <p className="text-sm text-destructive mt-1">{validationErrors.usdtTronWalletAddress}</p>
                          )}
                          {validationSuccess.usdtTronWalletAddress && (
                            <p className="text-sm text-green-600 mt-1">✅ Valid Tron address</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            TRC-20 USDT token address on Tron network
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="usdtTronFee">Processing Fee (%)</Label>
                          <Input
                            id="usdtTronFee"
                            type="number"
                            step="0.1"
                            value={formData.fees.usdtTron}
                            onChange={(e) => handleInputChange('fees.usdtTron', e.target.value)}
                            placeholder="0"
                            disabled
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">No merchant fees - you receive USDT directly</p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Need a USDT wallet?</p>
                          <a 
                            href="https://trustwallet.com/usdt-wallet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Get Trust Wallet <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Payment Processors */}
            {formData.acceptCards && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Payment Processors</h2>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">API Keys & Processor Settings</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        API keys would be encrypted and stored securely. Each processor has built-in minimum transaction amounts and fee structures.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Stripe */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Stripe</h3>
                        <p className="text-sm text-muted-foreground">Online payments and card processing</p>
                      </div>
                      <Checkbox 
                        id="stripeEnabled" 
                        checked={formData.stripeEnabled}
                        onCheckedChange={(checked) => handleCheckboxChange('stripeEnabled', checked as boolean)}
                      />
                    </div>
                    
                    {formData.stripeEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stripeApiKey">Stripe API Key</Label>
                          <Input
                            id="stripeApiKey"
                            type="password"
                            value={formData.stripeApiKey}
                            onChange={(e) => handleInputChange('stripeApiKey', e.target.value)}
                            placeholder="sk_test_..."
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="stripeFee">Processing Fee (%)</Label>
                          <Input
                            id="stripeFee"
                            type="number"
                            step="0.1"
                            value={formData.fees.stripe}
                            onChange={(e) => handleInputChange('fees.stripe', e.target.value)}
                            placeholder="2.9"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Stripe: 2.9% + $0.30 per transaction</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* PayPal */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">PayPal</h3>
                        <p className="text-sm text-muted-foreground">PayPal payments and checkout</p>
                      </div>
                      <Checkbox 
                        id="paypalEnabled" 
                        checked={formData.paypalEnabled}
                        onCheckedChange={(checked) => handleCheckboxChange('paypalEnabled', checked as boolean)}
                      />
                    </div>
                    
                    {formData.paypalEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                          <Input
                            id="paypalClientId"
                            value={formData.paypalClientId}
                            onChange={(e) => handleInputChange('paypalClientId', e.target.value)}
                            placeholder="AX-xxx..."
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="paypalFee">Processing Fee (%)</Label>
                          <Input
                            id="paypalFee"
                            type="number"
                            step="0.1"
                            value={formData.fees.paypal}
                            onChange={(e) => handleInputChange('fees.paypal', e.target.value)}
                            placeholder="3.5"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">PayPal: 3.5% + $0.30 per transaction</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Square */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Square</h3>
                        <p className="text-sm text-muted-foreground">Square card reader integration</p>
                      </div>
                      <Checkbox 
                        id="squareEnabled" 
                        checked={formData.squareEnabled}
                        onCheckedChange={(checked) => handleCheckboxChange('squareEnabled', checked as boolean)}
                      />
                    </div>
                    
                    {formData.squareEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="squareApplicationId">Square Application ID</Label>
                          <Input
                            id="squareApplicationId"
                            value={formData.squareApplicationId}
                            onChange={(e) => handleInputChange('squareApplicationId', e.target.value)}
                            placeholder="sq0idp-..."
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="squareFee">Processing Fee (%)</Label>
                          <Input
                            id="squareFee"
                            type="number"
                            step="0.1"
                            value={formData.fees.square}
                            onChange={(e) => handleInputChange('fees.square', e.target.value)}
                            placeholder="2.6"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Square: 2.6% + $0.10 per transaction</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requireSignature" 
                    checked={formData.requireSignature}
                    onCheckedChange={(checked) => handleCheckboxChange('requireSignature', checked as boolean)}
                  />
                  <Label htmlFor="requireSignature">Require signature for card transactions</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requireId" 
                    checked={formData.requireId}
                    onCheckedChange={(checked) => handleCheckboxChange('requireId', checked as boolean)}
                  />
                  <Label htmlFor="requireId">Require ID verification for large transactions</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoSettle" 
                    checked={formData.autoSettle}
                    onCheckedChange={(checked) => handleCheckboxChange('autoSettle', checked as boolean)}
                  />
                  <Label htmlFor="autoSettle">Automatically settle transactions daily</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Next Step Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">What's Next?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  After completing payment setup, you'll configure QR code payment options like regional digital wallets, 
                  mobile payment apps, and custom QR providers to give your customers even more payment choices.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t border-border">
            <Button variant="outline" asChild>
              <Link href="/onboarding/business-setup">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Business Setup
              </Link>
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                "Completing Setup..."
              ) : (
                <>
                  Continue to QR Setup
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 