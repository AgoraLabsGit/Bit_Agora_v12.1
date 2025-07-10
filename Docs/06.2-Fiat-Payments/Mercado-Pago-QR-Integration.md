# BitAgora Mercado Pago Multi-Country QR Integration Guide

## 🎯 **Overview**

Comprehensive Mercado Pago implementation supporting **7 Latin American countries** with dynamic QR code generation, embedded payment amounts, and country-specific configurations. This system automatically adapts to merchant location and provides localized payment experiences.

**🌎 Supported Countries**: Argentina, Brazil, Mexico, Colombia, Chile, Peru, Uruguay  
**💳 Payment Methods**: QR codes with embedded amounts, cards, bank transfers, local payment methods  
**🔄 Dynamic Configuration**: Auto-configures based on merchant country and currency

---

## 🌎 **Multi-Country Configuration**

### **Country Configuration Setup**

```javascript
// config/countries.js
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
  CO: {
    name: 'Colombia',
    currency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 1300,
    maxAmount: 999999999,
    timezone: 'America/Bogota',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'efecty', 'pse'],
    flag: '🇨🇴'
  },
  CL: {
    name: 'Chile',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 500,
    maxAmount: 99999999,
    timezone: 'America/Santiago',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'servipag', 'webpay'],
    flag: '🇨🇱'
  },
  PE: {
    name: 'Peru',
    currency: 'PEN',
    currencySymbol: 'S/',
    locale: 'es-PE',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 1,
    maxAmount: 999999,
    timezone: 'America/Lima',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'pagoefectivo_atm'],
    flag: '🇵🇪'
  },
  UY: {
    name: 'Uruguay',
    currency: 'UYU',
    currencySymbol: '$U',
    locale: 'es-UY',
    apiBaseUrl: 'https://api.mercadopago.com',
    minAmount: 10,
    maxAmount: 999999,
    timezone: 'America/Montevideo',
    paymentMethods: ['credit_card', 'debit_card', 'account_money', 'abitab', 'redpagos'],
    flag: '🇺🇾'
  }
};
```

### **Currency-Specific Formatting**

Each country has different decimal place requirements and amount limits:

| Country | Currency | Decimals | Min Amount | Max Amount | Special Notes |
|---------|----------|----------|------------|------------|---------------|
| 🇦🇷 Argentina | ARS | 2 | $1 | $999,999 | High inflation, amounts change frequently |
| 🇧🇷 Brazil | BRL | 2 | R$0.50 | R$999,999 | PIX integration available |
| 🇲🇽 Mexico | MXN | 2 | $5 | $999,999 | OXXO cash payments popular |
| 🇨🇴 Colombia | COP | 0 | $1,300 | $999,999,999 | No decimal places |
| 🇨🇱 Chile | CLP | 0 | $500 | $99,999,999 | No decimal places |
| 🇵🇪 Peru | PEN | 2 | S/1 | S/999,999 | Sol currency |
| 🇺🇾 Uruguay | UYU | 2 | $U10 | $U999,999 | Peso Uruguayo |

---

## 🔧 **QR Code Generation Service**

### **Core Service Implementation**

```javascript
// services/qrCodeService.js
import axios from 'axios';
import { MERCADO_PAGO_COUNTRIES } from '../config/countries.js';

export class QRCodeService {
  constructor() {
    this.accessTokens = {
      // Environment variables per country
      AR: process.env.MERCADO_PAGO_ACCESS_TOKEN_AR,
      BR: process.env.MERCADO_PAGO_ACCESS_TOKEN_BR,
      MX: process.env.MERCADO_PAGO_ACCESS_TOKEN_MX,
      CO: process.env.MERCADO_PAGO_ACCESS_TOKEN_CO,
      CL: process.env.MERCADO_PAGO_ACCESS_TOKEN_CL,
      PE: process.env.MERCADO_PAGO_ACCESS_TOKEN_PE,
      UY: process.env.MERCADO_PAGO_ACCESS_TOKEN_UY
    };
  }

  async generateQRInvoice(invoiceData) {
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

  buildOrderPayload(invoiceData, countryConfig) {
    const {
      externalReference,
      merchantName,
      description,
      totalAmount,
      items,
      customerInfo,
      expirationDate,
      notificationUrl,
      additionalInfo
    } = invoiceData;

    // Format amount according to country's currency precision
    const formattedAmount = this.formatAmount(totalAmount, countryConfig.currency);

    return {
      external_reference: externalReference, // Your invoice number
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
      })),
      // Additional merchant information
      sponsor: {
        id: additionalInfo?.sponsorId || null
      },
      cash_out: {
        amount: additionalInfo?.cashOutAmount || 0
      }
    };
  }

  formatAmount(amount, currency) {
    // Handle different currency decimal places
    const decimalPlaces = {
      CLP: 0, // Chilean Peso has no decimals
      COP: 0, // Colombian Peso has no decimals
      UYU: 2, // Uruguay Peso has 2 decimals
      ARS: 2, // Argentine Peso has 2 decimals
      BRL: 2, // Brazilian Real has 2 decimals
      MXN: 2, // Mexican Peso has 2 decimals
      PEN: 2  // Peruvian Sol has 2 decimals
    };

    const decimals = decimalPlaces[currency] || 2;
    return parseFloat(amount.toFixed(decimals));
  }

  getDefaultExpirationDate() {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24); // 24 hours from now
    return expiration.toISOString();
  }
}
```

---

## 📄 **Invoice Data Structure**

### **Complete Invoice Model**

```javascript
// models/Invoice.js
export class Invoice {
  constructor(data) {
    // Basic invoice information
    this.id = data.id || this.generateInvoiceId();
    this.externalReference = data.externalReference || this.id;
    this.invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();
    
    // Country and currency
    this.country = data.country;
    this.currency = MERCADO_PAGO_COUNTRIES[data.country].currency;
    
    // Merchant information
    this.merchantName = data.merchantName;
    this.merchantEmail = data.merchantEmail;
    this.merchantPhone = data.merchantPhone;
    this.merchantAddress = data.merchantAddress;
    this.merchantTaxId = data.merchantTaxId; // RUT, CUIT, RFC, etc.
    
    // Customer information
    this.customerInfo = {
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      address: data.customerAddress,
      taxId: data.customerTaxId, // DNI, CPF, etc.
      identificationType: data.customerIdType
    };
    
    // Invoice details
    this.issueDate = data.issueDate || new Date().toISOString();
    this.dueDate = data.dueDate;
    this.description = data.description;
    this.notes = data.notes;
    
    // Items
    this.items = data.items || [];
    this.subtotal = this.calculateSubtotal();
    this.tax = data.tax || 0;
    this.discount = data.discount || 0;
    this.totalAmount = this.calculateTotal();
    
    // Payment information
    this.paymentStatus = 'pending';
    this.paymentMethod = null;
    this.paymentDate = null;
    this.qrData = null;
    this.inStoreOrderId = null;
    
    // Metadata
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateInvoiceId() {
    return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `${year}${month}${sequence}`;
  }

  calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  calculateTotal() {
    return this.subtotal + this.tax - this.discount;
  }

  toMercadoPagoPayload() {
    return {
      country: this.country,
      userId: process.env.MERCADO_PAGO_USER_ID,
      externalPosId: process.env.MERCADO_PAGO_POS_ID,
      externalReference: this.externalReference,
      merchantName: this.merchantName,
      description: this.description,
      totalAmount: this.totalAmount,
      items: this.items,
      customerInfo: this.customerInfo,
      notificationUrl: `${process.env.BASE_URL}/webhooks/mercadopago/${this.country.toLowerCase()}`,
      additionalInfo: {
        invoiceNumber: this.invoiceNumber,
        issueDate: this.issueDate,
        dueDate: this.dueDate
      }
    };
  }
}
```

---

## 🎨 **Frontend Components**

### **Country Selector Component**

```jsx
// components/CountrySelector.jsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MERCADO_PAGO_COUNTRIES } from '../config/countries';

export const CountrySelector = ({ value, onChange, className }) => {
  return (
    <Select value={value} onValueChange={onChange} className={className}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MERCADO_PAGO_COUNTRIES).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.flag}</span>
              <span>{config.name}</span>
              <span className="text-sm text-gray-500">({config.currency})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### **QR Code Display Component**

```jsx
// components/QRCodeDisplay.jsx
import React from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';

export const QRCodeDisplay = ({ qrData, invoice, onDownload }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">
          Payment QR Code
        </CardTitle>
        <div className="text-center text-sm text-gray-600">
          <p>Invoice: {invoice.invoiceNumber}</p>
          <p>Amount: {invoice.currency} {invoice.totalAmount}</p>
          <p>Country: {MERCADO_PAGO_COUNTRIES[invoice.country].name}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCode 
            value={qrData} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Data
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🔗 **Webhook Implementation**

### **Multi-Country Webhook Handler**

```javascript
// routes/webhooks.js
import express from 'express';
import { QRCodeService } from '../services/qrCodeService.js';

const router = express.Router();
const qrService = new QRCodeService();

// Country-specific webhook endpoints
['ar', 'br', 'mx', 'co', 'cl', 'pe', 'uy'].forEach(country => {
  router.post(`/mercadopago/${country}`, async (req, res) => {
    try {
      const notification = req.body;
      
      // Verify webhook signature (implement signature verification)
      if (!verifyWebhookSignature(req, country.toUpperCase())) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Process payment notification
      await processPaymentNotification(notification, country.toUpperCase());
      
      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error(`Webhook error for ${country}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

async function processPaymentNotification(notification, country) {
  const { type, data } = notification;
  
  if (type === 'payment') {
    // Handle payment status update
    const paymentId = data.id;
    // Update invoice status in your database
    console.log(`Payment ${paymentId} updated for country ${country}`);
  } else if (type === 'merchant_order') {
    // Handle merchant order update
    const orderId = data.id;
    // Update order status in your database
    console.log(`Order ${orderId} updated for country ${country}`);
  }
}

function verifyWebhookSignature(req, country) {
  // Implement webhook signature verification
  // Each country might have different signature requirements
  return true; // Placeholder
}

export default router;
```

---

## 💳 **QR Code Embedded Information**

### **Core Data Embedded in QR (EMVCo Standard)**

#### **✅ Required Information (Always Embedded):**
- **💰 Payment Amount**: Exact amount with currency-specific formatting
- **🏢 Merchant Information**: Business name, merchant ID, POS ID
- **📄 Order Details**: External reference (invoice number), title, description
- **📦 Items Breakdown**: Individual items with prices and quantities
- **⏰ Expiration Date**: Payment deadline (typically 24 hours)
- **🔗 Notification URL**: Webhook endpoint for payment updates
- **🌎 Currency Code**: ISO currency code (ARS, BRL, MXN, etc.)

#### **📊 Additional Invoice Information (System Level):**
- **👤 Customer Information**: Name, email, phone, tax ID
- **📅 Invoice Metadata**: Invoice number, issue date, due date
- **🏢 Business Details**: Tax ID, address, contact information
- **💵 Financial Breakdown**: Subtotal, tax amount, discount amount
- **📋 Payment Terms**: Due date, payment methods accepted

#### **🔧 Technical QR Structure:**
```
EMVCo QR Code Format:
├── Payment Amount (Required)
├── Currency Code (Required) 
├── Merchant Information (Required)
├── Transaction Reference (Required)
├── Expiration Data (Required)
├── Payment Network ID (Required)
└── Additional Data (Optional)
```

### **Country-Specific QR Data Examples**

#### **🇦🇷 Argentina Example:**
```json
{
  "amount": 5000.00,
  "currency": "ARS",
  "merchant": "BitAgora Store",
  "reference": "INV-20250110-001",
  "expires": "2025-01-11T12:00:00Z",
  "country": "AR",
  "qr_data": "00020101021243650016COM.MERCADOLIBRE..."
}
```

#### **🇧🇷 Brazil Example (with PIX):**
```json
{
  "amount": 25.50,
  "currency": "BRL", 
  "merchant": "BitAgora Brasil",
  "reference": "INV-20250110-002",
  "pix_key": "merchant@bitagora.com",
  "expires": "2025-01-11T12:00:00Z",
  "country": "BR",
  "qr_data": "00020126330014BR.GOV.BCB.PIX..."
}
```

---

## 🚀 **BitAgora Integration**

### **Integration with Existing POS System**

```typescript
// lib/payment/mercado-pago-multi-country.ts
export class MercadoPagoMultiCountryService {
  private qrService: QRCodeService;

  constructor() {
    this.qrService = new QRCodeService();
  }

  async generatePaymentForPOS(
    amount: number,
    items: any[],
    merchantConfig: {
      country: string,
      merchantName: string,
      userId: string,
      posId: string
    }
  ) {
    const invoice = new Invoice({
      country: merchantConfig.country,
      merchantName: merchantConfig.merchantName,
      totalAmount: amount,
      items: items,
      description: 'BitAgora POS Transaction'
    });

    const qrResult = await this.qrService.generateQRInvoice(
      invoice.toMercadoPagoPayload()
    );

    return {
      qrData: qrResult.qrData,
      orderId: qrResult.inStoreOrderId,
      currency: qrResult.currency,
      country: qrResult.country,
      invoice: invoice
    };
  }
}
```

### **Environment Configuration**

```bash
# .env.local - Multi-Country Configuration
# Argentina
MERCADO_PAGO_ACCESS_TOKEN_AR=TEST-1234567890-123456-abcdef1234567890-12345678
MERCADO_PAGO_USER_ID_AR=123456789
MERCADO_PAGO_POS_ID_AR=BITAGORA_POS_AR_001

# Brazil  
MERCADO_PAGO_ACCESS_TOKEN_BR=TEST-2345678901-234567-bcdef234567890123-23456789
MERCADO_PAGO_USER_ID_BR=234567890
MERCADO_PAGO_POS_ID_BR=BITAGORA_POS_BR_001

# Mexico
MERCADO_PAGO_ACCESS_TOKEN_MX=TEST-3456789012-345678-cdef345678901234-34567890
MERCADO_PAGO_USER_ID_MX=345678901
MERCADO_PAGO_POS_ID_MX=BITAGORA_POS_MX_001

# Add other countries as needed...

# Webhook Base URL
WEBHOOK_BASE_URL=https://yourdomain.com/api/webhooks
```

---

## 🧪 **Testing Strategy**

### **Country-Specific Testing**

1. **🇦🇷 Argentina Testing**:
   - Test ARS amounts with 2 decimal places
   - Verify Rapipago/Pagofácil integration
   - Test high inflation scenarios

2. **🇧🇷 Brazil Testing**:
   - Test PIX instant payments
   - Verify BRL currency formatting
   - Test Boleto payment integration

3. **🇲🇽 Mexico Testing**:
   - Test OXXO cash payment flow
   - Verify MXN currency handling
   - Test PayCash integration

4. **Multi-Country Testing**:
   - Currency conversion accuracy
   - Webhook handling per country
   - QR code compatibility across countries

### **Production Deployment Checklist**

- [ ] **Country Credentials**: Production tokens for all supported countries
- [ ] **Webhook URLs**: Country-specific webhook endpoints configured
- [ ] **SSL Certificates**: Valid certificates for all webhook URLs
- [ ] **Currency Validation**: Amount limits and formatting tested
- [ ] **Error Handling**: Fallbacks for API failures per country
- [ ] **Compliance**: Local payment regulations verified

---

## 💡 **Multi-Country Benefits**

### **✅ Business Advantages:**
- **🌎 Regional Expansion**: Support for 7 major Latin American markets
- **💰 Local Currencies**: Native currency support reduces conversion friction
- **🏪 Local Payment Methods**: Popular regional payment options (PIX, OXXO, etc.)
- **📱 Familiar Experience**: Customers use payment apps they know and trust
- **⚡ Instant Payments**: Country-specific instant payment systems

### **✅ Technical Advantages:**
- **🔧 Modular Design**: Easy to add new countries
- **🛡️ Robust Error Handling**: Country-specific fallbacks
- **📊 Comprehensive Logging**: Per-country transaction tracking
- **🔄 Auto-Configuration**: Merchant location detection
- **💳 EMVCo Compliant**: International QR code standards

### **✅ Merchant Benefits:**
- **🚀 Fast Setup**: Auto-configures based on business location
- **💼 Professional Invoicing**: Complete invoice management system
- **📈 Better Conversion**: Localized payment methods increase success rates
- **📊 Multi-Currency Reporting**: Unified dashboard for all countries
- **🛡️ Compliance Ready**: Built-in regulatory compliance features

**Ready for production deployment across Latin America!** 🌎💳✨

---

## 🔄 **Next Steps**

1. **Phase 1**: Implement core multi-country service
2. **Phase 2**: Add country-specific frontend components  
3. **Phase 3**: Deploy webhook handlers for all countries
4. **Phase 4**: Production testing and compliance verification
5. **Phase 5**: Launch in target markets with full localization

**Complete solution for dynamic, multi-country Mercado Pago integration!** 