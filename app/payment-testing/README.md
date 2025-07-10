# Payment Testing Lab

## Overview

The Payment Testing Lab is an isolated development environment for testing new payment integrations without affecting your production payment flows. It's designed to safely test **Mercado Pago QR codes** and **BTC Pay Server** integrations.

## Access

Navigate to `/payment-testing` in your browser while the development server is running.

## Features

### 🧪 Isolated Testing Environment
- Completely separate from production POS system
- Mock API responses for safe development
- No real payments are processed
- All test data is logged for debugging

### 🏦 Mercado Pago QR Testing
- Test dynamic QR code generation
- Support for 7 Latin American countries:
  - 🇦🇷 Argentina (ARS)
  - 🇧🇷 Brazil (BRL) 
  - 🇲🇽 Mexico (MXN)
  - 🇨🇴 Colombia (COP)
  - 🇨🇱 Chile (CLP)
  - 🇵🇪 Peru (PEN)
  - 🇺🇾 Uruguay (UYU)
- Country-specific currency handling
- Min/max amount validation
- QR data preview and copying

### ₿ BTC Pay Server Testing
- Bitcoin on-chain invoice generation
- Lightning Network invoice testing
- Exchange rate simulation
- Fee estimation
- Multiple payment method support

## Usage

### 1. Configure Test Transaction
- Set the amount (respects country minimums)
- Select target country (auto-updates currency)
- Add transaction description
- Currency is automatically set based on country

### 2. Test Mercado Pago
- Click "Generate QR Code" 
- View QR data structure
- Check country-specific configurations
- Copy QR data for external testing
- Monitor API response structure

### 3. Test BTC Pay Server
- Click "Create Invoice"
- View both Bitcoin and Lightning options
- Check exchange rates and fees
- Copy payment URLs and invoices
- Monitor webhook configurations

## Country-Specific Testing

Each country has different characteristics to test:

| Country | Currency | Decimals | Min Amount | Special Notes |
|---------|----------|----------|------------|---------------|
| Argentina | ARS | 2 | 100 | Primary MVP target |
| Brazil | BRL | 2 | 1 | PIX integration |
| Mexico | MXN | 2 | 10 | SPEI integration |
| Colombia | COP | 0 | 1000 | No decimal places |
| Chile | CLP | 0 | 500 | No decimal places |
| Peru | PEN | 2 | 5 | Standard format |
| Uruguay | UYU | 2 | 50 | Standard format |

## API Endpoints

The testing lab uses mock API endpoints:

- `POST /api/payment-testing/mercado-pago` - Generate test QR codes
- `POST /api/payment-testing/btcpay-server` - Create test invoices

## Development Notes

### Next Steps
1. Replace mock APIs with real Mercado Pago/BTC Pay Server integration
2. Add webhook testing interface
3. Add payment status simulation
4. Integrate with real QR code generation libraries

### Mock Data Structure
- All responses include `test_mode: true` flag
- Payment IDs are prefixed with `mp_test_` or `btcpay_test_`
- Expiration times are shortened for testing
- Exchange rates are simulated

### Error Testing
The mock APIs will occasionally return errors to test error handling:
- Invalid amounts
- Unsupported countries
- API timeouts
- Malformed requests

## Safety Features

- ⚠️ **Test Environment Badge** - Always visible to prevent confusion
- 🔒 **No Real Payments** - All transactions are mocked
- 📝 **Comprehensive Logging** - All actions are logged to console
- 🚫 **Isolated from Production** - No interaction with live payment systems

## Troubleshooting

### QR Code Not Displaying
- Check browser console for API errors
- Verify test transaction parameters
- Ensure development server is running

### API Errors
- Check network tab in browser dev tools
- Verify request payload structure
- Check server console for error logs

### Country-Specific Issues
- Verify minimum amounts for each country
- Check decimal place handling (Chile/Colombia have 0 decimals)
- Test currency formatting

## Integration with Main System

Once testing is complete, the payment provider architecture can be integrated into the main POS system:

1. Move tested APIs to production endpoints
2. Update `PaymentMethodSelector` component
3. Add country detection/selection to merchant settings
4. Implement real webhook handlers
5. Add production API credentials management

## Security Considerations

- All test data should be clearly marked
- Never use production API keys in testing environment
- Ensure test webhooks don't affect production data
- Clear test data regularly to prevent confusion 