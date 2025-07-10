Perfect! Here's the updated design with 5 equal-width buttons including a "Custom" option:

Updated Visual Design
┌─────────────────────────────────────────────────────────────────────┐
│                        Payment Checkout                     ✕      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Select Payment Method                     Payment Summary          │
│  ┌─────────────┐ ┌──────────┐ ┌──────────┐                        │
│  │  ₿ Crypto   │ │ QR Code  │ │   Cash   │  ITEMS                 │
│  │   (active)  │ │   N/A    │ │          │  1x Fresh Juice  $4.00 │
│  └─────────────┘ └──────────┘ └──────────┘                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Add Tip (Optional)                       │   │
│  │                                                             │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │   │
│  │  │  5%  │ │ 10%  │ │ 15%  │ │ 20%  │ │Custom│               │   │
│  │  │ $0.20│ │ $0.40│ │ $0.60│ │ $0.80│ │ ✏️   │               │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘               │   │
│  │                                                             │   │
│  │  Custom Amount:                               Current: $0.60│   │
│  │  $0.00 ├────●──────────────────────────────┤ $4.00         │   │
│  │                    Tip: $0.60 (15%)                        │   │
│  │                                                             │   │
│  │              ┌──────────────────┐                          │   │
│  │              │   Continue →     │                          │   │
│  │              └──────────────────┘                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                               Subtotal    $4.00    │
│                                               Tip        +$0.60    │
│                                               IVA (21.0%) $0.70    │
│                                               ─────────────────    │
│                                               Total       $5.30    │
│                                                                     │
│  Bitcoin selected                                        Cancel    │
└─────────────────────────────────────────────────────────────────────┘
Updated Component Implementation
// components/checkout/TippingInterface.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Edit3 } from 'lucide-react'; // For the custom icon
interface TippingInterfaceProps {
  subtotal: number;
  currency: string;
  onTipChange: (tipAmount: number) => void;
  onContinue: () => void;
  onSkip: () => void;
}
export const TippingInterface: React.FC<TippingInterfaceProps> = ({
  subtotal,
  currency,
  onTipChange,
  onContinue,
  onSkip
}) => {
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const quickTipOptions = [
    { percentage: 5, label: '5%' },
    { percentage: 10, label: '10%' },
    { percentage: 15, label: '15%' },
    { percentage: 20, label: '20%' }
  ];
  const calculateTipAmount = (percentage: number): number => {
    return (subtotal * percentage) / 100;
  };
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };
  const handleQuickTipSelect = (percentage: number) => {
    const tipAmount = calculateTipAmount(percentage);
    setSelectedTipPercentage(percentage);
    setIsCustomMode(false);
    setCustomTipAmount(tipAmount);
    onTipChange(tipAmount);
  };
  const handleCustomModeSelect = () => {
    setSelectedTipPercentage(null);
    setIsCustomMode(true);
    // Keep the current custom amount if it exists, otherwise start at 0
    onTipChange(customTipAmount);
  };
  const handleCustomTipChange = (value: number[]) => {
    const tipAmount = value[0];
    setCustomTipAmount(tipAmount);
    setSelectedTipPercentage(null);
    setIsCustomMode(true);
    onTipChange(tipAmount);
  };
  const getCurrentTipAmount = (): number => {
    if (isCustomMode) return customTipAmount;
    if (selectedTipPercentage) return calculateTipAmount(selectedTipPercentage);
    return 0;
  };
  const getCurrentTipPercentage = (): number => {
    const currentTip = getCurrentTipAmount();
    return subtotal > 0 ? (currentTip / subtotal) * 100 : 0;
  };
  return (
    <Card className="bg-slate-800 border-slate-700 w-full">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Add Tip (Optional)
          </h3>
          <p className="text-slate-400 text-sm">
            Show your appreciation for great service
          </p>
        </div>
        {/* Tip Options - 5 equal width buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {/* Quick Tip Percentage Buttons */}
            {quickTipOptions.map((option) => {
              const tipAmount = calculateTipAmount(option.percentage);
              const isSelected = selectedTipPercentage === option.percentage && !isCustomMode;
              
              return (
                <Button
                  key={option.percentage}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    h-16 flex flex-col justify-center space-y-1 transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white hover:border-slate-500'
                    }
                  `}
                  onClick={() => handleQuickTipSelect(option.percentage)}
                >
                  <span className="font-semibold text-lg">{option.label}</span>
                  <span className="text-xs opacity-80">
                    {formatAmount(tipAmount)}
                  </span>
                </Button>
              );
            })}
            
            {/* Custom Amount Button */}
            <Button
              variant={isCustomMode ? "default" : "outline"}
              className={`
                h-16 flex flex-col justify-center space-y-1 transition-all duration-200
                ${isCustomMode 
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white hover:border-slate-500'
                }
              `}
              onClick={handleCustomModeSelect}
            >
              <span className="font-semibold text-lg">Custom</span>
              <Edit3 className="w-4 h-4 opacity-80" />
            </Button>
          </div>
        </div>
        {/* Custom Amount Slider - Only show when custom is selected */}
        {isCustomMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Custom Amount:</h4>
              <span className="text-blue-400 font-semibold">
                Current: {formatAmount(getCurrentTipAmount())}
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Slider with labels */}
              <div className="relative">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>$0.00</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                
                <Slider
                  value={[customTipAmount]}
                  onValueChange={handleCustomTipChange}
                  max={subtotal}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              
              {/* Current tip display */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-slate-700 rounded-lg px-4 py-2">
                  <span className="text-slate-400 text-sm">Tip:</span>
                  <span className="text-white font-semibold text-lg">
                    {formatAmount(getCurrentTipAmount())}
                  </span>
                  {getCurrentTipAmount() > 0 && (
                    <span className="text-slate-400 text-sm">
                      ({getCurrentTipPercentage().toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Show current tip for non-custom modes */}
        {!isCustomMode && getCurrentTipAmount() > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-700 rounded-lg px-4 py-2">
              <span className="text-slate-400 text-sm">Selected Tip:</span>
              <span className="text-white font-semibold text-lg">
                {formatAmount(getCurrentTipAmount())}
              </span>
              <span className="text-slate-400 text-sm">
                ({getCurrentTipPercentage().toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => {
              setSelectedTipPercentage(null);
              setCustomTipAmount(0);
              setIsCustomMode(false);
              onTipChange(0);
              onSkip();
            }}
          >
            Skip Tip
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onContinue}
          >
            Continue →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
Alternative Custom Button Design
If you prefer a different icon or text for the custom button:

// Option 1: Just text
<Button>
  <span className="font-semibold text-lg">Custom</span>
  <span className="text-xs opacity-80">Set Amount</span>
</Button>
// Option 2: With dollar sign icon
<Button>
  <span className="font-semibold text-lg">Custom</span>
  <span className="text-xl opacity-80">$</span>
</Button>
// Option 3: With percentage icon
<Button>
  <span className="font-semibold text-lg">Custom</span>
  <span className="text-xs opacity-80">%</span>
</Button>
// Option 4: With input icon
import { Calculator } from 'lucide-react';
<Button>
  <span className="font-semibold text-lg">Custom</span>
  <Calculator className="w-4 h-4 opacity-80" />
</Button>
Responsive Considerations
For smaller screens, you might want to adjust the button grid:

// Responsive grid classes
<div className="grid grid-cols-5 gap-2 sm:gap-3">
  {/* buttons */}
</div>
// Smaller text on mobile
<span className="font-semibold text-base sm:text-lg">{option.label}</span>
<span className="text-[10px] sm:text-xs opacity-80">
  {formatAmount(tipAmount)}
</span>
Key Features Added:
5 Equal-Width Buttons: All buttons now span the full width equally using grid-cols-5
Custom Button: Added as the 5th button with edit icon for visual distinction
Conditional Slider: Slider only appears when "Custom" is selected
Smart State Management: Tracks whether user is in custom mode or percentage mode
Visual Feedback: Selected button gets blue background, unselected stay slate
Consistent Spacing: All buttons maintain the same height and spacing
Icon Usage: Edit icon clearly indicates custom input option
The interface now provides a more streamlined experience where users can either pick a quick percentage or dive into custom amounts, with the slider only appearing when needed.