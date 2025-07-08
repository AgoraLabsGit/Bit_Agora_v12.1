"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Clock, Settings, MapPin, Save, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BusinessSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState({
    // Business Hours - Dynamic defaults based on business type
    businessHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "12:00", close: "16:00", closed: true }
    },
    
    // Location & Contact
    website: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: ""
    },
    
    // Operational Settings
    receiptFooter: "",
    returnPolicy: "30",
    lowStockAlert: "5",
    autoBackup: true,
    
    // Features
    features: {
      loyaltyProgram: false,
      discounts: true,
      giftCards: false,
      reservations: false,
      delivery: false
    }
  })

  // Load existing business setup data from API on component mount
  useEffect(() => {
    const loadBusinessSetup = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load business stats to get existing setup
        const businessResponse = await fetch('/api/business-stats')
        const businessData = await businessResponse.json()
        
        if (businessData.success && businessData.data && businessData.data.businessSetup) {
          setFormData(businessData.data.businessSetup)
        } else {
          // Apply smart defaults based on business type if no setup exists
          const business = businessData.data
          const getSmartDefaults = (businessType: string) => {
            const defaults = {
              "restaurant": {
                businessHours: {
                  monday: { open: "11:00", close: "22:00", closed: false },
                  tuesday: { open: "11:00", close: "22:00", closed: false },
                  wednesday: { open: "11:00", close: "22:00", closed: false },
                  thursday: { open: "11:00", close: "22:00", closed: false },
                  friday: { open: "11:00", close: "23:00", closed: false },
                  saturday: { open: "11:00", close: "23:00", closed: false },
                  sunday: { open: "12:00", close: "21:00", closed: false }
                },
                returnPolicy: "0",
                lowStockAlert: "10",
                features: {
                  loyaltyProgram: true,
                  discounts: true,
                  giftCards: true,
                  reservations: true,
                  delivery: true
                }
              },
              "retail": {
                businessHours: {
                  monday: { open: "09:00", close: "18:00", closed: false },
                  tuesday: { open: "09:00", close: "18:00", closed: false },
                  wednesday: { open: "09:00", close: "18:00", closed: false },
                  thursday: { open: "09:00", close: "18:00", closed: false },
                  friday: { open: "09:00", close: "19:00", closed: false },
                  saturday: { open: "10:00", close: "19:00", closed: false },
                  sunday: { open: "12:00", close: "17:00", closed: false }
                },
                returnPolicy: "30",
                lowStockAlert: "5",
                features: {
                  loyaltyProgram: true,
                  discounts: true,
                  giftCards: true,
                  reservations: false,
                  delivery: false
                }
              },
              "service": {
                businessHours: {
                  monday: { open: "08:00", close: "17:00", closed: false },
                  tuesday: { open: "08:00", close: "17:00", closed: false },
                  wednesday: { open: "08:00", close: "17:00", closed: false },
                  thursday: { open: "08:00", close: "17:00", closed: false },
                  friday: { open: "08:00", close: "17:00", closed: false },
                  saturday: { open: "09:00", close: "15:00", closed: false },
                  sunday: { open: "12:00", close: "16:00", closed: true }
                },
                returnPolicy: "7",
                lowStockAlert: "3",
                features: {
                  loyaltyProgram: false,
                  discounts: true,
                  giftCards: false,
                  reservations: true,
                  delivery: false
                }
              }
            }
            
            return defaults[businessType as keyof typeof defaults] || defaults["retail"]
          }
          
          const smartDefaults = getSmartDefaults(business?.businessType || "retail")
          
          setFormData(prev => ({
            ...prev,
            businessHours: smartDefaults.businessHours,
            returnPolicy: smartDefaults.returnPolicy,
            lowStockAlert: smartDefaults.lowStockAlert,
            features: smartDefaults.features,
            receiptFooter: `Thank you for choosing ${business?.businessName || 'us'}!`
          }))
        }
      } catch (error) {
        console.error('Failed to load business setup:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadBusinessSetup()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'autoBackup' ? value === 'true' : value
    }))
    setIsSaved(false)
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
    setIsSaved(false)
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked
      }
    }))
    setIsSaved(false)
  }

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }))
    setIsSaved(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Save business setup data to API (same API as onboarding)
      const response = await fetch('/api/business-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessSetup: formData
        })
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save business settings')
      }
      
      console.log("Business settings saved successfully:", formData)
      setIsSaved(true)
      
      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error("Save failed:", error)
      alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold text-foreground">Business Settings</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading business settings...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Business Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Configure your business hours, contact information, and operational preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Business Hours
              </CardTitle>
              <CardDescription>Set your operating hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="w-full sm:w-24">
                    <Label className="capitalize font-medium">{day}</Label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id={`${day}-closed`}
                      checked={formData.businessHours[day as keyof typeof formData.businessHours].closed}
                      onCheckedChange={(checked) => handleBusinessHoursChange(day, 'closed', checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`}>Closed</Label>
                  </div>
                  
                  {!formData.businessHours[day as keyof typeof formData.businessHours].closed && (
                    <div className="flex items-center gap-3 flex-1">
                      <Input
                        type="time"
                        value={formData.businessHours[day as keyof typeof formData.businessHours].open}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={formData.businessHours[day as keyof typeof formData.businessHours].close}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Update your business contact details and social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="mb-3 block">Social Media</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-sm text-muted-foreground">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm text-muted-foreground">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm text-muted-foreground">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Operational Settings
              </CardTitle>
              <CardDescription>Configure business operations and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                <textarea
                  id="receiptFooter"
                  value={formData.receiptFooter}
                  onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                  className="w-full mt-1 p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                  rows={3}
                  placeholder="Thank you for your business! Follow us @yourbusiness"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="returnPolicy">Return Policy (days)</Label>
                  <Input
                    id="returnPolicy"
                    type="number"
                    min="0"
                    max="365"
                    value={formData.returnPolicy}
                    onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lowStockAlert">Low Stock Alert (quantity)</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="1"
                    value={formData.lowStockAlert}
                    onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="autoBackup"
                  checked={formData.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked ? 'true' : 'false')}
                />
                <div>
                  <Label htmlFor="autoBackup" className="font-medium">Enable automatic daily backups</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your data every night at 2 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Business Features
              </CardTitle>
              <CardDescription>Enable or disable business features and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(formData.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                    <Checkbox 
                      id={feature}
                      checked={enabled}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <div>
                      <Label htmlFor={feature} className="font-medium capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {feature === 'loyaltyProgram' && 'Customer rewards and points system'}
                        {feature === 'discounts' && 'Percentage and fixed amount discounts'}
                        {feature === 'giftCards' && 'Digital gift card sales and redemption'}
                        {feature === 'reservations' && 'Table and appointment booking'}
                        {feature === 'delivery' && 'Delivery and pickup options'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 