// BitAgora Payment Method Card Component
// Reusable card component for different payment method types

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from 'lucide-react'

interface PaymentMethodCardProps {
  // Card Information
  title: string
  description: string
  icon: LucideIcon
  
  // Payment Method Configuration
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  disabled?: boolean
  
  // Optional Content
  children?: React.ReactNode
  
  // Styling
  className?: string
  
  // Status Badges
  status?: 'active' | 'coming-soon' | 'disabled'
  statusText?: string
}

export function PaymentMethodCard({
  title,
  description,
  icon: Icon,
  enabled,
  onEnabledChange,
  disabled = false,
  children,
  className = '',
  status,
  statusText
}: PaymentMethodCardProps) {
  const isComingSoon = status === 'coming-soon'
  const isDisabled = disabled || isComingSoon
  
  return (
    <Card className={`${isComingSoon ? 'opacity-50' : ''} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          {status && statusText && (
            <Badge 
              variant={status === 'coming-soon' ? 'outline' : 'default'}
              className="ml-auto"
            >
              {statusText}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Main Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-semibold text-foreground">
              {isComingSoon ? `${title} (Coming Soon)` : `Accept ${title}`}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Checkbox 
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={isDisabled}
          />
        </div>
        
        {/* Expandable Content */}
        {children && enabled && !isComingSoon && (
          <div className="mt-4">
            {children}
          </div>
        )}
        
        {/* Coming Soon Notification */}
        {isComingSoon && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{statusText || 'Coming Soon'}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This payment method will be available in a future release. 
                  For now, focus on other available payment options.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 