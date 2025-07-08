// BitAgora Cryptocurrency Option Component
// Individual crypto payment option with wallet address and discount configuration
// Enhanced with real-time validation

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ValidatedInput } from './ValidatedInput'

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
  
  // Determine crypto type for validation
  const getCryptoType = (cryptoName: string): string => {
    if (cryptoName.includes('Lightning')) return 'lightning'
    if (cryptoName.includes('Bitcoin')) return 'bitcoin'
    if (cryptoName.includes('USDT') && cryptoName.includes('Ethereum')) return 'usdt_ethereum'
    if (cryptoName.includes('USDT') && cryptoName.includes('Tron')) return 'usdt_tron'
    if (cryptoName.includes('Ethereum')) return 'ethereum'
    if (cryptoName.includes('Tron')) return 'tron'
    return 'bitcoin' // default
  }
  
  const cryptoType = getCryptoType(name)
  
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
          {/* Wallet Address Field with Validation */}
          <ValidatedInput
            id={walletFieldId}
            label={name.includes('Lightning') ? 'Lightning Address' : `${name} Wallet Address`}
            value={walletAddress}
            onChange={onWalletAddressChange}
            placeholder={walletPlaceholder}
            description="QR code will be generated automatically at checkout"
            validationOptions={{
              required: false,
              cryptoType: cryptoType,
              debounceMs: 750 // Slightly longer debounce for crypto validation
            }}
          />
          
          {/* Discount Field with Enhanced Validation */}
          <ValidatedInput
            id={discountFieldId}
            label={`${name} Discount (%)`}
            type="number"
            value={discount}
            onChange={onDiscountChange}
            placeholder={discountPlaceholder}
            description={`Discount to encourage ${name} payments (optional)`}
            validationOptions={{
              required: false,
              pattern: /^\d*\.?\d*$/,
              customValidator: (value: string) => {
                if (!value.trim()) return { isValid: true }
                const num = parseFloat(value)
                if (isNaN(num)) {
                  return { isValid: false, error: 'Must be a valid number' }
                }
                if (num < 0) {
                  return { isValid: false, error: 'Discount cannot be negative' }
                }
                if (num > 20) {
                  return { isValid: false, error: 'Discount cannot exceed 20%' }
                }
                return { 
                  isValid: true, 
                  details: { discountAmount: `${num}%` }
                }
              },
              debounceMs: 300
            }}
          />
        </div>
      )}
    </div>
  )
} 