"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Gift, 
  Percent, 
  Calendar, 
  Truck, 
  Star,
  CreditCard,
  Settings, 
  RefreshCw, 
  Save,
  CheckCircle
} from "lucide-react"

export default function CustomersDiscountsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Customer & Discount Settings State
  const [customerSettings, setCustomerSettings] = useState({
    // Loyalty Program
    loyaltyProgram: {
      enabled: false,
      pointsPerDollar: "1",
      pointsValue: "0.01", // $0.01 per point
      minimumPointsRedemption: "100",
      welcomeBonus: "0",
      referralBonus: "50",
      birthdayBonus: "100"
    },
    
    // Discount Management
    discounts: {
      enabled: true,
      maxDiscountPercent: "50",
      employeeDiscountPercent: "10",
      seniorDiscountPercent: "5",
      studentDiscountPercent: "10",
      bulkDiscountEnabled: false,
      bulkDiscountThreshold: "100",
      bulkDiscountPercent: "5"
    },
    
    // Gift Cards
    giftCards: {
      enabled: false,
      minAmount: "10",
      maxAmount: "500",
      expiryMonths: "12",
      transferable: true,
      emailDelivery: true,
      physicalCards: false
    },
    
    // Reservations
    reservations: {
      enabled: false,
      maxAdvanceDays: "30",
      minAdvanceHours: "2",
      maxPartySize: "8",
      requireDeposit: false,
      depositAmount: "20",
      cancellationHours: "24",
      confirmationEmail: true
    },
    
    // Delivery
    delivery: {
      enabled: false,
      deliveryRadius: "5",
      minimumOrder: "25",
      deliveryFee: "5",
      freeDeliveryThreshold: "50",
      estimatedDeliveryTime: "30",
      deliveryHours: {
        start: "11:00",
        end: "22:00"
      }
    },
    
    // Customer Communication
    communication: {
      sendReceiptEmails: true,
      sendPromotionalEmails: false,
      sendLoyaltyUpdates: true,
      smsNotifications: false,
      orderStatusUpdates: true
    }
  })

  useEffect(() => {
    const loadCustomerSettings = async () => {
      try {
        setIsInitialLoading(true)
        
        const response = await fetch('/api/customer-settings')
        const data = await response.json()
        
        if (data.success && data.data) {
          setCustomerSettings(prev => ({
            ...prev,
            ...data.data
          }))
        }
        
      } catch (error) {
        console.error('Failed to load customer settings:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadCustomerSettings()
  }, [])

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setCustomerSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
    setIsSaved(false)
  }

  const handleNestedInputChange = (section: string, subSection: string, field: string, value: string | boolean) => {
    setCustomerSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subSection]: {
          ...(prev[section as keyof typeof prev] as any)[subSection],
          [field]: value
        }
      }
    }))
    setIsSaved(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/customer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerSettings)
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save customer settings')
      }
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error('Failed to save customer settings:', error)
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customer settings...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customers & Discounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage loyalty programs, discounts, gift cards, reservations, and delivery settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loyalty Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Loyalty Program</span>
              {customerSettings.loyaltyProgram.enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Reward your customers with points and bonuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="loyaltyProgramEnabled"
                checked={customerSettings.loyaltyProgram.enabled}
                onCheckedChange={(checked) => handleInputChange('loyaltyProgram', 'enabled', checked)}
              />
              <div>
                <Label htmlFor="loyaltyProgramEnabled" className="font-medium">
                  Enable Loyalty Program
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to earn and redeem points
                </p>
              </div>
            </div>

            {customerSettings.loyaltyProgram.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pointsPerDollar">Points Per Dollar</Label>
                  <Input
                    id="pointsPerDollar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={customerSettings.loyaltyProgram.pointsPerDollar}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'pointsPerDollar', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pointsValue">Point Value ($)</Label>
                  <Input
                    id="pointsValue"
                    type="number"
                    min="0"
                    step="0.001"
                    value={customerSettings.loyaltyProgram.pointsValue}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'pointsValue', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minimumPointsRedemption">Minimum Points for Redemption</Label>
                  <Input
                    id="minimumPointsRedemption"
                    type="number"
                    min="1"
                    value={customerSettings.loyaltyProgram.minimumPointsRedemption}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'minimumPointsRedemption', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="welcomeBonus">Welcome Bonus Points</Label>
                  <Input
                    id="welcomeBonus"
                    type="number"
                    min="0"
                    value={customerSettings.loyaltyProgram.welcomeBonus}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'welcomeBonus', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="referralBonus">Referral Bonus Points</Label>
                  <Input
                    id="referralBonus"
                    type="number"
                    min="0"
                    value={customerSettings.loyaltyProgram.referralBonus}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'referralBonus', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthdayBonus">Birthday Bonus Points</Label>
                  <Input
                    id="birthdayBonus"
                    type="number"
                    min="0"
                    value={customerSettings.loyaltyProgram.birthdayBonus}
                    onChange={(e) => handleInputChange('loyaltyProgram', 'birthdayBonus', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-green-600" />
              <span>Discount Management</span>
              {customerSettings.discounts.enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Configure various discount types and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="discountsEnabled"
                checked={customerSettings.discounts.enabled}
                onCheckedChange={(checked) => handleInputChange('discounts', 'enabled', checked)}
              />
              <div>
                <Label htmlFor="discountsEnabled" className="font-medium">
                  Enable Discounts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow staff to apply discounts to orders
                </p>
              </div>
            </div>

            {customerSettings.discounts.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDiscountPercent">Maximum Discount (%)</Label>
                    <Input
                      id="maxDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={customerSettings.discounts.maxDiscountPercent}
                      onChange={(e) => handleInputChange('discounts', 'maxDiscountPercent', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employeeDiscountPercent">Employee Discount (%)</Label>
                    <Input
                      id="employeeDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={customerSettings.discounts.employeeDiscountPercent}
                      onChange={(e) => handleInputChange('discounts', 'employeeDiscountPercent', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="seniorDiscountPercent">Senior Discount (%)</Label>
                    <Input
                      id="seniorDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={customerSettings.discounts.seniorDiscountPercent}
                      onChange={(e) => handleInputChange('discounts', 'seniorDiscountPercent', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="studentDiscountPercent">Student Discount (%)</Label>
                    <Input
                      id="studentDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={customerSettings.discounts.studentDiscountPercent}
                      onChange={(e) => handleInputChange('discounts', 'studentDiscountPercent', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                  <Checkbox
                    id="bulkDiscountEnabled"
                    checked={customerSettings.discounts.bulkDiscountEnabled}
                    onCheckedChange={(checked) => handleInputChange('discounts', 'bulkDiscountEnabled', checked)}
                  />
                  <div>
                    <Label htmlFor="bulkDiscountEnabled" className="font-medium">
                      Bulk Order Discounts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply discounts for large orders
                    </p>
                  </div>
                </div>

                {customerSettings.discounts.bulkDiscountEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bulkDiscountThreshold">Bulk Order Threshold ($)</Label>
                      <Input
                        id="bulkDiscountThreshold"
                        type="number"
                        min="0"
                        value={customerSettings.discounts.bulkDiscountThreshold}
                        onChange={(e) => handleInputChange('discounts', 'bulkDiscountThreshold', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bulkDiscountPercent">Bulk Discount (%)</Label>
                      <Input
                        id="bulkDiscountPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={customerSettings.discounts.bulkDiscountPercent}
                        onChange={(e) => handleInputChange('discounts', 'bulkDiscountPercent', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gift Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-red-600" />
              <span>Gift Cards</span>
              {customerSettings.giftCards.enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Manage gift card sales and redemption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="giftCardsEnabled"
                checked={customerSettings.giftCards.enabled}
                onCheckedChange={(checked) => handleInputChange('giftCards', 'enabled', checked)}
              />
              <div>
                <Label htmlFor="giftCardsEnabled" className="font-medium">
                  Enable Gift Cards
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to purchase and redeem gift cards
                </p>
              </div>
            </div>

            {customerSettings.giftCards.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="giftCardMinAmount">Minimum Amount ($)</Label>
                    <Input
                      id="giftCardMinAmount"
                      type="number"
                      min="1"
                      value={customerSettings.giftCards.minAmount}
                      onChange={(e) => handleInputChange('giftCards', 'minAmount', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="giftCardMaxAmount">Maximum Amount ($)</Label>
                    <Input
                      id="giftCardMaxAmount"
                      type="number"
                      min="1"
                      value={customerSettings.giftCards.maxAmount}
                      onChange={(e) => handleInputChange('giftCards', 'maxAmount', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="giftCardExpiryMonths">Expiry (months)</Label>
                    <Input
                      id="giftCardExpiryMonths"
                      type="number"
                      min="1"
                      value={customerSettings.giftCards.expiryMonths}
                      onChange={(e) => handleInputChange('giftCards', 'expiryMonths', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                    <Checkbox
                      id="giftCardsTransferable"
                      checked={customerSettings.giftCards.transferable}
                      onCheckedChange={(checked) => handleInputChange('giftCards', 'transferable', checked)}
                    />
                    <div>
                      <Label htmlFor="giftCardsTransferable" className="font-medium">
                        Transferable Gift Cards
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow gift cards to be transferred between customers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                    <Checkbox
                      id="giftCardsEmailDelivery"
                      checked={customerSettings.giftCards.emailDelivery}
                      onCheckedChange={(checked) => handleInputChange('giftCards', 'emailDelivery', checked)}
                    />
                    <div>
                      <Label htmlFor="giftCardsEmailDelivery" className="font-medium">
                        Email Delivery
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send gift cards via email to recipients
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Reservations</span>
              {customerSettings.reservations.enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Configure table reservations and booking system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="reservationsEnabled"
                checked={customerSettings.reservations.enabled}
                onCheckedChange={(checked) => handleInputChange('reservations', 'enabled', checked)}
              />
              <div>
                <Label htmlFor="reservationsEnabled" className="font-medium">
                  Enable Reservations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to make table reservations
                </p>
              </div>
            </div>

            {customerSettings.reservations.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxAdvanceDays">Max Advance Booking (days)</Label>
                    <Input
                      id="maxAdvanceDays"
                      type="number"
                      min="1"
                      value={customerSettings.reservations.maxAdvanceDays}
                      onChange={(e) => handleInputChange('reservations', 'maxAdvanceDays', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minAdvanceHours">Min Advance Booking (hours)</Label>
                    <Input
                      id="minAdvanceHours"
                      type="number"
                      min="0"
                      value={customerSettings.reservations.minAdvanceHours}
                      onChange={(e) => handleInputChange('reservations', 'minAdvanceHours', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxPartySize">Maximum Party Size</Label>
                    <Input
                      id="maxPartySize"
                      type="number"
                      min="1"
                      value={customerSettings.reservations.maxPartySize}
                      onChange={(e) => handleInputChange('reservations', 'maxPartySize', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cancellationHours">Cancellation Deadline (hours)</Label>
                    <Input
                      id="cancellationHours"
                      type="number"
                      min="0"
                      value={customerSettings.reservations.cancellationHours}
                      onChange={(e) => handleInputChange('reservations', 'cancellationHours', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                  <Checkbox
                    id="requireDeposit"
                    checked={customerSettings.reservations.requireDeposit}
                    onCheckedChange={(checked) => handleInputChange('reservations', 'requireDeposit', checked)}
                  />
                  <div>
                    <Label htmlFor="requireDeposit" className="font-medium">
                      Require Deposit
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require a deposit to confirm reservations
                    </p>
                  </div>
                </div>

                {customerSettings.reservations.requireDeposit && (
                  <div className="w-48">
                    <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      min="0"
                      value={customerSettings.reservations.depositAmount}
                      onChange={(e) => handleInputChange('reservations', 'depositAmount', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-purple-600" />
              <span>Delivery</span>
              {customerSettings.delivery.enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Configure delivery options and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="deliveryEnabled"
                checked={customerSettings.delivery.enabled}
                onCheckedChange={(checked) => handleInputChange('delivery', 'enabled', checked)}
              />
              <div>
                <Label htmlFor="deliveryEnabled" className="font-medium">
                  Enable Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  Offer delivery services to customers
                </p>
              </div>
            </div>

            {customerSettings.delivery.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customerSettings.delivery.deliveryRadius}
                      onChange={(e) => handleInputChange('delivery', 'deliveryRadius', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      min="0"
                      value={customerSettings.delivery.minimumOrder}
                      onChange={(e) => handleInputChange('delivery', 'minimumOrder', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      min="0"
                      value={customerSettings.delivery.deliveryFee}
                      onChange={(e) => handleInputChange('delivery', 'deliveryFee', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold ($)</Label>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      min="0"
                      value={customerSettings.delivery.freeDeliveryThreshold}
                      onChange={(e) => handleInputChange('delivery', 'freeDeliveryThreshold', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedDeliveryTime">Estimated Delivery Time (minutes)</Label>
                    <Input
                      id="estimatedDeliveryTime"
                      type="number"
                      min="1"
                      value={customerSettings.delivery.estimatedDeliveryTime}
                      onChange={(e) => handleInputChange('delivery', 'estimatedDeliveryTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryStartTime">Delivery Start Time</Label>
                    <Input
                      id="deliveryStartTime"
                      type="time"
                      value={customerSettings.delivery.deliveryHours.start}
                      onChange={(e) => handleNestedInputChange('delivery', 'deliveryHours', 'start', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryEndTime">Delivery End Time</Label>
                    <Input
                      id="deliveryEndTime"
                      type="time"
                      value={customerSettings.delivery.deliveryHours.end}
                      onChange={(e) => handleNestedInputChange('delivery', 'deliveryHours', 'end', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Notice */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Customer Experience</h3>
                <p className="text-sm text-green-800 mt-1">
                  These settings help you create a better experience for your customers. 
                  Enable features that make sense for your business type. You can always adjust 
                  these settings later based on customer feedback and business needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 