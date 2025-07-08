"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, ArrowLeft, ArrowRight, User, Building, Phone, Mail, CheckCircle } from "lucide-react"

export default function AdminSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Personal details
    profilePhoto: "",
    phone: "",
    
    // Business details
    businessDescription: "",
    businessHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "12:00", close: "16:00", closed: true }
    },
    
    // Preferences
    currency: "ARS",
    taxRate: "",
    receiptEmail: "",
    notifications: {
      sales: true,
      inventory: true,
      employees: true,
      system: false
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: checked
      }
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call to save admin setup
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("Admin setup data:", formData)
      
      // In a real app, we'd save this to the user's profile
      const users = JSON.parse(localStorage.getItem('bitagora_users') || '[]')
      if (users.length > 0) {
        // Update the most recent user (admin) with the setup data
        users[users.length - 1].adminSetupComplete = true
        users[users.length - 1].adminSetupData = formData
        localStorage.setItem('bitagora_users', JSON.stringify(users))
      }
      
      // Redirect to business setup
      router.push('/onboarding/business-setup')
    } catch (error) {
      console.error("Setup failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
              <Link href="/onboarding/welcome">
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
            <span className="text-sm sm:text-base text-muted-foreground">Step 1 of 4</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 sm:h-3">
            <div className="bg-primary h-2 sm:h-3 rounded-full" style={{ width: '25%' }}></div>
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
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              Complete Your Profile
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Set up your admin profile and business preferences.
            </p>
          </div>

          {/* Account Status */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Account Created Successfully</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your language, timezone, and PIN have been configured during registration.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Personal Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Additional Information</h2>
              </div>
              
                <div>
                <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Additional Phone Number</Label>
                    <Input
                  id="phone"
                  type="tel"
                  placeholder="Optional - backup phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 sm:h-14 text-base sm:text-lg"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Optional backup phone number for account recovery
                </p>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Business Configuration</h2>
              </div>
              
              <div>
                <Label htmlFor="businessDescription" className="text-sm sm:text-base font-medium">Business Description</Label>
                <textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  className="w-full mt-2 p-3 sm:p-4 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-lg min-h-[120px] sm:min-h-[140px]"
                  rows={3}
                  placeholder="Describe your business and what you sell..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="currency" className="text-sm sm:text-base font-medium">Default Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full h-12 sm:h-14 px-3 sm:px-4 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-lg"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="ARS">ARS - Argentine Peso</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="CLP">CLP - Chilean Peso</option>
                    <option value="COP">COP - Colombian Peso</option>
                    <option value="PEN">PEN - Peruvian Sol</option>
                    <option value="UYU">UYU - Uruguayan Peso</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="BTC">BTC - Bitcoin</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="taxRate" className="text-sm sm:text-base font-medium">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                    placeholder="8.25"
                    className="h-12 sm:h-14 text-base sm:text-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receiptEmail" className="text-sm sm:text-base font-medium">Receipt Email (Optional)</Label>
                <Input
                  id="receiptEmail"
                  type="email"
                  placeholder="receipts@yourbusiness.com"
                  value={formData.receiptEmail}
                  onChange={(e) => handleInputChange('receiptEmail', e.target.value)}
                  className="h-12 sm:h-14 text-base sm:text-lg"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Optional email for sending receipt copies
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Notifications</h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="sales" 
                    checked={formData.notifications.sales}
                    onCheckedChange={(checked) => handleNotificationChange('sales', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <Label htmlFor="sales" className="text-sm sm:text-base font-medium">Sales notifications</Label>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="inventory" 
                    checked={formData.notifications.inventory}
                    onCheckedChange={(checked) => handleNotificationChange('inventory', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <Label htmlFor="inventory" className="text-sm sm:text-base font-medium">Inventory alerts</Label>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="employees" 
                    checked={formData.notifications.employees}
                    onCheckedChange={(checked) => handleNotificationChange('employees', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <Label htmlFor="employees" className="text-sm sm:text-base font-medium">Employee updates</Label>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-border touch-manipulation">
                  <Checkbox 
                    id="system" 
                    checked={formData.notifications.system}
                    onCheckedChange={(checked) => handleNotificationChange('system', checked as boolean)}
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <Label htmlFor="system" className="text-sm sm:text-base font-medium">System updates</Label>
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
              {isLoading ? "Setting up profile..." : "Continue to Business Setup"}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 