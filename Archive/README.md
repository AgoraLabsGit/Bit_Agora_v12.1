# BitAgora Archive

This directory contains files that were removed from the active codebase during cleanup and refactoring.

## Archive Date: 2024-01-11

## Archived Files

### Components (components/pos/payment/)
- **LightningPaymentFlow.tsx.archived** - Unused Lightning payment component, functionality integrated into PaymentMethodSelector
- **PaymentStatusMonitor.tsx.archived** - Unused payment status monitor, replaced by PaymentStatusBar
- **CardPaymentFlow.tsx.archived** - Incomplete card payment stub, not implemented

### Services (lib/)
- **lightning-service.ts.archived** - LNBits Lightning service, replaced by Strike API integration
- **payment-monitoring.ts.archived** - Mock payment monitoring service, replaced by real Strike API monitoring
- **qr-gateway.ts.archived** - Stripe/Mercado Pago QR gateway, not part of current Strike API implementation

### API Routes (api/lightning/)
- **status-route.ts.archived** - Old LNBits status route, conflicts with Strike API [invoiceId] route

## Current Active Payment Architecture

### Components (components/pos/payment/)
- **PaymentModal.tsx** - Main payment modal with integrated flows
- **PaymentMethodSelector.tsx** - Payment method selection with inline Lightning QR
- **PaymentSummary.tsx** - Payment summary display
- **PaymentStatusBar.tsx** - Horizontal payment status progression
- **CryptoPaymentFlow.tsx** - Crypto payment handling
- **QRCodePaymentFlow.tsx** - QR code payment handling
- **CashPaymentFlow.tsx** - Cash payment handling
- **PaymentStatusIndicator.tsx** - Payment status indicator

### Services (lib/)
- **strike-lightning-service.ts** - Real Strike API integration
- **payment-api.ts** - Payment settings database
- **lightning-config.ts** - Lightning configuration
- **crypto-exchange-service.ts** - Exchange rate service

### Utilities (lib/payment/)
- **qr-generation.ts** - QR code generation with Strike API integration

### API Routes (app/api/lightning/)
- **generate-invoice/route.ts** - Strike API invoice generation
- **status/[invoiceId]/route.ts** - Strike API status checking

## Reason for Archival

The archived files were removed to:
1. **Eliminate redundancy** - Multiple files performing similar functions
2. **Remove unused code** - Components and services with no imports/references
3. **Consolidate architecture** - Single Strike API implementation instead of multiple payment providers
4. **Improve maintainability** - Cleaner file structure with clear separation of concerns

## Recovery Instructions

If any archived functionality is needed:
1. Copy the archived file back to its original location
2. Remove the `.archived` extension
3. Update imports and dependencies as needed
4. Ensure compatibility with current Strike API implementation 