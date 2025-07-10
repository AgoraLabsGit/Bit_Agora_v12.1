# BitAgora Payment Provider Architecture

## 🎯 **Overview**

Dynamic payment provider system that automatically configures payment methods based on:
- **Merchant location** (Argentina → Mercado Pago, Brazil → PIX)
- **Merchant preferences** (PayPal vs Stripe for cards)
- **Regional regulations** (crypto restrictions, payment method availability)

---

## 🏗️ **Architecture Design**

### **Core Interfaces**

```typescript
// lib/payment/providers/base-provider.ts
export interface PaymentProvider {
  id: string
  name: string
  category: 'fiat' | 'crypto' | 'qr' | 'card'
  countries: string[] // ['AR', 'BR', 'MX']
  currencies: string[] // ['ARS', 'BRL', 'USD']
  
  // Configuration
  isAvailable(country: string, currency: string): boolean
  getRequiredConfig(): PaymentProviderConfig[]
  validate(config: any): ValidationResult
  
  // Payment Operations
  generatePayment(amount: number, currency: string, config: any): Promise<PaymentResult>
  checkStatus(paymentId: string): Promise<PaymentStatus>
  
  // UI Components
  getConfigComponent(): React.ComponentType<any>
  getPaymentComponent(): React.ComponentType<any>
}

export interface PaymentProviderConfig {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'boolean'
  required: boolean
  validation?: (value: any) => boolean
  options?: Array<{label: string, value: string}>
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  qrCode?: string
  redirectUrl?: string
  amount: number
  currency: string
  expiresAt?: Date
  error?: string
}

export interface MerchantLocation {
  country: string // 'AR', 'BR', 'MX', 'US'
  currency: string // 'ARS', 'BRL', 'MXN', 'USD'
  timezone: string
  regulations?: {
    cryptoAllowed: boolean
    fiatRequired: boolean
    kycRequired: boolean
  }
}
```

### **Provider Registry System**

```typescript
// lib/payment/provider-registry.ts
export class PaymentProviderRegistry {
  private static providers = new Map<string, PaymentProvider>()
  private static countryConfigs = new Map<string, CountryConfig>()

  // Register a payment provider
  static register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider)
    console.log(`✅ Registered payment provider: ${provider.name}`)
  }

  // Get available providers for a country/currency
  static getAvailableProviders(country: string, currency: string): PaymentProvider[] {
    return Array.from(this.providers.values()).filter(provider =>
      provider.isAvailable(country, currency)
    )
  }

  // Get providers by category
  static getProvidersByCategory(
    category: PaymentProvider['category'],
    country: string,
    currency: string
  ): PaymentProvider[] {
    return this.getAvailableProviders(country, currency).filter(
      provider => provider.category === category
    )
  }

  // Auto-configure providers for merchant location
  static getDefaultProvidersForCountry(country: string): PaymentProvider[] {
    const config = this.countryConfigs.get(country)
    if (!config) return []

    return config.defaultProviders.map(id => this.providers.get(id)).filter(Boolean)
  }

  // Register country configuration
  static registerCountryConfig(country: string, config: CountryConfig) {
    this.countryConfigs.set(country, config)
  }
}

interface CountryConfig {
  country: string
  currency: string
  defaultProviders: string[] // Provider IDs to auto-enable
  restrictedProviders: string[] // Provider IDs to hide
  requiredProviders: string[] // Provider IDs that must be enabled
}
```

---

## 🌎 **Country-Specific Provider Implementation**

### **Argentina Configuration**

```typescript
// lib/payment/providers/argentina-providers.ts

// Mercado Pago Argentina Provider
export class MercadoPagoARProvider implements PaymentProvider {
  id = 'mercado_pago_ar'
  name = 'Mercado Pago'
  category = 'qr' as const
  countries = ['AR']
  currencies = ['ARS', 'USD']

  isAvailable(country: string, currency: string): boolean {
    return this.countries.includes(country) && this.currencies.includes(currency)
  }

  getRequiredConfig(): PaymentProviderConfig[] {
    return [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true,
        validation: (value) => value.startsWith('TEST-') || value.startsWith('APP_USR-')
      },
      {
        key: 'userId',
        label: 'User ID',
        type: 'text',
        required: true
      },
      {
        key: 'posId',
        label: 'POS ID',
        type: 'text',
        required: true
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'select',
        required: true,
        options: [
          { label: 'Sandbox', value: 'sandbox' },
          { label: 'Production', value: 'production' }
        ]
      }
    ]
  }

  async generatePayment(amount: number, currency: string, config: any): Promise<PaymentResult> {
    // Convert USD to ARS if needed
    const localAmount = currency === 'USD' ? amount * 1000 : amount // Simplified conversion
    
    try {
      const response = await fetch(
        `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${config.userId}/pos/${config.posId}/qrs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'BitAgora Transaction',
            description: 'POS Payment',
            total_amount: localAmount,
            external_reference: `BITAGORA_${Date.now()}`,
            notification_url: `${process.env.BASE_URL}/api/webhooks/mercado-pago`,
            items: [{
              title: 'Product Purchase',
              unit_price: localAmount,
              quantity: 1,
              total_amount: localAmount
            }]
          })
        }
      )

      const data = await response.json()
      
      return {
        success: true,
        paymentId: data.in_store_order_id,
        qrCode: data.qr_data,
        amount: localAmount,
        currency: 'ARS',
        expiresAt: new Date(Date.now() + 24*60*60*1000)
      }
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        amount: localAmount,
        currency: 'ARS',
        error: error.message
      }
    }
  }

  async checkStatus(paymentId: string): Promise<PaymentStatus> {
    // Implementation for checking Mercado Pago payment status
    return { status: 'pending', paymentId }
  }

  getConfigComponent() {
    return MercadoPagoConfigComponent
  }

  getPaymentComponent() {
    return MercadoPagoPaymentComponent
  }
}

// Register Argentina providers
PaymentProviderRegistry.registerCountryConfig('AR', {
  country: 'AR',
  currency: 'ARS',
  defaultProviders: ['mercado_pago_ar', 'cash', 'bitcoin', 'lightning'],
  restrictedProviders: [], // None restricted in Argentina
  requiredProviders: ['cash'] // Cash is always required
})

PaymentProviderRegistry.register(new MercadoPagoARProvider())
```

### **Brazil Configuration**

```typescript
// lib/payment/providers/brazil-providers.ts

export class PIXProvider implements PaymentProvider {
  id = 'pix_br'
  name = 'PIX'
  category = 'qr' as const
  countries = ['BR']
  currencies = ['BRL']

  // Implementation similar to Mercado Pago but for PIX
  async generatePayment(amount: number, currency: string, config: any): Promise<PaymentResult> {
    // PIX QR generation logic
    return {
      success: true,
      paymentId: `PIX_${Date.now()}`,
      qrCode: 'pix_qr_code_data',
      amount,
      currency: 'BRL'
    }
  }

  // ... other methods
}

export class MercadoPagoBRProvider implements PaymentProvider {
  id = 'mercado_pago_br'
  name = 'Mercado Pago Brasil'
  category = 'qr' as const
  countries = ['BR']
  currencies = ['BRL']

  // Brazil-specific Mercado Pago implementation
  // ... implementation
}

// Register Brazil providers
PaymentProviderRegistry.registerCountryConfig('BR', {
  country: 'BR',
  currency: 'BRL',
  defaultProviders: ['pix_br', 'mercado_pago_br', 'cash'],
  restrictedProviders: [],
  requiredProviders: ['cash']
})

PaymentProviderRegistry.register(new PIXProvider())
PaymentProviderRegistry.register(new MercadoPagoBRProvider())
```

### **Multi-Country Providers**

```typescript
// lib/payment/providers/global-providers.ts

export class StripeProvider implements PaymentProvider {
  id = 'stripe'
  name = 'Stripe'
  category = 'card' as const
  countries = ['US', 'AR', 'BR', 'MX', 'CA', 'GB'] // Stripe supported countries
  currencies = ['USD', 'ARS', 'BRL', 'MXN', 'CAD', 'GBP']

  getRequiredConfig(): PaymentProviderConfig[] {
    return [
      {
        key: 'publishableKey',
        label: 'Publishable Key',
        type: 'text',
        required: true
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true
      }
    ]
  }

  async generatePayment(amount: number, currency: string, config: any): Promise<PaymentResult> {
    // Stripe payment processing
    return {
      success: true,
      paymentId: `stripe_${Date.now()}`,
      redirectUrl: 'https://checkout.stripe.com/...',
      amount,
      currency
    }
  }

  // ... other methods
}

export class PayPalProvider implements PaymentProvider {
  id = 'paypal'
  name = 'PayPal'
  category = 'card' as const
  countries = ['US', 'AR', 'BR', 'MX', 'CA']
  currencies = ['USD', 'ARS', 'BRL', 'MXN', 'CAD']

  // PayPal implementation
  // ... similar structure
}

// Register global providers
PaymentProviderRegistry.register(new StripeProvider())
PaymentProviderRegistry.register(new PayPalProvider())
```

---

## 🔧 **Dynamic Merchant Configuration**

### **Merchant Settings Service**

```typescript
// lib/payment/merchant-payment-config.ts
export class MerchantPaymentConfig {
  
  static async getConfigForMerchant(merchantId: string): Promise<MerchantPaymentSetup> {
    const merchant = await this.getMerchantDetails(merchantId)
    const location = merchant.location
    
    // Get available providers for merchant's location
    const availableProviders = PaymentProviderRegistry.getAvailableProviders(
      location.country,
      location.currency
    )
    
    // Get default providers for country
    const defaultProviders = PaymentProviderRegistry.getDefaultProvidersForCountry(
      location.country
    )
    
    // Get merchant's current preferences
    const merchantPreferences = await this.getMerchantPaymentPreferences(merchantId)
    
    return {
      location,
      availableProviders,
      defaultProviders,
      enabledProviders: merchantPreferences.enabledProviders,
      providerConfigs: merchantPreferences.providerConfigs
    }
  }
  
  static async updateMerchantProviders(
    merchantId: string, 
    enabledProviders: string[],
    providerConfigs: Record<string, any>
  ) {
    // Save merchant's payment provider preferences
    await this.saveMerchantPaymentPreferences(merchantId, {
      enabledProviders,
      providerConfigs,
      updatedAt: new Date().toISOString()
    })
    
    // Trigger UI refresh
    this.notifyPaymentConfigChange(merchantId)
  }
}

interface MerchantPaymentSetup {
  location: MerchantLocation
  availableProviders: PaymentProvider[]
  defaultProviders: PaymentProvider[]
  enabledProviders: string[]
  providerConfigs: Record<string, any>
}
```

### **Dynamic Payment Settings Hook**

```typescript
// hooks/use-dynamic-payment-settings.ts
export const useDynamicPaymentSettings = (merchantId: string) => {
  const [config, setConfig] = useState<MerchantPaymentSetup | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMerchantConfig = async () => {
      setIsLoading(true)
      try {
        const merchantConfig = await MerchantPaymentConfig.getConfigForMerchant(merchantId)
        setConfig(merchantConfig)
      } catch (error) {
        console.error('Failed to load merchant config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMerchantConfig()
  }, [merchantId])

  const updateProviderConfig = async (providerId: string, config: any) => {
    if (!config) return

    const updatedConfigs = {
      ...config.providerConfigs,
      [providerId]: config
    }

    await MerchantPaymentConfig.updateMerchantProviders(
      merchantId,
      config.enabledProviders,
      updatedConfigs
    )

    // Refresh config
    const newConfig = await MerchantPaymentConfig.getConfigForMerchant(merchantId)
    setConfig(newConfig)
  }

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    if (!config) return

    const enabledProviders = enabled
      ? [...config.enabledProviders, providerId]
      : config.enabledProviders.filter(id => id !== providerId)

    await MerchantPaymentConfig.updateMerchantProviders(
      merchantId,
      enabledProviders,
      config.providerConfigs
    )

    // Refresh config
    const newConfig = await MerchantPaymentConfig.getConfigForMerchant(merchantId)
    setConfig(newConfig)
  }

  return {
    config,
    isLoading,
    updateProviderConfig,
    toggleProvider
  }
}
```

---

## 🎨 **Dynamic Payment UI Components**

### **Dynamic Payment Method Selector**

```typescript
// components/pos/payment/DynamicPaymentSelector.tsx
export const DynamicPaymentSelector = ({ 
  merchantId, 
  amount, 
  onPaymentSelect 
}: {
  merchantId: string
  amount: number
  onPaymentSelect: (provider: PaymentProvider, config: any) => void
}) => {
  const { config, isLoading } = useDynamicPaymentSettings(merchantId)

  if (isLoading || !config) {
    return <PaymentSelectorSkeleton />
  }

  const enabledProviders = config.availableProviders.filter(provider =>
    config.enabledProviders.includes(provider.id)
  )

  const groupedProviders = groupBy(enabledProviders, 'category')

  return (
    <div className="space-y-6">
      {/* QR Providers */}
      {groupedProviders.qr && (
        <PaymentCategorySection
          title="QR Payments"
          icon="📱"
          providers={groupedProviders.qr}
          config={config}
          onSelect={onPaymentSelect}
        />
      )}

      {/* Card Providers */}
      {groupedProviders.card && (
        <PaymentCategorySection
          title="Card Payments"
          icon="💳"
          providers={groupedProviders.card}
          config={config}
          onSelect={onPaymentSelect}
        />
      )}

      {/* Crypto Providers */}
      {groupedProviders.crypto && (
        <PaymentCategorySection
          title="Cryptocurrency"
          icon="₿"
          providers={groupedProviders.crypto}
          config={config}
          onSelect={onPaymentSelect}
        />
      )}

      {/* Fiat Providers */}
      {groupedProviders.fiat && (
        <PaymentCategorySection
          title="Bank Transfers"
          icon="🏦"
          providers={groupedProviders.fiat}
          config={config}
          onSelect={onPaymentSelect}
        />
      )}
    </div>
  )
}

const PaymentCategorySection = ({
  title,
  icon,
  providers,
  config,
  onSelect
}: {
  title: string
  icon: string
  providers: PaymentProvider[]
  config: MerchantPaymentSetup
  onSelect: (provider: PaymentProvider, config: any) => void
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {providers.map(provider => (
          <Button
            key={provider.id}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => onSelect(provider, config.providerConfigs[provider.id])}
          >
            <span className="font-medium">{provider.name}</span>
            <span className="text-xs text-muted-foreground">
              {provider.category}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### **Dynamic Payment Configuration**

```typescript
// components/admin/payment-providers/DynamicProviderConfig.tsx
export const DynamicProviderConfig = ({ 
  merchantId 
}: { 
  merchantId: string 
}) => {
  const { config, isLoading, toggleProvider, updateProviderConfig } = useDynamicPaymentSettings(merchantId)

  if (isLoading || !config) {
    return <ConfigSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Country/Location Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌎 Business Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Country</Label>
              <p className="font-medium">{config.location.country}</p>
            </div>
            <div>
              <Label>Currency</Label>
              <p className="font-medium">{config.location.currency}</p>
            </div>
            <div>
              <Label>Available Providers</Label>
              <p className="font-medium">{config.availableProviders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Providers by Category */}
      {Object.entries(groupBy(config.availableProviders, 'category')).map(([category, providers]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Providers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers.map(provider => (
              <ProviderConfigRow
                key={provider.id}
                provider={provider}
                enabled={config.enabledProviders.includes(provider.id)}
                config={config.providerConfigs[provider.id]}
                onToggle={(enabled) => toggleProvider(provider.id, enabled)}
                onConfigUpdate={(newConfig) => updateProviderConfig(provider.id, newConfig)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 🚀 **Implementation Strategy**

### **Phase 1: Core Architecture (Week 1)**
1. **Create base interfaces** and provider registry
2. **Implement country configuration** system
3. **Create merchant location service**

### **Phase 2: Provider Implementation (Week 2)**
1. **Implement Argentina providers** (Mercado Pago)
2. **Implement global providers** (Stripe, PayPal)
3. **Create provider components**

### **Phase 3: Dynamic UI (Week 3)**
1. **Build dynamic payment selector**
2. **Create provider configuration UI**
3. **Integrate with existing checkout**

### **Phase 4: Testing & Launch (Week 4)**
1. **End-to-end testing**
2. **Country switching validation**
3. **Provider failover testing**

---

## 💡 **Benefits of This Architecture**

### ✅ **For Development:**
- **Modular**: Easy to add new providers
- **Testable**: Each provider can be unit tested
- **Maintainable**: Clean separation of concerns
- **Type-safe**: Full TypeScript support

### ✅ **For Business:**
- **Scalable**: Automatic country expansion
- **Flexible**: Merchants choose preferred providers
- **Compliant**: Country-specific payment regulations
- **Revenue**: Optimize payment success rates

### ✅ **For Users:**
- **Localized**: Payment methods they know and trust
- **Fast**: Auto-configured for their location
- **Choice**: Multiple provider options when available

**Ready to implement dynamic, location-aware payment providers!** 🌎💳✨ 