// BitAgora QR Provider Card Component
// Individual QR payment provider management with upload, fees, and controls

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode, Trash2 } from 'lucide-react'
import type { QRProvider } from '../types/payment-settings'

interface QRProviderCardProps {
  provider: QRProvider
  index: number
  onUpdate: (id: string, field: keyof QRProvider, value: string | boolean | File) => void
  onRemove: (id: string) => void
}

export function QRProviderCard({
  provider,
  index,
  onUpdate,
  onRemove
}: QRProviderCardProps) {
  return (
    <div className="p-4 border border-border rounded-lg bg-background">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">QR Provider #{index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={provider.enabled}
            onCheckedChange={(checked) => onUpdate(provider.id, 'enabled', checked as boolean)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(provider.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider Name */}
        <div>
          <Label htmlFor={`qr-name-${provider.id}`}>Payment Provider Name</Label>
          <Input
            id={`qr-name-${provider.id}`}
            value={provider.name}
            onChange={(e) => onUpdate(provider.id, 'name', e.target.value)}
            placeholder="e.g., Mercado Pago, PayPal, etc."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This name will appear on receipts and payment screens
          </p>
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
                  onUpdate(provider.id, 'file', file)
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
            onChange={(e) => onUpdate(provider.id, 'feePercentage', e.target.value)}
            placeholder="2.5"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Percentage fee charged by your payment provider
          </p>
        </div>

        <div>
          <Label htmlFor={`qr-fixed-fee-${provider.id}`}>Fixed Fee (USD)</Label>
          <Input
            id={`qr-fixed-fee-${provider.id}`}
            type="number"
            step="0.01"
            min="0"
            value={provider.fixedFee}
            onChange={(e) => onUpdate(provider.id, 'fixedFee', e.target.value)}
            placeholder="0.30"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Fixed fee per transaction (if any)
          </p>
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
  )
} 