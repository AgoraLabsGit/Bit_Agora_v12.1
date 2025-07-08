// /components/pos/payment/PaymentMethodSelector.tsx
// Payment method selection component

"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PaymentOption } from '@/hooks/use-payment-settings'

interface PaymentMethodSelectorProps {
  paymentOptions: PaymentOption[]
  selectedMethod: string | null
  onMethodSelect: (method: string) => void
  isLoading?: boolean
  className?: string
}

export const PaymentMethodSelector = ({
  paymentOptions,
  selectedMethod,
  onMethodSelect,
  isLoading = false,
  className
}: PaymentMethodSelectorProps) => {
  const [activeTab, setActiveTab] = useState<string>('crypto')

  // Group options by category
  const groupedOptions = paymentOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, PaymentOption[]>)

  // Get available categories
  const categories = Object.keys(groupedOptions)
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'crypto': return 'Crypto'
      case 'qr': return 'QR Code'
      case 'cash': return 'Cash'
      case 'card': return 'Card'
      default: return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crypto': return '₿'
      case 'qr': return '📱'
      case 'cash': return '💵'
      case 'card': return '💳'
      default: return '💰'
    }
  }

  // Handle method selection
  const handleMethodSelect = (method: string) => {
    onMethodSelect(method)
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No payment methods configured</p>
          <p className="text-sm text-muted-foreground mt-2">
            Configure payment methods in settings to continue
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Category Tabs */}
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="flex items-center gap-2"
            >
              <span>{getCategoryIcon(category)}</span>
              <span className="hidden sm:inline">{getCategoryLabel(category)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Method Selection for Each Category */}
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupedOptions[category].map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedMethod === option.id
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleMethodSelect(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium text-sm">{option.name}</span>
                      </div>
                      {selectedMethod === option.id && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    {option.description && (
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Start Button */}
            {selectedMethod && groupedOptions[category].some(opt => opt.id === selectedMethod) && (
              <div className="pt-4">
                <Button 
                  onClick={() => handleMethodSelect(selectedMethod)}
                  className="w-full"
                  size="lg"
                >
                  Continue with {groupedOptions[category].find(opt => opt.id === selectedMethod)?.name}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 