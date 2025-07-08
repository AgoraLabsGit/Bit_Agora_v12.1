// BitAgora QR Providers Section Component
// Complete QR payment providers section with instructions and management

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, Plus, QrCode } from 'lucide-react'
import { QRProviderCard } from './QRProviderCard'
import type { QRProvider } from '../types/payment-settings'

interface QRProvidersSectionProps {
  enableQRPayments: boolean
  qrProviders: QRProvider[]
  onToggleQRPayments: (enabled: boolean) => void
  onAddProvider: () => void
  onUpdateProvider: (id: string, field: keyof QRProvider, value: string | boolean | File) => void
  onRemoveProvider: (id: string) => void
}

export function QRProvidersSection({
  enableQRPayments,
  qrProviders,
  onToggleQRPayments,
  onAddProvider,
  onUpdateProvider,
  onRemoveProvider
}: QRProvidersSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Custom QR Payment Systems
        </CardTitle>
        <CardDescription>Add your own QR payment providers with custom names and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Enable QR Payments Toggle */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Enable QR Payments</h3>
              <p className="text-sm text-muted-foreground">Accept payments via QR codes from your payment providers</p>
            </div>
            <Checkbox 
              id="enableQRPayments" 
              checked={enableQRPayments}
              onCheckedChange={onToggleQRPayments}
            />
          </div>
          
          {/* QR Provider Management */}
          {enableQRPayments && (
            <div className="space-y-4">
              {/* QR Providers List */}
              <div className="space-y-4">
                {qrProviders.map((provider, index) => (
                  <QRProviderCard
                    key={provider.id}
                    provider={provider}
                    index={index}
                    onUpdate={onUpdateProvider}
                    onRemove={onRemoveProvider}
                  />
                ))}

                {/* Add New QR Provider Button */}
                <Button
                  variant="outline"
                  onClick={onAddProvider}
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
  )
} 