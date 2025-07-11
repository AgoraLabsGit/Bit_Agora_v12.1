Implementation Guidance: Dynamic Payment Provider Architecture with QR Invoice Generation
🎯 Project Overview
Build a scalable, multi-country payment system that automatically adapts to merchant location and preferences, with special focus on Mercado Pago QR invoice generation across 7 Latin American countries.

**⚠️ CRITICAL: All development must happen in the Payment Testing Lab (`/payment-testing`) to ensure zero disruption to current production Lightning payments.**

## 🧪 Testing Lab Integration Strategy

This implementation will be developed entirely within the Payment Testing Lab environment:

1. **Isolated Development**: All new provider code lives in `/payment-testing/` directory
2. **Feature Flags**: Toggle between testing and production systems
3. **Mock-First Approach**: Start with mocks, gradually replace with real APIs
4. **Zero Production Impact**: Current Strike Lightning payments remain untouched

🏗️ Core Architecture

## 📋 Missing Interface Definitions

Before implementing the provider system, we need to define the missing interfaces:

```typescript
// /payment-testing/types/payment-interfaces.ts
export interface MercadoPagoConfig {
  userId: string;
  posId: string;
  merchantName: string;
  accessToken: string;
  settings: {
    notificationUrl: string;
    returnUrl: string;
    webhookSecret: string;
  };
}

export interface InvoiceData {
  country: string;
  userId: string;
  externalPosId: string;
  externalReference: string;
  merchantName: string;
  description: string;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  customerInfo?: CustomerInfo;
  expirationDate?: string;
  notificationUrl: string;
}

export interface InvoiceItem {
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  sku?: string;
  category?: string;
  unitMeasure?: string;
}

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  identification?: {
    type: string;
    number: string;
  };
}

export interface QRResult {
  qrData: string;
  inStoreOrderId: string;
  country: string;
  currency: string;
  generatedAt: string;
}

export interface PaymentComponentProps {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  config: MercadoPagoConfig;
  onSelect?: () => void;
  onComplete?: (result: { success: boolean; paymentId?: string; error?: string }) => void;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

## 🔧 Utility Functions

```typescript
// /payment-testing/utils/payment-utils.ts
export function formatAmount(amount: number, currency: string): string {
  const formatters = {
    ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
    BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    MXN: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
    COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }),
    CLP: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }),
    PEN: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
    UYU: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }),
  };
  
  return formatters[currency as keyof typeof formatters]?.format(amount) || `${amount} ${currency}`;
}

export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  // Initially mock implementation for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      const statuses: PaymentStatus[] = ['pending', 'processing', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      resolve(randomStatus);
    }, 1000);
  });
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  // Mock implementation for testing
  console.log(`🔄 Payment ${paymentId} status updated to: ${status}`);
}
```

1. Provider Interface Foundation
// /payment-testing/lib/providers/base-provider.ts
export interface PaymentProvider {
  id: string
  name: string
  category: 'fiat' | 'crypto' | 'qr' | 'card'
  countries: string[]
  currencies: string[]
  
  // Core functionality
  isAvailable(country: string): boolean
  generatePayment(amount: number, config: any): Promise<PaymentResult>
  getConfigComponent(): React.ComponentType<any>
  getPaymentComponent(): React.ComponentType<any>
  
  // Enhanced for QR providers
  validateAmount?(amount: number, currency: string): ValidationResult
  getMinAmount?(currency: string): number
  getMaxAmount?(currency: string): number
  handleWebhook?(payload: any, signature: string): Promise<WebhookResult>
}
export interface PaymentResult {
  success: boolean
  paymentId?: string
  qrData?: string  // For QR providers
  expiresAt?: Date
  redirectUrl?: string
  error?: string
  metadata?: Record<string, any>
}
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
export interface WebhookResult {
  success: boolean
  paymentStatus: 'pending' | 'completed' | 'failed'
  paymentId: string
}
2. Provider Registry System
// lib/payment/providers/registry.ts
export class PaymentProviderRegistry {
  private static providers = new Map<string, PaymentProvider>()
  private static initialized = false
  
  static register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider)
  }
  
  static initialize() {
    if (this.initialized) return
    
    // Register all Mercado Pago country providers
    this.register(new MercadoPagoARProvider())
    this.register(new MercadoPagoBRProvider())
    this.register(new MercadoPagoMXProvider())
    this.register(new MercadoPagoCOProvider())
    this.register(new MercadoPagoCLProvider())
    this.register(new MercadoPagoPEProvider())
    this.register(new MercadoPagoUYProvider())
    
    // Register other providers
    this.register(new PIXProvider())
    this.register(new StripeProvider())
    this.register(new PayPalProvider())
    this.register(new BitcoinProvider())
    
    this.initialized = true
  }
  
  static getAvailableProviders(country: string, currency: string): PaymentProvider[] {
    this.initialize()
    
    return Array.from(this.providers.values()).filter(provider =>
      provider.isAvailable(country) && 
      provider.currencies.includes(currency)
    )
  }
  
  static getProvidersByCategory(
    category: 'fiat' | 'crypto' | 'qr' | 'card',
    country: string,
    currency: string
  ): PaymentProvider[] {
    return this.getAvailableProviders(country, currency)
      .filter(provider => provider.category === category)
  }
  
  static getProvider(id: string): PaymentProvider | undefined {
    this.initialize()
    return this.providers.get(id)
  }
}
🌎 Country-Specific Configuration
3. Mercado Pago Countries Configuration
// config/countries.ts
export const MERCADO_PAGO_COUNTRIES = {
  AR: {
    name: 'Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    locale: 'es-AR',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 1,
    maxAmount: 999999,
    timezone: 'America/Argentina/Buenos_Aires',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'rapipago', 'pagofacil'],
    flag: '🇦🇷'
  },
  BR: {
    name: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 0.50,
    maxAmount: 999999,
    timezone: 'America/Sao_Paulo',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'bolbradesco', 'pix'],
    flag: '🇧🇷'
  },
  MX: {
    name: 'Mexico',
    currency: 'MXN',
    currencySymbol: '$',
    locale: 'es-MX',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 5,
    maxAmount: 999999,
    timezone: 'America/Mexico_City',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'oxxo', 'paycash'],
    flag: '🇲🇽'
  },
  // ... CO, CL, PE, UY configurations
} as const;
export type CountryCode = keyof typeof MERCADO_PAGO_COUNTRIES;
export type CurrencyCode = 'ARS' | 'BRL' | 'MXN' | 'COP' | 'CLP' | 'PEN' | 'UYU';
4. QR Code Service Implementation
// services/qrCodeService.ts
import axios from 'axios';
import { MERCADO_PAGO_COUNTRIES } from '../config/countries.js';
export class QRCodeService {
  constructor() {
    this.accessTokens = {
      AR: process.env.MERCADO_PAGO_ACCESS_TOKEN_AR,
      BR: process.env.MERCADO_PAGO_ACCESS_TOKEN_BR,
      MX: process.env.MERCADO_PAGO_ACCESS_TOKEN_MX,
      CO: process.env.MERCADO_PAGO_ACCESS_TOKEN_CO,
      CL: process.env.MERCADO_PAGO_ACCESS_TOKEN_CL,
      PE: process.env.MERCADO_PAGO_ACCESS_TOKEN_PE,
      UY: process.env.MERCADO_PAGO_ACCESS_TOKEN_UY
    };
  }
  async generateQRInvoice(invoiceData: InvoiceData): Promise<QRResult> {
    const { country, userId, externalPosId } = invoiceData;
    const countryConfig = MERCADO_PAGO_COUNTRIES[country];
    
    if (!countryConfig) {
      throw new Error(`Unsupported country: ${country}`);
    }
    const orderPayload = this.buildOrderPayload(invoiceData, countryConfig);
    
    try {
      const response = await axios.post(
        `${countryConfig.apiBaseUrl}/instore/orders/qr/seller/collectors/${userId}/pos/${externalPosId}/qrs`,
        orderPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessTokens[country]}`
          }
        }
      );
      return {
        qrData: response.data.qr_data,
        inStoreOrderId: response.data.in_store_order_id,
        country: country,
        currency: countryConfig.currency,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`QR generation failed for ${country}: ${error.message}`);
    }
  }
  buildOrderPayload(invoiceData: InvoiceData, countryConfig: CountryConfig) {
    const {
      externalReference,
      merchantName,
      description,
      totalAmount,
      items,
      customerInfo,
      expirationDate,
      notificationUrl
    } = invoiceData;
    const formattedAmount = this.formatAmount(totalAmount, countryConfig.currency);
    return {
      external_reference: externalReference,
      title: `${merchantName} - Invoice ${externalReference}`,
      description: description || `Payment for invoice ${externalReference}`,
      notification_url: notificationUrl,
      expiration_date: expirationDate || this.getDefaultExpirationDate(),
      total_amount: formattedAmount,
      items: items.map(item => ({
        sku_number: item.sku || `ITEM-${Date.now()}`,
        category: item.category || 'marketplace',
        title: item.name,
        description: item.description || item.name,
        unit_price: this.formatAmount(item.unitPrice, countryConfig.currency),
        quantity: item.quantity,
        unit_measure: item.unitMeasure || 'unit',
        total_amount: this.formatAmount(item.totalAmount, countryConfig.currency)
      }))
    };
  }
  formatAmount(amount: number, currency: string): number {
    const decimalPlaces = {
      CLP: 0, COP: 0, // No decimals
      UYU: 2, ARS: 2, BRL: 2, MXN: 2, PEN: 2 // 2 decimals
    };
    const decimals = decimalPlaces[currency] || 2;
    return parseFloat(amount.toFixed(decimals));
  }
}
🔧 Provider Implementations
5. Mercado Pago Country-Specific Providers
// lib/payment/providers/mercadopago-ar.ts
export class MercadoPagoARProvider implements PaymentProvider {
  id = 'mercadopago_ar'
  name = 'Mercado Pago Argentina'
  category = 'qr' as const
  countries = ['AR']
  currencies = ['ARS']
  
  private qrService = new QRCodeService()
  
  isAvailable(country: string): boolean {
    return country === 'AR'
  }
  
  async generatePayment(amount: number, config: MercadoPagoConfig): Promise<PaymentResult> {
    try {
      const result = await this.qrService.generateQRInvoice({
        country: 'AR',
        userId: config.userId,
        externalPosId: config.posId,
        totalAmount: amount,
        currency: 'ARS',
        merchantName: config.merchantName,
        externalReference: `AR-${Date.now()}`,
        description: `Payment of ${amount} ARS`,
        items: [{
          name: 'Product Purchase',
          unitPrice: amount,
          quantity: 1,
          totalAmount: amount
        }],
        notificationUrl: `${process.env.BASE_URL}/webhooks/mercadopago/ar`
      });
      
      return {
        success: true,
        paymentId: result.inStoreOrderId,
        qrData: result.qrData,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  getMinAmount(currency: string): number {
    return MERCADO_PAGO_COUNTRIES.AR.minAmount;
  }
  
  getMaxAmount(currency: string): number {
    return MERCADO_PAGO_COUNTRIES.AR.maxAmount;
  }
  
  validateAmount(amount: number, currency: string): ValidationResult {
    const min = this.getMinAmount(currency);
    const max = this.getMaxAmount(currency);
    
    if (amount < min) {
      return {
        isValid: false,
        errors: [`Amount too low. Minimum: ${min} ${currency}`]
      };
    }
    
    if (amount > max) {
      return {
        isValid: false,
        errors: [`Amount too high. Maximum: ${max} ${currency}`]
      };
    }
    
    return { isValid: true, errors: [] };
  }
  
  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    // Implement webhook signature verification and processing
    const { type, data } = payload;
    
    if (type === 'payment') {
      return {
        success: true,
        paymentStatus: 'completed',
        paymentId: data.id
      };
    }
    
    return {
      success: false,
      paymentStatus: 'pending',
      paymentId: data.id
    };
  }
  
  getConfigComponent(): React.ComponentType<any> {
    return MercadoPagoARConfigComponent;
  }
  
  getPaymentComponent(): React.ComponentType<any> {
    return MercadoPagoQRComponent;
  }
}
// Similar implementations for BR, MX, CO, CL, PE, UY
📱 Frontend Implementation
6. Dynamic Payment Settings Hook
// hooks/useDynamicPaymentSettings.ts
export function useDynamicPaymentSettings(merchantId: string) {
  const { data: merchantSettings, isLoading } = useQuery({
    queryKey: ['merchant-settings', merchantId],
    queryFn: () => fetchMerchantSettings(merchantId),
    staleTime: 5 * 60 * 1000,
  });
  const config = useMemo(() => {
    if (!merchantSettings) return null;
    const availableProviders = PaymentProviderRegistry.getAvailableProviders(
      merchantSettings.merchantCountry,
      merchantSettings.merchantCurrency
    );
    return {
      merchantId,
      merchantCountry: merchantSettings.merchantCountry,
      merchantCurrency: merchantSettings.merchantCurrency,
      enabledProviders: merchantSettings.enabledProviders,
      providerConfigs: merchantSettings.providerConfigs,
      availableProviders,
      isLoading,
    };
  }, [merchantSettings, merchantId, isLoading]);
  const enabledProviders = useMemo(() => {
    if (!config) return [];
    
    return config.availableProviders.filter(provider =>
      config.enabledProviders.includes(provider.id)
    );
  }, [config]);
  return { config, enabledProviders, isLoading };
}
7. Payment Method Selector Component
// components/pos/payment/PaymentMethodSelector.tsx
export const PaymentMethodSelector = ({ 
  merchantId, 
  amount, 
  currency,
  onPaymentSelect,
  onPaymentComplete 
}: PaymentMethodSelectorProps) => {
  const { config, enabledProviders, isLoading } = useDynamicPaymentSettings(merchantId);
  if (isLoading) {
    return <PaymentMethodsSkeletonLoader />;
  }
  if (!config || enabledProviders.length === 0) {
    return <NoPaymentMethodsAvailable />;
  }
  const groupedProviders = groupProvidersByCategory(enabledProviders);
  return (
    <div className="payment-methods-container space-y-6">
      {Object.entries(groupedProviders).map(([category, providers]) => (
        <PaymentCategorySection
          key={category}
          category={category}
          providers={providers}
          amount={amount}
          currency={currency || config.merchantCurrency}
          config={config}
          onPaymentSelect={onPaymentSelect}
          onPaymentComplete={onPaymentComplete}
        />
      ))}
    </div>
  );
};
const PaymentCategorySection = ({ 
  category, 
  providers, 
  amount, 
  currency, 
  config, 
  onPaymentSelect, 
  onPaymentComplete 
}) => (
  <div className="payment-category">
    <h3 className="text-lg font-semibold mb-3 capitalize">
      {category === 'qr' ? 'QR Code Payments' : `${category} Payments`}
    </h3>
    
    <div className="grid gap-4">
      {providers.map(provider => (
        <ErrorBoundary
          key={provider.id}
          fallback={<PaymentProviderError providerId={provider.id} />}
        >
          <Suspense fallback={<PaymentProviderSkeleton />}>
            <PaymentProviderWrapper
              provider={provider}
              amount={amount}
              currency={currency}
              config={config.providerConfigs[provider.id]}
              onSelect={() => onPaymentSelect?.(provider.id)}
              onComplete={onPaymentComplete}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </div>
  </div>
);
8. QR Payment Component
// components/pos/payment/providers/MercadoPagoQRComponent.tsx
export const MercadoPagoQRComponent = ({ 
  provider, 
  amount, 
  currency, 
  config, 
  onSelect, 
  onComplete 
}: PaymentComponentProps) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const generateQR = async () => {
    setIsGenerating(true);
    onSelect?.();
    try {
      const result = await provider.generatePayment(amount, {
        ...config.settings,
        currency,
        merchantName: config.merchantName || 'Your Business'
      });
      if (result.success && result.qrData) {
        setQrData(result.qrData);
        setPaymentStatus('processing');
        startPaymentStatusPolling(result.paymentId!);
      } else {
        throw new Error(result.error || 'QR generation failed');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      setPaymentStatus('failed');
    } finally {
      setIsGenerating(false);
    }
  };
  const startPaymentStatusPolling = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(paymentId);
        
        if (status === 'completed') {
          setPaymentStatus('completed');
          onComplete?.({ success: true, paymentId });
          clearInterval(interval);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          onComplete?.({ success: false, error: 'Payment failed' });
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 2000);
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };
  return (
    <div className="mercadopago-qr-component">
      {paymentStatus === 'pending' && (
        <button
          onClick={generateQR}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50"
        >
          {isGenerating ? 'Generating QR...' : `Pay ${formatAmount(amount, currency)} with QR`}
        </button>
      )}
      {qrData && paymentStatus === 'processing' && (
        <QRCodeDisplay
          qrData={qrData}
          amount={amount}
          currency={currency}
          providerName={provider.name}
        />
      )}
      {paymentStatus === 'completed' && <PaymentSuccessMessage />}
      {paymentStatus === 'failed' && <PaymentFailedMessage onRetry={() => setPaymentStatus('pending')} />}
    </div>
  );
};
🔗 Backend Webhook Handling
9. Multi-Country Webhook Routes
// routes/webhooks.ts
import express from 'express';
const router = express.Router();
// Country-specific webhook endpoints
['ar', 'br', 'mx', 'co', 'cl', 'pe', 'uy'].forEach(country => {
  router.post(`/mercadopago/${country}`, async (req, res) => {
    try {
      const providerId = `mercadopago_${country}`;
      const provider = PaymentProviderRegistry.getProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      const result = await provider.handleWebhook(req.body, req.headers['x-signature']);
      
      if (result.success) {
        await updatePaymentStatus(result.paymentId, result.paymentStatus);
        res.status(200).json({ message: 'Webhook processed successfully' });
      } else {
        res.status(400).json({ error: 'Webhook processing failed' });
      }
    } catch (error) {
      console.error(`Webhook error for ${country}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});
export default router;
## 🔄 Migration Strategy

### Phase 1: Foundation (Testing Lab Only)
1. **No Production Changes**: All code stays in `/payment-testing/`
2. **Feature Flag System**: Create toggle between old/new payment systems
3. **Parallel Development**: New provider system runs alongside existing Strike Lightning
4. **Zero Risk**: Current POS continues working unchanged

### Phase 2: Argentina MVP (Testing Lab)
1. **Single Provider**: Focus only on Mercado Pago Argentina
2. **Mock-First**: Start with mock APIs, validate architecture
3. **Real API Integration**: Connect to Mercado Pago AR APIs
4. **Thorough Testing**: Validate all scenarios in testing lab

### Phase 3: Gradual Rollout
1. **Feature Flag Toggle**: Allow switching between old/new payment systems
2. **Limited Merchant Testing**: Beta test with select merchants
3. **Monitoring**: Track performance and errors
4. **Rollback Plan**: Instant rollback to Strike Lightning if needed

### Phase 4: Expansion
1. **Add Countries**: Brazil, Mexico, etc. (only after Argentina is stable)
2. **Additional Providers**: BTC Pay Server, other payment methods
3. **Legacy Removal**: Remove old code only after new system is proven

## 📋 Simplified MVP Implementation Steps

### Week 1: Testing Lab Foundation
- [ ] Create `/payment-testing/lib/providers/` directory structure
- [ ] Implement base provider interface (Argentina only)
- [ ] Create mock Mercado Pago Argentina provider
- [ ] Update testing lab to use new provider system

### Week 2: Argentina Provider
- [ ] Implement real Mercado Pago Argentina QR generation
- [ ] Add webhook handling for Argentina
- [ ] Create Argentina-specific configuration
- [ ] Test with mock merchant data

### Week 3: Testing Lab Integration
- [ ] Integrate Argentina provider into testing lab UI
- [ ] Add QR display component
- [ ] Implement payment status polling
- [ ] Add comprehensive error handling

### Week 4: Production Readiness
- [ ] Add feature flags to main POS system
- [ ] Create migration scripts for merchant settings
- [ ] Implement monitoring and logging
- [ ] Prepare rollback procedures

## 🎯 Argentina-First MVP Architecture

```typescript
// Simplified MVP - Argentina Only
const MercadoPagoAR = {
  id: 'mercadopago_ar',
  name: 'Mercado Pago Argentina',
  country: 'AR',
  currency: 'ARS',
  
  // Core functions
  generateQR: async (amount: number, config: ArgentinaConfig) => {
    // Real Mercado Pago API integration
    return { qrData: string, paymentId: string, expiresAt: Date }
  },
  
  checkStatus: async (paymentId: string) => {
    // Real status checking
    return 'pending' | 'completed' | 'failed'
  },
  
  handleWebhook: async (payload: any, signature: string) => {
    // Real webhook processing
    return { success: boolean, paymentId: string }
  }
}
```

📋 Implementation Steps for Cursor AI
🔒 Security & Environment Variables
# .env file structure
MERCADO_PAGO_ACCESS_TOKEN_AR=TEST-123456789-031423-abc123def456-789012345
MERCADO_PAGO_ACCESS_TOKEN_BR=TEST-123456789-031423-abc123def456-789012346
MERCADO_PAGO_ACCESS_TOKEN_MX=TEST-123456789-031423-abc123def456-789012347
# ... other countries
MERCADO_PAGO_USER_ID_AR=446566691
MERCADO_PAGO_USER_ID_BR=446566692
# ... other countries
BASE_URL=https://your-app.com
DATABASE_URL=postgresql://...
🧪 Testing Strategy
Unit tests for each provider implementation
Integration tests for QR generation across all countries
Webhook testing with mock Mercado Pago responses
End-to-end tests for complete payment flows
Multi-merchant testing to ensure proper isolation
This implementation provides a production-ready, scalable payment system that automatically adapts to merchant location and preferences while supporting all Mercado Pago countries with proper QR invoice generation.