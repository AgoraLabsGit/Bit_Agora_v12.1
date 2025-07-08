// BitAgora Cryptocurrency Section Component
// Complete cryptocurrency payments section with Bitcoin, Lightning, and USDT options

import React from 'react'
import { Wallet } from 'lucide-react'
import { PaymentMethodCard } from './PaymentMethodCard'
import { CryptocurrencyOption } from './CryptocurrencyOption'

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
        <CryptocurrencyOption
          name="Bitcoin Lightning Network"
          description="Fast, low-fee Bitcoin payments"
          walletPlaceholder="user@wallet.lightning.address"
          discountPlaceholder="3.0"
          enabled={data.acceptBitcoinLightning}
          walletAddress={data.bitcoinLightningAddress}
          discount={data.lightningDiscount}
          onEnabledChange={(enabled) => onFieldChange('acceptBitcoinLightning', enabled)}
          onWalletAddressChange={(address) => onFieldChange('bitcoinLightningAddress', address)}
          onDiscountChange={(discount) => onFieldChange('lightningDiscount', discount)}
          walletFieldId="bitcoinLightningAddress"
          discountFieldId="lightningDiscount"
        />

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