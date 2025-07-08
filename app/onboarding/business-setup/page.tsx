"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, ArrowLeft, ArrowRight, Building, Clock, Settings, MapPin } from "lucide-react"

export default function BusinessSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
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
        
        if (businessData.success && businessData.data) {
          const business = businessData.data
          
          // Apply smart defaults based on business type
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
          
          const smartDefaults = getSmartDefaults(business.businessType || "retail")
          
          // If business setup already exists, use it; otherwise use smart defaults
          if (business.businessSetup) {
            setFormData(business.businessSetup)
          } else {
            setFormData(prev => ({
              ...prev,
              businessHours: smartDefaults.businessHours,
              returnPolicy: smartDefaults.returnPolicy,
              lowStockAlert: smartDefaults.lowStockAlert,
              features: smartDefaults.features,
              receiptFooter: `Thank you for choosing ${business.businessName || 'us'}!`
            }))
          }
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
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked
      }
    }))
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
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Save business setup data to API
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
        throw new Error(data.error || 'Failed to save business setup')
      }
      
      console.log("Business setup data saved successfully:", formData)
      
      // Update onboarding progress
      const progressResponse = await fetch('/api/onboarding-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessSetupCompleted: true,
          currentStep: 'payment-setup'
        })
      })
      
      const progressData = await progressResponse.json()
      if (!progressData.success) {
        throw new Error(progressData.error || 'Failed to update progress')
      }
      
      // Redirect to payment setup
      router.push('/onboarding/payment-setup')
    } catch (error) {
      console.error("Setup failed:", error)
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <span className="text-xl sm:text-2xl font-light tracking-tight">
                <span className="text-foreground">Bit</span>
                <span className="font-semibold text-foreground">Agora</span>
              </span>
            </div>
            <Button variant="ghost" asChild className="h-10 sm:h-12 touch-manipulation">
              <Link href="/onboarding/admin-setup">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-medium text-foreground">Setup Progress</span>
            <span className="text-sm sm:text-base text-muted-foreground">Step 2 of 4</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 sm:h-3">
            <div className="bg-primary h-2 sm:h-3 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
            <span>Admin Setup</span>
            <span className="hidden sm:inline">Business Setup</span>
            <span className="hidden md:inline">Payment Setup</span>
            <span>QR Setup</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-primary/10 rounded-full">
                <Building className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              Configure Your Business
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Set up your business hours, contact information, and operational preferences.
            </p>
          </div>

          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading business setup...</p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Business Hours */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">Business Hours</h2>
                </div>
              
              <div className="space-y-3 sm:space-y-4">
                {days.map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="w-full sm:w-24">
                      <Label className="capitalize font-medium text-sm sm:text-base">{day}</Label>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Checkbox 
                        id={`${day}-closed`}
                        checked={formData.businessHours[day as keyof typeof formData.businessHours].closed}
                        onCheckedChange={(checked) => handleBusinessHoursChange(day, 'closed', checked as boolean)}
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      />
                      <Label htmlFor={`${day}-closed`} className="text-sm sm:text-base">Closed</Label>
                    </div>
                    
                    {!formData.businessHours[day as keyof typeof formData.businessHours].closed && (
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <Input
                          type="time"
                          value={formData.businessHours[day as keyof typeof formData.businessHours].open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        />
                        <span className="text-muted-foreground text-sm sm:text-base">to</span>
                        <Input
                          type="time"
                          value={formData.businessHours[day as keyof typeof formData.businessHours].close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Contact Information</h2>
              </div>
              
              <div>
                <Label htmlFor="website" className="text-sm sm:text-base font-medium">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="h-12 sm:h-14 text-base sm:text-lg"
                />
              </div>
              
              <div>
                <Label className="text-sm sm:text-base font-medium mb-3 sm:mb-4 block">Social Media</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-xs sm:text-sm text-muted-foreground">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-xs sm:text-sm text-muted-foreground">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="twitter" className="text-xs sm:text-sm text-muted-foreground">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="@yourbusiness"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Settings */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Operational Settings</h2>
              </div>
              
              <div>
                <Label htmlFor="receiptFooter" className="text-sm sm:text-base font-medium">Receipt Footer Message</Label>
                <textarea
                  id="receiptFooter"
                  value={formData.receiptFooter}
                  onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                  className="w-full mt-2 p-3 sm:p-4 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-lg min-h-[100px] sm:min-h-[120px]"
                  rows={3}
                  placeholder="Thank you for your business! Follow us @yourbusiness"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="returnPolicy" className="text-sm sm:text-base font-medium">Return Policy (days)</Label>
                  <Input
                    id="returnPolicy"
                    type="number"
                    min="0"
                    max="365"
                    value={formData.returnPolicy}
                    onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
                    className="h-12 sm:h-14 text-base sm:text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lowStockAlert" className="text-sm sm:text-base font-medium">Low Stock Alert (quantity)</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="1"
                    value={formData.lowStockAlert}
                    onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                    className="h-12 sm:h-14 text-base sm:text-lg"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                <Checkbox 
                  id="autoBackup"
                  checked={formData.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked ? 'true' : 'false')}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <div>
                  <Label htmlFor="autoBackup" className="text-sm sm:text-base font-medium">Enable automatic daily backups</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Automatically backup your data every night at 2 AM</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Business Features</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="loyaltyProgram"
                    checked={formData.features.loyaltyProgram}
                    onCheckedChange={(checked) => handleFeatureChange('loyaltyProgram', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div>
                    <Label htmlFor="loyaltyProgram" className="text-sm sm:text-base font-medium">Loyalty Program</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Customer rewards and points</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="discounts"
                    checked={formData.features.discounts}
                    onCheckedChange={(checked) => handleFeatureChange('discounts', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div>
                    <Label htmlFor="discounts" className="text-sm sm:text-base font-medium">Discounts & Coupons</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Promotional pricing</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="giftCards"
                    checked={formData.features.giftCards}
                    onCheckedChange={(checked) => handleFeatureChange('giftCards', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div>
                    <Label htmlFor="giftCards" className="text-sm sm:text-base font-medium">Gift Cards</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Digital gift card sales</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="reservations"
                    checked={formData.features.reservations}
                    onCheckedChange={(checked) => handleFeatureChange('reservations', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div>
                    <Label htmlFor="reservations" className="text-sm sm:text-base font-medium">Reservations</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Table/appointment booking</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation sm:col-span-2">
                  <Checkbox 
                    id="delivery"
                    checked={formData.features.delivery}
                    onCheckedChange={(checked) => handleFeatureChange('delivery', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div>
                    <Label htmlFor="delivery" className="text-sm sm:text-base font-medium">Delivery & Pickup</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Order fulfillment options</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Action Button */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full h-12 sm:h-14 lg:h-16 text-base sm:text-lg font-medium touch-manipulation active:scale-95 transition-transform"
            >
              {isLoading ? "Saving settings..." : "Continue to Payment Setup"}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Button>
              </div>
          </div>
          )}
        </div>
      </main>
    </div>
  )
} 