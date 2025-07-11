// BitAgora Cryptocurrency Section Component
// Complete cryptocurrency payments section with Bitcoin, Lightning, and USDT options

import React from 'react'
import { Wallet, Zap } from 'lucide-react'
import { PaymentMethodCard } from './PaymentMethodCard'
import { CryptocurrencyOption } from './CryptocurrencyOption'
import { ValidatedInput } from './ValidatedInput'

interface CryptocurrencyData {
  acceptBitcoin: boolean
  acceptBitcoinLightning: boolean
  acceptUsdtEthereum: boolean
  acceptUsdtTron: boolean
  bitcoinWalletAddress: string
  bitcoinLightningAddress: string
  usdtEthereumWalletAddress: string
  usdtTronWalletAddress: string
  bitcoinDiscount: string
  lightningDiscount: string
  usdtEthDiscount: string
  usdtTronDiscount: string
  strikeApiKey: string
}

interface CryptocurrencySectionProps {
  data: CryptocurrencyData
  onFieldChange: (field: keyof CryptocurrencyData, value: string | boolean) => void
}

export function CryptocurrencySection({
  data,
  onFieldChange
}: CryptocurrencySectionProps) {
  // Check if any crypto payment is enabled
  const anyCryptoEnabled = data.acceptBitcoin || 
                          data.acceptBitcoinLightning || 
                          data.acceptUsdtEthereum || 
                          data.acceptUsdtTron

  return (
    <PaymentMethodCard
      title="Cryptocurrency Payments"
      description="Bitcoin, Lightning Network, and USDT wallet configuration with QR codes"
      icon={Wallet}
      enabled={anyCryptoEnabled}
      onEnabledChange={() => {
        // When toggling the main crypto section, enable/disable all crypto options
        const enableAll = !anyCryptoEnabled
        onFieldChange('acceptBitcoin', enableAll)
        onFieldChange('acceptBitcoinLightning', enableAll)
        onFieldChange('acceptUsdtEthereum', enableAll)
        onFieldChange('acceptUsdtTron', enableAll)
      }}
    >
      {/* Individual Cryptocurrency Options */}
      <div className="space-y-6">
        {/* Bitcoin */}
        <CryptocurrencyOption
          name="Bitcoin (BTC)"
          description="Accept Bitcoin payments"
          walletPlaceholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
          discountPlaceholder="2.5"
          enabled={data.acceptBitcoin}
          walletAddress={data.bitcoinWalletAddress}
          discount={data.bitcoinDiscount}
          onEnabledChange={(enabled) => onFieldChange('acceptBitcoin', enabled)}
          onWalletAddressChange={(address) => onFieldChange('bitcoinWalletAddress', address)}
          onDiscountChange={(discount) => onFieldChange('bitcoinDiscount', discount)}
          walletFieldId="bitcoinWalletAddress"
          discountFieldId="bitcoinDiscount"
        />

        {/* Bitcoin Lightning */}
        <div className="p-4 border border-border rounded-lg">
          {/* Header with Enable/Disable */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-foreground">Bitcoin Lightning Network</h3>
                <p className="text-sm text-muted-foreground">Fast, low-fee Bitcoin payments via Strike API</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.acceptBitcoinLightning}
              onChange={(e) => onFieldChange('acceptBitcoinLightning', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          {/* Strike API Configuration */}
          {data.acceptBitcoinLightning && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Strike Lightning Integration</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Uses Strike API for dynamic Lightning invoice generation with real-time exchange rates
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Strike API Key */}
                <ValidatedInput
                  id="strikeApiKey"
                  label="Strike API Key"
                  type="password"
                  value={data.strikeApiKey}
                  onChange={(value) => onFieldChange('strikeApiKey', value)}
                  placeholder="sk_live_... or sk_test_..."
                  description="Your Strike API key for Lightning payments"
                  validationOptions={{
                    required: true,
                    pattern: /^sk_(live|test)_[a-zA-Z0-9]+$/,
                    customValidator: (value: string) => {
                      if (!value.trim()) {
                        return { isValid: false, error: 'Strike API key is required for Lightning payments' }
                      }
                      if (!value.startsWith('sk_live_') && !value.startsWith('sk_test_')) {
                        return { isValid: false, error: 'Invalid Strike API key format' }
                      }
                      return { 
                        isValid: true, 
                        details: value.startsWith('sk_live_') ? 'Live API key' : 'Test API key'
                      }
                    },
                    debounceMs: 500
                  }}
                />

                {/* Lightning Discount */}
                <ValidatedInput
                  id="lightningDiscount"
                  label="Lightning Discount (%)"
                  type="number"
                  value={data.lightningDiscount}
                  onChange={(value) => onFieldChange('lightningDiscount', value)}
                  placeholder="3.0"
                  description="Discount to encourage Lightning payments (optional)"
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
                        details: `Valid discount: ${num}%`
                      }
                    },
                    debounceMs: 300
                  }}
                />
              </div>

              {/* Legacy Lightning Address (Optional) */}
              <div className="border-t pt-4">
                <ValidatedInput
                  id="bitcoinLightningAddress"
                  label="Legacy Lightning Address (Optional)"
                  value={data.bitcoinLightningAddress}
                  onChange={(address) => onFieldChange('bitcoinLightningAddress', address)}
                  placeholder="user@wallet.lightning.address"
                  description="Optional static Lightning address for manual payments"
                  validationOptions={{
                    required: false,
                    cryptoType: 'lightning',
                    debounceMs: 750
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* USDT Ethereum */}
        <CryptocurrencyOption
          name="USDT (Ethereum)"
          description="Tether on Ethereum network"
          walletPlaceholder="0x742d35...15e2f3"
          discountPlaceholder="1.5"
          enabled={data.acceptUsdtEthereum}
          walletAddress={data.usdtEthereumWalletAddress}
          discount={data.usdtEthDiscount}
          onEnabledChange={(enabled) => onFieldChange('acceptUsdtEthereum', enabled)}
          onWalletAddressChange={(address) => onFieldChange('usdtEthereumWalletAddress', address)}
          onDiscountChange={(discount) => onFieldChange('usdtEthDiscount', discount)}
          walletFieldId="usdtEthereumWalletAddress"
          discountFieldId="usdtEthDiscount"
        />

        {/* USDT Tron */}
        <CryptocurrencyOption
          name="USDT (Tron)"
          description="Tether on Tron network"
          walletPlaceholder="TR7NHq...1z3HQF"
          discountPlaceholder="1.0"
          enabled={data.acceptUsdtTron}
          walletAddress={data.usdtTronWalletAddress}
          discount={data.usdtTronDiscount}
          onEnabledChange={(enabled) => onFieldChange('acceptUsdtTron', enabled)}
          onWalletAddressChange={(address) => onFieldChange('usdtTronWalletAddress', address)}
          onDiscountChange={(discount) => onFieldChange('usdtTronDiscount', discount)}
          walletFieldId="usdtTronWalletAddress"
          discountFieldId="usdtTronDiscount"
        />
      </div>
    </PaymentMethodCard>
  )
} 