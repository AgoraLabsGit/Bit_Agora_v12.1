// BitAgora Feature Management Admin Interface - Enhanced UI/UX
// Modern, professional interface for managing feature flags

"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Info, 
  Settings, 
  CreditCard, 
  Smartphone, 
  BarChart3, 
  Users, 
  Zap,
  ShoppingCart,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const featureCategories = {
  payments: {
    title: "Payment Methods",
    icon: CreditCard,
    description: "Control which payment options your customers see",
    features: [
      {
        id: 'bitcoin-payments',
        name: 'Bitcoin Payments',
        description: 'Accept Bitcoin payments with QR codes',
        enabled: true,
        status: 'active',
        impact: 'high',
        customerFacing: true
      },
      {
        id: 'lightning-payments',
        name: 'Lightning Network',
        description: 'Fast, low-fee Bitcoin payments',
        enabled: false,
        status: 'archived',
        archiveReason: 'Waiting for Strike API integration',
        impact: 'medium',
        customerFacing: true
      },
      {
        id: 'usdt-payments',
        name: 'USDT Payments',
        description: 'Accept USDT on Ethereum and Tron networks',
        enabled: true,
        status: 'active',
        impact: 'high',
        customerFacing: true
      },
      {
        id: 'credit-cards',
        name: 'Credit & Debit Cards',
        description: 'Traditional card payments via Stripe',
        enabled: false,
        status: 'archived',
        archiveReason: 'Phase 3 feature - focusing on crypto first',
        impact: 'high',
        customerFacing: true
      }
    ]
  },
  pos: {
    title: "Point of Sale",
    icon: ShoppingCart,
    description: "Customize your checkout experience",
    features: [
      {
        id: 'custom-amounts',
        name: 'Custom Amount Entry',
        description: 'Let customers add custom items and amounts',
        enabled: true,
        status: 'active',
        impact: 'medium',
        customerFacing: true
      },
      {
        id: 'tax-calculation',
        name: 'Tax Calculation',
        description: 'Automatic tax calculation for Argentina (21% IVA)',
        enabled: true,
        status: 'active',
        impact: 'high',
        customerFacing: false
      },
      {
        id: 'inventory-indicators',
        name: 'Stock Status Indicators',
        description: 'Show low stock and out-of-stock items',
        enabled: false,
        status: 'archived',
        archiveReason: 'Focus on payment improvements first',
        impact: 'low',
        customerFacing: true
      }
    ]
  },
  admin: {
    title: "Admin Tools",
    icon: Settings,
    description: "Administrative and management features",
    features: [
      {
        id: 'employee-scheduling',
        name: 'Employee Scheduling',
        description: 'Schedule and manage employee shifts',
        enabled: false,
        status: 'archived',
        archiveReason: 'Advanced admin feature for Phase 2',
        impact: 'low',
        customerFacing: false
      },
      {
        id: 'receipt-printer',
        name: 'Receipt Printer',
        description: 'Print physical receipts for transactions',
        enabled: false,
        status: 'archived',
        archiveReason: 'Optional hardware feature',
        impact: 'medium',
        customerFacing: false
      }
    ]
  },
  analytics: {
    title: "Analytics & Reports",
    icon: BarChart3,
    description: "Business insights and reporting tools",
    features: [
      {
        id: 'basic-analytics',
        name: 'Sales Dashboard',
        description: 'Basic sales metrics and transaction history',
        enabled: true,
        status: 'active',
        impact: 'medium',
        customerFacing: false
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Detailed business intelligence and forecasting',
        enabled: false,
        status: 'archived',
        archiveReason: 'Phase 4 feature - enterprise level',
        impact: 'low',
        customerFacing: false
      }
    ]
  }
}

export default function MerchantFeatureManagement() {
  const [activeTab, setActiveTab] = useState('payments')
  const [showArchived, setShowArchived] = useState(false)
  const [expandedFeatures, setExpandedFeatures] = useState(new Set())

  const toggleFeature = (featureId) => {
    console.log(`Toggling feature: ${featureId}`)
  }

  const restoreFeature = (featureId) => {
    console.log(`Restoring feature: ${featureId}`)
  }

  const toggleExpanded = (featureId) => {
    const newExpanded = new Set(expandedFeatures)
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId)
    } else {
      newExpanded.add(featureId)
    }
    setExpandedFeatures(newExpanded)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'archived': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'experimental': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const FeatureCard = ({ feature, categoryKey }) => {
    const isExpanded = expandedFeatures.has(feature.id)
    const isArchived = feature.status === 'archived'
    
    if (isArchived && !showArchived) return null

    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${isArchived ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between w-full min-h-[60px]">
            <div className="flex items-center space-x-6 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(feature.id)}
                className="h-6 w-6 p-0 flex-shrink-0 self-center"
              >
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-medium text-base leading-tight">{feature.name}</h3>
                
                {!isExpanded && (
                  <p className="text-sm text-gray-600 line-clamp-1 pr-4 mt-1 leading-tight">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-6 flex-shrink-0 ml-8 self-center">
              <div className="flex items-center space-x-3">
                <Badge className={`text-xs flex-shrink-0 ${getStatusColor(feature.status)}`}>
                  {feature.status}
                </Badge>
                {feature.customerFacing && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    <Eye className="h-3 w-3 mr-1" />
                    Customer Visible
                  </Badge>
                )}
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`w-3 h-3 rounded-full ${getImpactColor(feature.impact).replace('text-', 'bg-')}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Business Impact: {feature.impact}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {isArchived ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreFeature(feature.id)}
                  className="text-xs min-w-[70px]"
                >
                  Restore
                </Button>
              ) : (
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  size="sm"
                />
              )}
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-2">{feature.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Impact: <span className={getImpactColor(feature.impact)}>{feature.impact}</span></span>
                  <span>Visibility: {feature.customerFacing ? 'Customer Facing' : 'Internal Only'}</span>
                </div>
              </div>
              
              {feature.archiveReason && (
                <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                  <div className="flex items-center space-x-1">
                    <Info className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-800">Archive Reason:</span>
                  </div>
                  <p className="text-orange-700 mt-1">{feature.archiveReason}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const categoryData = featureCategories[activeTab]
  const totalFeatures = categoryData.features.length
  const activeFeatures = categoryData.features.filter(f => f.enabled && f.status === 'active').length
  const archivedFeatures = categoryData.features.filter(f => f.status === 'archived').length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Settings</h1>
          <p className="text-gray-600">Customize your BitAgora experience for your customers</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs"
          >
            {showArchived ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showArchived ? 'Hide' : 'Show'} Archived
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(featureCategories).map(([key, category]) => {
            const Icon = category.icon
            const categoryActiveFeatures = category.features.filter(f => f.enabled && f.status === 'active').length
            
            return (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryActiveFeatures}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(featureCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{activeFeatures}/{totalFeatures} Active</div>
                    {archivedFeatures > 0 && (
                      <div className="text-xs text-gray-500">{archivedFeatures} Archived</div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-2">
              {category.features.map((feature) => (
                <FeatureCard 
                  key={feature.id} 
                  feature={feature} 
                  categoryKey={key}
                />
              ))}
            </div>

            {showArchived && category.features.filter(f => f.status === 'archived').length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <Sparkles className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No archived features in this category</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">About Feature Management</h3>
              <p className="text-sm text-blue-800 mt-1">
                Control which features are visible to your customers. Archived features preserve your settings 
                and can be restored instantly when you're ready. Customer-facing features directly impact 
                what your customers see during checkout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 