"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Zap, 
  ArrowLeft, 
  Save, 
  Settings, 
  Calculator,
  Globe,
  Eye,
  EyeOff,
  Percent,
  AlertCircle,
  Check
} from "lucide-react"
import { TaxConfiguration, TAX_PRESETS } from '@/lib/tax-calculation'

export default function TaxSettingsPage() {
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Load tax settings
  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/tax-settings')
        const result = await response.json()
        
        if (result.success && result.data) {
          setTaxConfig(result.data)
        } else {
          // Use default configuration if none exists
          setTaxConfig({
            enabled: false,
            defaultRate: 0.10,
            taxType: 'VAT',
            country: 'Generic',
            includeTaxInPrice: false,
            roundingMethod: 'round',
            taxName: 'Tax',
            showTaxLine: true,
            allowManualTaxEntry: true,
          })
        }
      } catch (error) {
        console.error('Error loading tax settings:', error)
        setError('Failed to load tax settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadTaxSettings()
  }, [])

  // Save tax settings
  const handleSave = async () => {
    if (!taxConfig) return
    
    try {
      setIsSaving(true)
      setSaveStatus('idle')
      
      const response = await fetch('/api/tax-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taxConfig)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setError(result.error || 'Failed to save tax settings')
      }
    } catch (error) {
      console.error('Error saving tax settings:', error)
      setSaveStatus('error')
      setError('Failed to save tax settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Apply preset configuration
  const handleApplyPreset = async (countryCode: string) => {
    const preset = TAX_PRESETS[countryCode]
    if (!preset) return
    
    try {
      setIsSaving(true)
      const response = await fetch('/api/tax-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preset)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTaxConfig(result.data)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setError(result.error || 'Failed to apply preset')
      }
    } catch (error) {
      console.error('Error applying preset:', error)
      setError('Failed to apply preset')
    } finally {
      setIsSaving(false)
    }
  }

  // Update tax configuration
  const updateConfig = (updates: Partial<TaxConfiguration>) => {
    if (!taxConfig) return
    setTaxConfig({ ...taxConfig, ...updates })
  }

  const formatPercent = (rate: number) => `${(rate * 100).toFixed(1)}%`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-lg text-muted-foreground">Loading tax settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!taxConfig) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg text-destructive">Failed to load tax settings</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Tax Settings</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Settings saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Save failed</span>
                </div>
              )}
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tax Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Tax Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Basic Tax Settings</h2>
              </div>
              
              <div className="space-y-6">
                {/* Tax Enabled */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Tax Calculation</Label>
                    <p className="text-sm text-muted-foreground">Turn on tax calculation for all transactions</p>
                  </div>
                  <Button
                    variant={taxConfig.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig({ enabled: !taxConfig.enabled })}
                  >
                    {taxConfig.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {taxConfig.enabled && (
                  <>
                    {/* Tax Rate */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxConfig.defaultRate * 100).toFixed(2)}
                          onChange={(e) => updateConfig({ defaultRate: parseFloat(e.target.value) / 100 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax-name">Tax Name</Label>
                        <Input
                          id="tax-name"
                          value={taxConfig.taxName}
                          onChange={(e) => updateConfig({ taxName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Tax Type */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Tax Type</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['VAT', 'SALES_TAX', 'GST', 'IVA'].map((type) => (
                          <Button
                            key={type}
                            variant={taxConfig.taxType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateConfig({ taxType: type as any })}
                          >
                            {type.replace('_', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Tax Inclusion */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Tax Calculation Method</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          variant={!taxConfig.includeTaxInPrice ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateConfig({ includeTaxInPrice: false })}
                          className="justify-start text-left h-auto p-4"
                        >
                          <div>
                            <div className="font-medium">Tax Exclusive</div>
                            <div className="text-xs text-muted-foreground">Tax added to price (US style)</div>
                          </div>
                        </Button>
                        <Button
                          variant={taxConfig.includeTaxInPrice ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateConfig({ includeTaxInPrice: true })}
                          className="justify-start text-left h-auto p-4"
                        >
                          <div>
                            <div className="font-medium">Tax Inclusive</div>
                            <div className="text-xs text-muted-foreground">Tax included in price (Argentina/EU style)</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Display Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Display Settings</h2>
              </div>
              
              <div className="space-y-6">
                {/* Show Tax Line */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Tax Breakdown</Label>
                    <p className="text-sm text-muted-foreground">Display tax as separate line items vs. total only</p>
                  </div>
                  <Button
                    variant={taxConfig.showTaxLine ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig({ showTaxLine: !taxConfig.showTaxLine })}
                  >
                    {taxConfig.showTaxLine ? 'Show Details' : 'Total Only'}
                  </Button>
                </div>

                {/* Preview */}
                <div className="bg-background rounded-lg border border-border p-4">
                  <h3 className="text-sm font-medium mb-3">Receipt Preview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sample Product</span>
                      <span>$10.00</span>
                    </div>
                    
                    {taxConfig.showTaxLine && taxConfig.enabled && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>${taxConfig.includeTaxInPrice ? (10 / (1 + taxConfig.defaultRate)).toFixed(2) : '10.00'}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{taxConfig.taxName} ({formatPercent(taxConfig.defaultRate)}):</span>
                          <span>${taxConfig.includeTaxInPrice ? (10 - (10 / (1 + taxConfig.defaultRate))).toFixed(2) : (10 * taxConfig.defaultRate).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>${taxConfig.includeTaxInPrice ? '10.00' : (10 * (1 + taxConfig.defaultRate)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Manual Tax Entry */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Percent className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Manual Tax Entry</h2>
              </div>
              
              <div className="space-y-6">
                {/* Allow Manual Tax Entry */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow Manual Tax Override</Label>
                    <p className="text-sm text-muted-foreground">Enable custom tax rates for specific transactions</p>
                  </div>
                  <Button
                    variant={taxConfig.allowManualTaxEntry ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig({ allowManualTaxEntry: !taxConfig.allowManualTaxEntry })}
                  >
                    {taxConfig.allowManualTaxEntry ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {taxConfig.allowManualTaxEntry && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="manual-tax-rate">Manual Tax Rate (%)</Label>
                      <Input
                        id="manual-tax-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={taxConfig.manualTaxRate ? (taxConfig.manualTaxRate * 100).toFixed(2) : ''}
                        onChange={(e) => updateConfig({ 
                          manualTaxRate: e.target.value ? parseFloat(e.target.value) / 100 : undefined 
                        })}
                        placeholder="Leave blank to use default"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-tax-name">Manual Tax Name</Label>
                      <Input
                        id="manual-tax-name"
                        value={taxConfig.manualTaxName || ''}
                        onChange={(e) => updateConfig({ manualTaxName: e.target.value || undefined })}
                        placeholder="Leave blank to use default"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Settings Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Settings</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={taxConfig.enabled ? 'text-green-600' : 'text-red-600'}>
                    {taxConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {taxConfig.enabled && (
                  <>
                    <div className="flex justify-between">
                      <span>Tax Rate:</span>
                      <span>{formatPercent(taxConfig.manualTaxRate || taxConfig.defaultRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Name:</span>
                      <span>{taxConfig.manualTaxName || taxConfig.taxName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span>{taxConfig.includeTaxInPrice ? 'Inclusive' : 'Exclusive'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Display:</span>
                      <span>{taxConfig.showTaxLine ? 'Show Details' : 'Total Only'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual Entry:</span>
                      <span>{taxConfig.allowManualTaxEntry ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Regional Presets */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Regional Presets</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(TAX_PRESETS).map(([code, preset]) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(code)}
                    disabled={isSaving}
                    className="w-full justify-between"
                  >
                    <span>{preset.country}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPercent(preset.defaultRate)}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 