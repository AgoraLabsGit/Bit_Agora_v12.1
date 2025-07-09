"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Users, 
  RefreshCw, 
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Zap,
  Star,
  AlertCircle
} from "lucide-react"

export default function SubscriptionManagementPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Subscription State
  const [subscription, setSubscription] = useState({
    currentPlan: {
      id: "free",
      name: "Free Plan",
      price: 0,
      billing: "monthly",
      features: [
        "Up to 100 transactions/month",
        "Basic payment methods",
        "Email support",
        "Basic reporting"
      ],
      limits: {
        transactions: 100,
        products: 50,
        employees: 1,
        storage: 1 // GB
      }
    },
    usage: {
      transactions: 45,
      products: 12,
      employees: 1,
      storage: 0.2
    },
    billingInfo: {
      nextBillingDate: "",
      paymentMethod: "",
      billingEmail: "",
      billingAddress: ""
    },
    availablePlans: [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        billing: "monthly",
        features: [
          "Up to 100 transactions/month",
          "Basic payment methods",
          "Email support",
          "Basic reporting"
        ],
        limits: {
          transactions: 100,
          products: 50,
          employees: 1,
          storage: 1
        },
        popular: false
      },
      {
        id: "basic",
        name: "Basic Plan",
        price: 29,
        billing: "monthly",
        features: [
          "Up to 1,000 transactions/month",
          "All payment methods",
          "Priority email support",
          "Advanced reporting",
          "Inventory management",
          "Basic analytics"
        ],
        limits: {
          transactions: 1000,
          products: 500,
          employees: 3,
          storage: 10
        },
        popular: true
      },
      {
        id: "pro",
        name: "Pro Plan",
        price: 79,
        billing: "monthly",
        features: [
          "Up to 10,000 transactions/month",
          "All payment methods",
          "Priority phone & email support",
          "Advanced reporting & analytics",
          "Full inventory management",
          "Employee management",
          "Custom integrations",
          "Advanced security features"
        ],
        limits: {
          transactions: 10000,
          products: 5000,
          employees: 10,
          storage: 100
        },
        popular: false
      }
    ]
  })

  const [billingHistory, setBillingHistory] = useState([
    {
      date: "2024-12-01",
      amount: 0,
      plan: "Free Plan",
      status: "active"
    }
  ])

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load subscription data from API
        const response = await fetch('/api/subscription')
        const data = await response.json()
        
        if (data.success && data.data) {
          setSubscription(prev => ({
            ...prev,
            ...data.data
          }))
        }
        
        // Load billing history
        const billingResponse = await fetch('/api/billing-history')
        const billingData = await billingResponse.json()
        
        if (billingData.success && billingData.data) {
          setBillingHistory(billingData.data)
        }
        
      } catch (error) {
        console.error('Failed to load subscription data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadSubscriptionData()
  }, [])

  const handlePlanChange = async (planId: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to change plan')
      }
      
      // Update subscription data
      const newPlan = subscription.availablePlans.find(p => p.id === planId)
      if (newPlan) {
        setSubscription(prev => ({
          ...prev,
          currentPlan: newPlan
        }))
      }
      
    } catch (error) {
      console.error('Failed to change plan:', error)
      alert(`Failed to change plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getBadgeVariant = (planId: string) => {
    if (planId === "free") return "secondary"
    if (planId === "basic") return "default"
    return "destructive"
  }

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading subscription information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plan, billing, and usage
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>Current Plan</span>
              <Badge variant={getBadgeVariant(subscription.currentPlan.id)}>
                {subscription.currentPlan.name}
              </Badge>
            </CardTitle>
            <CardDescription>Your current subscription details and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Plan Features</h3>
                <ul className="space-y-2">
                  {subscription.currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Usage This Month</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Transactions</span>
                      <span className="text-sm text-muted-foreground">
                        {subscription.usage.transactions} / {subscription.currentPlan.limits.transactions}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscription.usage.transactions, subscription.currentPlan.limits.transactions)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Products</span>
                      <span className="text-sm text-muted-foreground">
                        {subscription.usage.products} / {subscription.currentPlan.limits.products}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscription.usage.products, subscription.currentPlan.limits.products)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Employees</span>
                      <span className="text-sm text-muted-foreground">
                        {subscription.usage.employees} / {subscription.currentPlan.limits.employees}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscription.usage.employees, subscription.currentPlan.limits.employees)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Storage</span>
                      <span className="text-sm text-muted-foreground">
                        {subscription.usage.storage} GB / {subscription.currentPlan.limits.storage} GB
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscription.usage.storage, subscription.currentPlan.limits.storage)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Current Plan: {subscription.currentPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${subscription.currentPlan.price}/{subscription.currentPlan.billing}
                </p>
              </div>
              {subscription.currentPlan.id !== "pro" && (
                <Button
                  onClick={() => handlePlanChange(subscription.currentPlan.id === "free" ? "basic" : "pro")}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span>Available Plans</span>
            </CardTitle>
            <CardDescription>Choose the plan that best fits your business needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscription.availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-lg border-2 ${
                    plan.id === subscription.currentPlan.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-border'
                  } ${plan.popular ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.billing}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Transactions:</span>
                      <span>{plan.limits.transactions.toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span>{plan.limits.products.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employees:</span>
                      <span>{plan.limits.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span>{plan.limits.storage} GB</span>
                    </div>
                  </div>
                  
                  {plan.id === subscription.currentPlan.id ? (
                    <Button className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isLoading}
                      className="w-full"
                      variant={plan.id === "free" ? "outline" : "default"}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : plan.price > subscription.currentPlan.price ? (
                        <ArrowUp className="h-4 w-4 mr-2" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-2" />
                      )}
                      {plan.price > subscription.currentPlan.price ? 'Upgrade' : 
                       plan.price < subscription.currentPlan.price ? 'Downgrade' : 'Select'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span>Billing Information</span>
            </CardTitle>
            <CardDescription>Payment method and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    {subscription.billingInfo.paymentMethod || "No payment method on file"}
                  </p>
                  <Button variant="outline" className="mt-2">
                    Update Payment Method
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Next Billing Date</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {subscription.billingInfo.nextBillingDate || "No upcoming billing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Billing History</span>
            </CardTitle>
            <CardDescription>Your recent billing transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{bill.plan}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${bill.amount}</p>
                    <Badge variant={bill.status === "active" ? "default" : "secondary"}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Subscription Management</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can upgrade or downgrade your plan at any time. Changes will take effect immediately, 
                  and you'll be charged or credited on a prorated basis. Your usage limits will update 
                  automatically with your new plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 