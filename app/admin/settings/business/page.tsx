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
  Building, 
  Clock, 
  Settings, 
  MapPin, 
  Save, 
  RefreshCw, 
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  CreditCard,
  Edit,
  Info
} from "lucide-react"

export default function BusinessProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  
  // Business Information (from onboarding)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessType: "",
    industry: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    timezone: "",
    businessDescription: "",
    taxRate: "",
    receiptEmail: ""
  })

  // Admin User Information (from onboarding)
  const [adminInfo, setAdminInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adminUsername: "",
    language: "",
    profilePhoto: "",
    notifications: {
      sales: true,
      inventory: true,
      employees: true,
      system: false
    }
  })

  // Business Settings (operational)
  const [businessSettings, setBusinessSettings] = useState({
    businessHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "12:00", close: "16:00", closed: true }
    },
    website: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: ""
    },
    receiptFooter: "",
    returnPolicy: "30",
    autoBackup: true
  })

  // Load all data from APIs
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load business stats and user data
        const [businessResponse, userResponse] = await Promise.all([
          fetch('/api/business-stats'),
          fetch('/api/users')
        ])
        
        const businessData = await businessResponse.json()
        const userData = await userResponse.json()
        
        // Map business information
        if (businessData.success && businessData.data) {
          const data = businessData.data
          
          setBusinessInfo({
            businessName: data.businessName || "",
            businessType: data.businessType || "",
            industry: data.industry || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            country: data.country || "",
            timezone: data.timezone || "",
            businessDescription: data.businessDescription || "",
            taxRate: data.taxRate || "",
            receiptEmail: data.receiptEmail || ""
          })
          
          // Map business settings with proper defaults
          if (data.businessSetup) {
            // Ensure businessHours is always properly initialized
            const businessSetup = {
              ...data.businessSetup,
              businessHours: data.businessSetup.businessHours || {
                monday: { open: "09:00", close: "17:00", closed: false },
                tuesday: { open: "09:00", close: "17:00", closed: false },
                wednesday: { open: "09:00", close: "17:00", closed: false },
                thursday: { open: "09:00", close: "17:00", closed: false },
                friday: { open: "09:00", close: "17:00", closed: false },
                saturday: { open: "10:00", close: "16:00", closed: false },
                sunday: { open: "12:00", close: "16:00", closed: true }
              },
              socialMedia: data.businessSetup.socialMedia || {
                instagram: "",
                facebook: "",
                twitter: ""
              },
              receiptFooter: `Thank you for choosing ${data.businessName || 'us'}!`
            }
            setBusinessSettings(businessSetup)
        } else {
            // Apply smart defaults
            const smartDefaults = getSmartDefaults(data.businessType || "retail")
            setBusinessSettings(prev => ({
              ...prev,
              businessHours: smartDefaults.businessHours,
              returnPolicy: smartDefaults.returnPolicy,
              receiptFooter: `Thank you for choosing ${data.businessName || 'us'}!`
            }))
          }
        }
        
        // Map admin user information
        if (userData.success && userData.data && userData.data.length > 0) {
          const admin = userData.data[0] // Assuming first user is admin
          setAdminInfo({
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            email: admin.email || "",
            phone: admin.phone || "",
            adminUsername: admin.adminUsername || "",
            language: admin.language || "",
            profilePhoto: admin.profilePhoto || "",
            notifications: admin.notifications || {
              sales: true,
              inventory: true,
              employees: true,
              system: false
            }
          })
        }
        
      } catch (error) {
        console.error('Failed to load profile data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadAllData()
  }, [])

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
        returnPolicy: "0"
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
        returnPolicy: "30"
      }
    }
            return defaults[businessType as keyof typeof defaults] || defaults["retail"]
          }
          
  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleAdminInfoChange = (field: string, value: string) => {
    setAdminInfo(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleNotificationChange = (field: string, checked: boolean) => {
    setAdminInfo(prev => ({
            ...prev,
      notifications: {
        ...prev.notifications,
        [field]: checked
      }
    }))
    setIsSaved(false)
      }

  const handleBusinessSettingsChange = (field: string, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: field === 'autoBackup' ? value === 'true' : value
    }))
    setIsSaved(false)
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
    setIsSaved(false)
  }

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setBusinessSettings(prev => ({
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
      // Save business information
      const businessResponse = await fetch('/api/business-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...businessInfo,
          businessSetup: businessSettings
        })
      })
      
      const businessData = await businessResponse.json()
      if (!businessData.success) {
        throw new Error(businessData.error || 'Failed to save business information')
      }
      
      // Save admin user information
      const userResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminInfo)
      })
      
      const userData = await userResponse.json()
      if (!userData.success) {
        throw new Error(userData.error || 'Failed to save admin information')
      }
      
      console.log("Profile saved successfully")
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

  const businessTypes = [
    { value: "retail", label: "Retail Store" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Cafe/Coffee Shop" },
    { value: "bar", label: "Bar/Pub" },
    { value: "food-truck", label: "Food Truck" },
    { value: "other", label: "Other" },
  ]

  const industries = [
    { value: "food-beverage", label: "Food & Beverage" },
    { value: "retail", label: "Retail" },
    { value: "services", label: "Services" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health-beauty", label: "Health & Beauty" },
    { value: "other", label: "Other" },
  ]

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
  ]

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading business profile...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Business Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile information, business details, and operational preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
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
                <span>Save Changes</span>
              </>
            )}
              </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Personal information and account settings for the primary admin user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={adminInfo.firstName}
                  onChange={(e) => handleAdminInfoChange('firstName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={adminInfo.lastName}
                  onChange={(e) => handleAdminInfoChange('lastName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={adminInfo.email}
                    onChange={(e) => handleAdminInfoChange('email', e.target.value)}
                    className="pl-10 mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={adminInfo.phone}
                    onChange={(e) => handleAdminInfoChange('phone', e.target.value)}
                    className="pl-10 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="adminUsername">Admin Username</Label>
                <Input
                  id="adminUsername"
                  value={adminInfo.adminUsername}
                  onChange={(e) => handleAdminInfoChange('adminUsername', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={adminInfo.language} onValueChange={(value) => handleAdminInfoChange('language', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
          </div>
        </div>

            {/* Notification Preferences */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Notification Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(adminInfo.notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                    <Checkbox
                      id={key}
                      checked={enabled}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked as boolean)}
                    />
                    <div>
                      <Label htmlFor={key} className="font-medium capitalize">
                        {key} Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {key === 'sales' && 'Get notified about new sales and transactions'}
                        {key === 'inventory' && 'Low stock alerts and inventory updates'}
                        {key === 'employees' && 'Employee schedule and activity updates'}
                        {key === 'system' && 'System maintenance and security alerts'}
          </p>
        </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Business Information</span>
            </CardTitle>
            <CardDescription>
              Core business details and registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessInfo.businessName}
                onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessInfo.businessType} onValueChange={(value) => handleBusinessInfoChange('businessType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={businessInfo.industry} onValueChange={(value) => handleBusinessInfoChange('industry', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <textarea
                id="businessDescription"
                value={businessInfo.businessDescription}
                onChange={(e) => handleBusinessInfoChange('businessDescription', e.target.value)}
                className="w-full mt-1 p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                rows={3}
                placeholder="Brief description of your business..."
              />
            </div>

            {/* Business Address */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Business Address</Label>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={businessInfo.address}
                  onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessInfo.city}
                    onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={businessInfo.state}
                    onChange={(e) => handleBusinessInfoChange('state', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={businessInfo.zipCode}
                    onChange={(e) => handleBusinessInfoChange('zipCode', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={businessInfo.country}
                  onChange={(e) => handleBusinessInfoChange('country', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={businessInfo.timezone}
                  onChange={(e) => handleBusinessInfoChange('timezone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={businessInfo.taxRate}
                  onChange={(e) => handleBusinessInfoChange('taxRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="receiptEmail">Receipt Email</Label>
                <Input
                  id="receiptEmail"
                  type="email"
                  value={businessInfo.receiptEmail}
                  onChange={(e) => handleBusinessInfoChange('receiptEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Business Hours</span>
              </CardTitle>
              <CardDescription>Set your operating hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {businessSettings.businessHours && days.map((day) => {
              const daySchedule = businessSettings.businessHours[day as keyof typeof businessSettings.businessHours]
              if (!daySchedule) return null
              
              return (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="w-full sm:w-24">
                    <Label className="capitalize font-medium">{day}</Label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id={`${day}-closed`}
                      checked={daySchedule.closed}
                      onCheckedChange={(checked) => handleBusinessHoursChange(day, 'closed', checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`}>Closed</Label>
                  </div>
                  
                  {!daySchedule.closed && (
                    <div className="flex items-center gap-3 flex-1">
                      <Input
                        type="time"
                        value={daySchedule.open}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={daySchedule.close}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              )
            })}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Contact Information</span>
              </CardTitle>
              <CardDescription>Update your business contact details and social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  value={businessSettings.website}
                  onChange={(e) => handleBusinessSettingsChange('website', e.target.value)}
                  className="pl-10 mt-1"
                />
              </div>
              </div>
              
              <div>
                <Label className="mb-3 block">Social Media</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-sm text-muted-foreground">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourbusiness"
                    value={businessSettings.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm text-muted-foreground">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="@yourbusiness"
                    value={businessSettings.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm text-muted-foreground">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="@yourbusiness"
                    value={businessSettings.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Operational Settings</span>
              </CardTitle>
            <CardDescription>Configure basic business operations and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                <textarea
                  id="receiptFooter"
                value={businessSettings.receiptFooter}
                onChange={(e) => handleBusinessSettingsChange('receiptFooter', e.target.value)}
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
                  value={businessSettings.returnPolicy}
                  onChange={(e) => handleBusinessSettingsChange('returnPolicy', e.target.value)}
                    className="mt-1"
                  />
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="autoBackup"
                  checked={businessSettings.autoBackup}
                  onCheckedChange={(checked) => handleBusinessSettingsChange('autoBackup', checked ? 'true' : 'false')}
                />
                <div>
                  <Label htmlFor="autoBackup" className="font-medium">Enable automatic daily backups</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your data every night at 2 AM</p>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Information Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                <h3 className="font-medium text-blue-900">Profile Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  This information was initially collected during your onboarding process and can be updated anytime. 
                  For security settings, subscription management, inventory settings, and customer features, 
                  please visit the respective sections in the admin settings.
                      </p>
                    </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
} 