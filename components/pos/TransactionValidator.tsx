'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Package,
  DollarSign,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { CartItem } from '@/app/pos/types/product';
import { TaxCalculationResult } from '@/lib/tax-calculation';

interface TransactionValidatorProps {
  cartItems: CartItem[];
  taxCalculation: TaxCalculationResult;
  onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

interface ValidationError {
  type: 'warning' | 'error' | 'info';
  message: string;
  field?: string;
  action?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export default function TransactionValidator({
  cartItems,
  taxCalculation,
  onValidationChange,
  className
}: TransactionValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  });

  const [isValidating, setIsValidating] = useState(false);

  // Validate transaction in real-time
  const validation = useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // 1. Cart validation
    if (cartItems.length === 0) {
      errors.push({
        type: 'error',
        message: 'Cart is empty',
        field: 'cart'
      });
    }

    // 2. Item availability validation
    cartItems.forEach(item => {
      if (item.isOutOfStock) {
        errors.push({
          type: 'error',
          message: `${item.name} is out of stock`,
          field: 'inventory',
          action: 'Remove item or restock'
        });
      }

      if (item.stockQuantity && item.stockQuantity < item.quantity) {
        errors.push({
          type: 'error',
          message: `Insufficient stock for ${item.name} (${item.stockQuantity} available, ${item.quantity} requested)`,
          field: 'inventory',
          action: 'Adjust quantity'
        });
      }

      // Low stock warning
      if (item.stockQuantity && item.lowStockThreshold && 
          item.stockQuantity <= item.lowStockThreshold && 
          item.stockQuantity >= item.quantity) {
        warnings.push({
          type: 'warning',
          message: `${item.name} is running low (${item.stockQuantity} remaining)`,
          field: 'inventory',
          action: 'Consider restocking'
        });
      }
    });

    // 3. Pricing validation
    const hasNegativePrice = cartItems.some(item => item.price < 0);
    if (hasNegativePrice) {
      errors.push({
        type: 'error',
        message: 'Items with negative prices found',
        field: 'pricing'
      });
    }

    const hasZeroPrice = cartItems.some(item => item.price === 0);
    if (hasZeroPrice) {
      warnings.push({
        type: 'warning',
        message: 'Items with zero price found',
        field: 'pricing',
        action: 'Verify pricing'
      });
    }

    // 4. Tax validation
    if (taxCalculation.totalTax < 0) {
      errors.push({
        type: 'error',
        message: 'Invalid tax calculation',
        field: 'tax'
      });
    }

    // 5. Total validation
    if (taxCalculation.total <= 0) {
      errors.push({
        type: 'error',
        message: 'Invalid transaction total',
        field: 'total'
      });
    }

    // 6. Large transaction warning
    if (taxCalculation.total > 1000) {
      warnings.push({
        type: 'warning',
        message: `Large transaction amount: $${taxCalculation.total.toFixed(2)}`,
        field: 'total',
        action: 'Verify with customer'
      });
    }

    // 7. Bulk quantity warning
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 20) {
      warnings.push({
        type: 'warning',
        message: `Large quantity order: ${totalQuantity} items`,
        field: 'quantity',
        action: 'Verify with customer'
      });
    }

    // 8. Transaction info
    if (cartItems.length > 0) {
      info.push({
        type: 'info',
        message: `${cartItems.length} item types, ${totalQuantity} total items`,
        field: 'summary'
      });
    }

    if (taxCalculation.totalTax > 0) {
      info.push({
        type: 'info',
        message: `Tax: $${taxCalculation.totalTax.toFixed(2)} (${(taxCalculation.taxRate * 100).toFixed(1)}%)`,
        field: 'tax'
      });
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      info
    };
  }, [cartItems, taxCalculation]);

  // Update validation state
  useEffect(() => {
    setValidationResult(validation);
    onValidationChange?.(validation.isValid, [...validation.errors, ...validation.warnings]);
  }, [validation, onValidationChange]);

  const handleRevalidate = () => {
    setIsValidating(true);
    // Simulate validation delay
    setTimeout(() => {
      setIsValidating(false);
    }, 1000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = () => {
    if (validationResult.errors.length > 0) {
      return <Badge variant="destructive">Invalid</Badge>;
    }
    if (validationResult.warnings.length > 0) {
      return <Badge variant="secondary">Warnings</Badge>;
    }
    return <Badge variant="default">Valid</Badge>;
  };

  const allIssues = [
    ...validationResult.errors,
    ...validationResult.warnings,
    ...validationResult.info
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Transaction Validation</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevalidate}
              disabled={isValidating}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span>{cartItems.length} items</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>${taxCalculation.total.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>{validationResult.errors.length + validationResult.warnings.length} issues</span>
          </div>
        </div>

        {/* Validation Results */}
        {allIssues.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {allIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg bg-background border text-sm"
              >
                {getIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{issue.message}</p>
                  {issue.action && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Action: {issue.action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Clear Message */}
        {allIssues.length === 0 && cartItems.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700">Transaction ready for processing</span>
          </div>
        )}

        {/* Empty State */}
        {cartItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add items to validate transaction</p>
          </div>
        )}
      </div>
    </Card>
  );
} 