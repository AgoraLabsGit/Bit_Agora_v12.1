'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Calculator, DollarSign, Plus, Minus, Delete } from 'lucide-react';

interface CashTenderingModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (amountTendered: number, change: number) => void;
  currency?: 'USD' | 'ARS' | 'BTC'; // Default USD, Argentina Pesos, Bitcoin
  onExactCash?: () => void;
}

interface QuickButton {
  value: number;
  label: string;
}

export const CashTenderingModal: React.FC<CashTenderingModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentComplete,
  currency = 'USD',
  onExactCash
}) => {
  const [enteredAmount, setEnteredAmount] = useState<string>('');
  const [displayAmount, setDisplayAmount] = useState<string>('0.00');
  const [change, setChange] = useState<number>(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEnteredAmount('');
      setDisplayAmount('0.00');
      setChange(0);
    }
  }, [isOpen]);

  // Calculate change when amount changes
  useEffect(() => {
    const amount = parseFloat(enteredAmount) || 0;
    const calculatedChange = Math.max(0, amount - totalAmount);
    setChange(calculatedChange);
  }, [enteredAmount, totalAmount]);

  // Regional quick buttons configuration
  const getQuickButtons = (): QuickButton[] => {
    switch (currency) {
      case 'ARS':
        return [
          { value: 1000, label: '$1,000' },
          { value: 2000, label: '$2,000' },
          { value: 5000, label: '$5,000' },
          { value: 10000, label: '$10,000' },
          { value: 20000, label: '$20,000' },
          { value: 50000, label: '$50,000' },
        ];
      case 'USD':
      default:
        return [
          { value: 1, label: '$1' },
          { value: 5, label: '$5' },
          { value: 10, label: '$10' },
          { value: 20, label: '$20' },
          { value: 50, label: '$50' },
          { value: 100, label: '$100' },
        ];
    }
  };

  const quickButtons = getQuickButtons();

  // Format currency display
  const formatCurrency = (amount: number): string => {
    switch (currency) {
      case 'ARS':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 2,
        }).format(amount);
      case 'USD':
      default:
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(amount);
    }
  };

  // Number pad button click handler
  const handleNumberClick = useCallback((digit: string) => {
    setEnteredAmount(prev => {
      const newAmount = prev + digit;
      const formatted = formatDisplayAmount(newAmount);
      setDisplayAmount(formatted);
      return newAmount;
    });
  }, []);

  // Format display amount
  const formatDisplayAmount = (amount: string): string => {
    const numericAmount = parseFloat(amount) || 0;
    return (numericAmount / 100).toFixed(2);
  };

  // Clear all input
  const handleClear = () => {
    setEnteredAmount('');
    setDisplayAmount('0.00');
  };

  // Remove last digit
  const handleBackspace = () => {
    setEnteredAmount(prev => {
      const newAmount = prev.slice(0, -1);
      const formatted = formatDisplayAmount(newAmount);
      setDisplayAmount(formatted);
      return newAmount;
    });
  };

  // Add decimal point
  const handleDecimal = () => {
    if (!enteredAmount.includes('.')) {
      setEnteredAmount(prev => prev + '.');
    }
  };

  // Add quick button amount
  const handleQuickButton = (value: number) => {
    const currentAmount = parseFloat(enteredAmount) || 0;
    const newAmount = ((currentAmount * 100) + (value * 100)) / 100;
    const amountString = (newAmount * 100).toString();
    setEnteredAmount(amountString);
    setDisplayAmount(newAmount.toFixed(2));
  };

  // Handle exact cash payment
  const handleExactCash = () => {
    if (onExactCash) {
      onExactCash();
    } else {
      onPaymentComplete(totalAmount, 0);
    }
    onClose();
  };

  // Handle payment completion
  const handleCompletePayment = () => {
    const amount = parseFloat(enteredAmount) || 0;
    const actualAmount = amount / 100;
    
    if (actualAmount >= totalAmount) {
      onPaymentComplete(actualAmount, change);
      onClose();
    }
  };

  // Get current amount value
  const currentAmount = parseFloat(enteredAmount) || 0;
  const actualAmount = currentAmount / 100;
  const isInsufficientAmount = actualAmount < totalAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Cash Payment</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Amount Display */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-center space-y-2">
              <div className="text-sm text-slate-400">Total Amount</div>
              <div className="text-2xl font-bold text-slate-100">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          {/* Entered Amount Display */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-center space-y-2">
              <div className="text-sm text-slate-400">Amount Tendered</div>
              <div className="text-3xl font-bold text-blue-400 font-mono">
                {formatCurrency(actualAmount)}
              </div>
              {isInsufficientAmount && actualAmount > 0 && (
                <div className="text-sm text-red-400">
                  Insufficient amount
                </div>
              )}
            </div>
          </div>

          {/* Change Display */}
          {change > 0 && (
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
              <div className="text-center space-y-2">
                <div className="text-sm text-green-400">Change</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(change)}
                </div>
              </div>
            </div>
          )}

          {/* Quick Buttons */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300">Quick Amounts</div>
            <div className="grid grid-cols-3 gap-2">
              {quickButtons.map((button) => (
                <Button
                  key={button.value}
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                  onClick={() => handleQuickButton(button.value)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {button.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Number Pad */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300">Number Pad</div>
            <div className="grid grid-cols-3 gap-2">
              {/* Row 1 */}
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('1')}
              >
                1
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('2')}
              >
                2
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('3')}
              >
                3
              </Button>

              {/* Row 2 */}
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('4')}
              >
                4
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('5')}
              >
                5
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('6')}
              >
                6
              </Button>

              {/* Row 3 */}
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('7')}
              >
                7
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('8')}
              >
                8
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('9')}
              >
                9
              </Button>

              {/* Row 4 */}
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 text-lg font-semibold"
                onClick={() => handleNumberClick('0')}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                onClick={handleBackspace}
              >
                <Delete className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleExactCash}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Exact Cash ({formatCurrency(totalAmount)})
            </Button>
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              disabled={isInsufficientAmount}
              onClick={handleCompletePayment}
            >
              Complete Payment
              {change > 0 && (
                <span className="ml-2">
                  (Change: {formatCurrency(change)})
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 