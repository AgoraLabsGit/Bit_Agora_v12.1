'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, ArrowLeft, CheckCircle, CreditCard, Upload, Shield, Globe } from "lucide-react"

interface QRProvider {
  id: string
  name: string
  description: string
  defaultFee: string
  fixedFee: string
  enabled: boolean
  customFee?: string
  customFixedFee?: string
  qrCode?: File | null
}

interface RegionData {
  name: string
  flag: string
  providers: QRProvider[]
}

export default function QRSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [customProviders, setCustomProviders] = useState<QRProvider[]>([])
  
  const [regions, setRegions] = useState<RegionData[]>([
    {
      name: "North America",
      flag: "🇺🇸",
      providers: [
        {
          id: "square",
          name: "Square",
          description: "Popular QR payment system",
          defaultFee: "2.9",
          fixedFee: "0.30",
          enabled: false
        },
        {
          id: "paypal-qr",
          name: "PayPal QR Codes",
          description: "In-person QR transactions",
          defaultFee: "2.29",
          fixedFee: "0.09",
          enabled: false
        },
        {
          id: "venmo-qr",
          name: "Venmo QR Codes",
          description: "Business QR payments",
          defaultFee: "2.29",
          fixedFee: "0.09",
          enabled: false
        },
        {
          id: "upngo",
          name: "Up 'n Go",
          description: "Restaurant-focused QR platform",
          defaultFee: "2.5",
          fixedFee: "0.25",
          enabled: false
        },
        {
          id: "monei-pay",
          name: "MONEI Pay",
          description: "QR payment solution for restaurants",
          defaultFee: "2.5",
          fixedFee: "0.30",
          enabled: false
        },
        {
          id: "sunday",
          name: "Sunday",
          description: "Table-based QR payment system",
          defaultFee: "2.5",
          fixedFee: "0.25",
          enabled: false
        },
        {
          id: "apple-pay",
          name: "Apple Pay",
          description: "QR code integration",
          defaultFee: "2.7",
          fixedFee: "0.30",
          enabled: false
        },
        {
          id: "google-pay",
          name: "Google Pay",
          description: "QR code functionality",
          defaultFee: "2.7",
          fixedFee: "0.30",
          enabled: false
        }
      ]
    },
    {
      name: "South America (Latin America)",
      flag: "🌎",
      providers: [
        {
          id: "mercado-pago",
          name: "Mercado Pago",
          description: "Lower commission rates for QR/Pix payments",
          defaultFee: "3.0",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "pix",
          name: "PIX",
          description: "Instant approval with low merchant fees",
          defaultFee: "0.5",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "modo",
          name: "MODO",
          description: "Argentina's unified banking QR",
          defaultFee: "1.5",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "nequi",
          name: "Nequi",
          description: "Colombia's digital wallet QR",
          defaultFee: "2.0",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "uala",
          name: "Ualá",
          description: "Argentina's alternative QR platform",
          defaultFee: "2.8",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "pagorut",
          name: "PagoRUT",
          description: "Chile's bank-backed QR system",
          defaultFee: "2.5",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "brubank",
          name: "Brubank",
          description: "Argentina's digital bank QR",
          defaultFee: "2.2",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "todopago",
          name: "TodoPago",
          description: "Argentina's QR platform by Prisma",
          defaultFee: "2.8",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "rebill",
          name: "Rebill",
          description: "Multi-country QR platform",
          defaultFee: "3.5",
          fixedFee: "0.00",
          enabled: false
        }
      ]
    },
    {
      name: "Asia",
      flag: "🌏",
      providers: [
        {
          id: "alipay",
          name: "Alipay",
          description: "~0.55% merchant fee for QR payments",
          defaultFee: "0.55",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "wechat-pay",
          name: "WeChat Pay",
          description: "~0.6% merchant fee for QR payments",
          defaultFee: "0.6",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "bharatqr",
          name: "BharatQR",
          description: "India's unified QR system",
          defaultFee: "0.75",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "duitnow",
          name: "DuitNow",
          description: "Malaysia's interoperable QR",
          defaultFee: "1.0",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "khqr",
          name: "KHQR",
          description: "Cambodia's national QR standard",
          defaultFee: "0.8",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "lao-qr",
          name: "LAO QR",
          description: "Laos unified QR system",
          defaultFee: "1.2",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "asean-qr",
          name: "ASEAN Integrated QR",
          description: "Cross-border QR payments",
          defaultFee: "1.5",
          fixedFee: "0.00",
          enabled: false
        }
      ]
    },
    {
      name: "Europe",
      flag: "🌍",
      providers: [
        {
          id: "silkpay",
          name: "Silkpay",
          description: "Paris-based omnichannel QR platform",
          defaultFee: "2.5",
          fixedFee: "0.25",
          enabled: false
        },
        {
          id: "qvik",
          name: "qvik",
          description: "Hungary's QR payment system",
          defaultFee: "1.8",
          fixedFee: "0.00",
          enabled: false
        },
        {
          id: "monei-pay-eu",
          name: "MONEI Pay",
          description: "European QR payment solution",
          defaultFee: "2.3",
          fixedFee: "0.25",
          enabled: false
        }
      ]
    }
  ])

  const updateProvider = (regionIndex: number, providerIndex: number, updates: Partial<QRProvider>) => {
    setRegions(prev => prev.map((region, rIndex) => 
      rIndex === regionIndex 
        ? {
            ...region,
            providers: region.providers.map((provider, pIndex) => 
              pIndex === providerIndex 
                ? { ...provider, ...updates }
                : provider
            )
          }
        : region
    ))
  }

  const handleQRUpload = (regionIndex: number, providerIndex: number, file: File | null) => {
    updateProvider(regionIndex, providerIndex, { qrCode: file })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Save QR configuration
      const qrConfig = regions.reduce((acc, region) => {
        const enabledProviders = region.providers.filter(p => p.enabled)
        if (enabledProviders.length > 0) {
          acc[region.name] = enabledProviders
        }
        return acc
      }, {} as any)
      
      // Add custom providers
      const enabledCustomProviders = customProviders.filter(p => p.enabled)
      if (enabledCustomProviders.length > 0) {
        qrConfig['Custom'] = enabledCustomProviders
      }
      
      // Save QR providers configuration to API
      const response = await fetch('/api/qr-providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrConfig)
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save QR configuration')
      }
      
      console.log('QR configuration saved successfully:', qrConfig)
      
      // Update onboarding progress
      const progressResponse = await fetch('/api/onboarding-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrSetupCompleted: true,
          currentStep: 'completed',
          setupComplete: true
        })
      })
      
      const progressData = await progressResponse.json()
      if (!progressData.success) {
        throw new Error(progressData.error || 'Failed to update progress')
      }
      
      // Mark setup as complete and redirect to dashboard (this is now the final step)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving QR configuration:', error)
      alert(`Failed to save QR configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const addCustomProvider = () => {
    const newProvider: QRProvider = {
      id: `custom-${Date.now()}`,
      name: "",
      description: "",
      defaultFee: "2.5",
      fixedFee: "0.00",
      enabled: true,
      customFee: "",
      customFixedFee: ""
    }
    setCustomProviders(prev => [...prev, newProvider])
  }

  const updateCustomProvider = (index: number, updates: Partial<QRProvider>) => {
    setCustomProviders(prev => prev.map((provider, i) => 
      i === index ? { ...provider, ...updates } : provider
    ))
  }

  const removeCustomProvider = (index: number) => {
    setCustomProviders(prev => prev.filter((_, i) => i !== index))
  }

  const handleCustomQRUpload = (index: number, file: File | null) => {
    updateCustomProvider(index, { qrCode: file })
  }

  const getEnabledProvidersCount = () => {
    const regionCount = regions.reduce((count, region) => 
      count + region.providers.filter(p => p.enabled).length, 0
    )
    const customCount = customProviders.filter(p => p.enabled).length
    return regionCount + customCount
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
              <Link href="/onboarding/payment-setup">
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
            <span className="text-sm font-medium text-foreground">QR Code Setup</span>
            <span className="text-sm text-muted-foreground">Step 4 of 4</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
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
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Set Up QR Code Payments
            </h1>
            <p className="text-muted-foreground">
              Configure regional QR payment systems with customizable fee structures for your business.
            </p>
            {getEnabledProvidersCount() > 0 && (
              <p className="text-sm text-primary mt-2">
                {getEnabledProvidersCount()} QR payment system(s) enabled
              </p>
            )}
          </div>

          <div className="space-y-8">
            {regions.map((region, regionIndex) => (
              <div key={region.name} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{region.flag}</span>
                  <h2 className="text-xl font-semibold text-foreground">{region.name}</h2>
                </div>
                
                <div className="grid gap-4">
                  {region.providers.map((provider, providerIndex) => (
                    <div key={provider.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Checkbox 
                              id={`${region.name}-${provider.id}`}
                              checked={provider.enabled}
                              onCheckedChange={(checked) => 
                                updateProvider(regionIndex, providerIndex, { enabled: checked as boolean })
                              }
                            />
                            <h3 className="font-semibold text-foreground text-lg">{provider.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>
                          
                          {provider.enabled && (
                            <div className="space-y-3">
                              {/* Fee Configuration */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`${provider.id}-fee`}>Processing Fee (%)</Label>
                                  <Input
                                    id={`${provider.id}-fee`}
                                    type="number"
                                    step="0.01"
                                    value={provider.customFee || provider.defaultFee}
                                    onChange={(e) => 
                                      updateProvider(regionIndex, providerIndex, { customFee: e.target.value })
                                    }
                                    placeholder={provider.defaultFee}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Default: {provider.defaultFee}%
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`${provider.id}-fixed`}>Fixed Fee ($)</Label>
                                  <Input
                                    id={`${provider.id}-fixed`}
                                    type="number"
                                    step="0.01"
                                    value={provider.customFixedFee || provider.fixedFee}
                                    onChange={(e) => 
                                      updateProvider(regionIndex, providerIndex, { customFixedFee: e.target.value })
                                    }
                                    placeholder={provider.fixedFee}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Default: ${provider.fixedFee}
                                  </p>
                                </div>
                              </div>

                              {/* QR Code Upload */}
                              <div>
                                <Label htmlFor={`${provider.id}-qr`}>QR Code</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                  <input
                                    id={`${provider.id}-qr`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleQRUpload(regionIndex, providerIndex, e.target.files?.[0] || null)}
                                    className="hidden"
                                  />
                                  <label htmlFor={`${provider.id}-qr`} className="cursor-pointer">
                                    <div className="space-y-2">
                                      <Upload className="mx-auto w-8 h-8 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">
                                        {provider.qrCode ? provider.qrCode.name : "Click to upload QR code"}
                                      </p>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom QR Providers */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  <h2 className="text-xl font-semibold text-foreground">Custom QR Providers</h2>
                </div>
                <Button onClick={addCustomProvider} variant="outline" size="sm">
                  Add Custom Provider
                </Button>
              </div>
              
              {customProviders.length > 0 && (
                <div className="grid gap-4">
                  {customProviders.map((provider, index) => (
                    <div key={provider.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Checkbox 
                              id={`custom-${index}`}
                              checked={provider.enabled}
                              onCheckedChange={(checked) => 
                                updateCustomProvider(index, { enabled: checked as boolean })
                              }
                            />
                            <div className="flex-1">
                              <Input
                                placeholder="Provider Name"
                                value={provider.name}
                                onChange={(e) => updateCustomProvider(index, { name: e.target.value })}
                                className="text-lg font-semibold"
                              />
                            </div>
                            <Button 
                              onClick={() => removeCustomProvider(index)}
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="mb-3">
                            <Input
                              placeholder="Provider Description"
                              value={provider.description}
                              onChange={(e) => updateCustomProvider(index, { description: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          {provider.enabled && (
                            <div className="space-y-3">
                              {/* Fee Configuration */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`custom-${index}-fee`}>Processing Fee (%)</Label>
                                  <Input
                                    id={`custom-${index}-fee`}
                                    type="number"
                                    step="0.01"
                                    value={provider.customFee || provider.defaultFee}
                                    onChange={(e) => 
                                      updateCustomProvider(index, { customFee: e.target.value })
                                    }
                                    placeholder={provider.defaultFee}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`custom-${index}-fixed`}>Fixed Fee ($)</Label>
                                  <Input
                                    id={`custom-${index}-fixed`}
                                    type="number"
                                    step="0.01"
                                    value={provider.customFixedFee || provider.fixedFee}
                                    onChange={(e) => 
                                      updateCustomProvider(index, { customFixedFee: e.target.value })
                                    }
                                    placeholder={provider.fixedFee}
                                  />
                                </div>
                              </div>

                              {/* QR Code Upload */}
                              <div>
                                <Label htmlFor={`custom-${index}-qr`}>QR Code</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                  <input
                                    id={`custom-${index}-qr`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleCustomQRUpload(index, e.target.files?.[0] || null)}
                                    className="hidden"
                                  />
                                  <label htmlFor={`custom-${index}-qr`} className="cursor-pointer">
                                    <div className="space-y-2">
                                      <Upload className="mx-auto w-8 h-8 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">
                                        {provider.qrCode ? provider.qrCode.name : "Click to upload QR code"}
                                      </p>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {customProviders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No custom providers added yet.</p>
                  <p className="text-sm">Add a custom provider to configure your own QR payment system.</p>
                </div>
              )}
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">QR Payment Systems</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Select the QR payment systems used in your region. Fee structures are pre-configured with typical rates but can be customized to match your specific agreements.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" asChild>
              <Link href="/onboarding/payment-setup">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payment Setup
              </Link>
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 