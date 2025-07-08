// BitAgora Cryptocurrency Option Component
// Individual crypto payment option with wallet address and discount configuration

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface CryptocurrencyOptionProps {
  // Crypto Information
  name: string
  description: string
  walletPlaceholder: string
  discountPlaceholder?: string
  
  // Form Data
  enabled: boolean
  walletAddress: string
  discount: string
  
  // Event Handlers
  onEnabledChange: (enabled: boolean) => void
  onWalletAddressChange: (address: string) => void
  onDiscountChange: (discount: string) => void
  
  // Field IDs for accessibility
  walletFieldId: string
  discountFieldId: string
}

export function CryptocurrencyOption({
  name,
  description,
  walletPlaceholder,
  discountPlaceholder = "2.5",
  enabled,
  walletAddress,
  discount,
  onEnabledChange,
  onWalletAddressChange,
  onDiscountChange,
  walletFieldId,
  discountFieldId
}: CryptocurrencyOptionProps) {
  return (
    <div className="p-4 border border-border rounded-lg">
      {/* Header with Enable/Disable */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Checkbox 
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {/* Configuration Fields */}
      {enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Wallet Address Field */}
          <div>
            <Label htmlFor={walletFieldId}>
              {name.includes('Lightning') ? 'Lightning Address' : `${name} Wallet Address`}
            </Label>
            <div className="relative">
              <Input
                id={walletFieldId}
                value={walletAddress}
                onChange={(e) => onWalletAddressChange(e.target.value)}
                placeholder={walletPlaceholder}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              QR code will be generated automatically at checkout
            </p>
          </div>
          
          {/* Discount Field */}
          <div>
            <Label htmlFor={discountFieldId}>
              {name} Discount (%)
            </Label>
            <Input
              id={discountFieldId}
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
              placeholder={discountPlaceholder}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Discount to encourage {name} payments (optional)
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 