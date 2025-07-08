"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Check } from "lucide-react"

interface FormData {
  // Personal Information (Business Owner)
  firstName: string
  lastName: string
  email: string
  phone: string
  adminUsername: string
  language: string
  
  // Business Information
  businessName: string
  businessType: string
  industry: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  timezone: string
  
  // Admin Account
  password: string
  confirmPassword: string
  
  // PIN
  pin: string
  
  // Subscription
  subscriptionTier: string
  
  // Terms
  acceptTerms: boolean
  acceptPrivacy: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  adminUsername?: string
  language?: string
  businessName?: string
  businessType?: string
  industry?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  timezone?: string
  password?: string
  confirmPassword?: string
  pin?: string
  subscriptionTier?: string
  acceptTerms?: string
  acceptPrivacy?: string
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "",
  industry: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  password: "",
  confirmPassword: "",
  pin: "",
  subscriptionTier: "basic",
  acceptTerms: false,
  acceptPrivacy: false,
  adminUsername: "",
  language: "en",
  country: "AR",
  timezone: "ART",
}

const steps = [
  { id: 1, name: "Personal", description: "Your information" },
  { id: 2, name: "Business", description: "Business details" },
  { id: 3, name: "Account", description: "Admin account" },
  { id: 4, name: "PIN", description: "4-digit PIN" },
  { id: 5, name: "Plan", description: "Subscription plan" },
]

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
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
]

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "AR", label: "Argentina" },
  { value: "BR", label: "Brazil" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Peru" },
  { value: "UY", label: "Uruguay" },
  { value: "MX", label: "Mexico" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
]

const timezones = [
  { value: "EST", label: "Eastern Time (EST)" },
  { value: "CST", label: "Central Time (CST)" },
  { value: "MST", label: "Mountain Time (MST)" },
  { value: "PST", label: "Pacific Time (PST)" },
  { value: "ART", label: "Argentina Time (ART)" },
  { value: "BRT", label: "Brazil Time (BRT)" },
  { value: "CLT", label: "Chile Time (CLT)" },
  { value: "COT", label: "Colombia Time (COT)" },
  { value: "PET", label: "Peru Time (PET)" },
  { value: "UYT", label: "Uruguay Time (UYT)" },
  { value: "GMT", label: "Greenwich Mean Time (GMT)" },
  { value: "CET", label: "Central European Time (CET)" },
  { value: "JST", label: "Japan Standard Time (JST)" },
  { value: "AEST", label: "Australian Eastern Time (AEST)" },
  { value: "CST_CN", label: "China Standard Time (CST)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
]

const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for testing",
    features: ["Up to 100 transactions/month", "1 User account", "Basic reporting", "Email support"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "$29",
    description: "Most popular choice",
    features: ["Unlimited transactions", "Up to 5 users", "Advanced analytics", "Inventory management", "Priority support"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    description: "For growing businesses",
    features: ["Everything in Basic", "Unlimited users", "Multi-location support", "API access", "24/7 phone support"],
  },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
        if (!formData.adminUsername.trim()) newErrors.adminUsername = "Admin username is required"
        if (formData.adminUsername && formData.adminUsername.length < 3) newErrors.adminUsername = "Username must be at least 3 characters"
        if (!formData.language) newErrors.language = "Language is required"
        break
      case 2:
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required"
        if (!formData.businessType) newErrors.businessType = "Business type is required"
        if (!formData.industry) newErrors.industry = "Industry is required"
        if (!formData.address.trim()) newErrors.address = "Address is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.state.trim()) newErrors.state = "State is required"
        if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required"
        if (!formData.country) newErrors.country = "Country is required"
        if (!formData.timezone) newErrors.timezone = "Timezone is required"
        break
      case 3:
        if (!formData.password.trim()) newErrors.password = "Password is required"
        if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
        if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password"
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
        break
      case 4:
        if (!formData.pin.trim()) newErrors.pin = "PIN is required"
        if (formData.pin.length !== 4) newErrors.pin = "PIN must be exactly 4 digits"
        if (!/^\d{4}$/.test(formData.pin)) newErrors.pin = "PIN must contain only numbers"
        break
      case 5:
        if (!formData.subscriptionTier) newErrors.subscriptionTier = "Please select a subscription plan"
        if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms of service"
        if (!formData.acceptPrivacy) newErrors.acceptPrivacy = "You must accept the privacy policy"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    
    try {
      // Use real API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          adminUsername: formData.adminUsername,
          language: formData.language,
          businessName: formData.businessName,
          businessType: formData.businessType,
          industry: formData.industry,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          timezone: formData.timezone,
          pin: formData.pin,
          subscriptionTier: formData.subscriptionTier,
          password: formData.password
        })
      })
      
      const result = await response.json()

      if (result.success) {
        console.log("✅ User created successfully:", result.data)
        
        // Store user session
        if (result.data) {
          localStorage.setItem('bitagora_current_user', JSON.stringify(result.data))
        }
        
        // Redirect to onboarding welcome page
        router.push('/onboarding/welcome')
      } else {
        console.error("❌ Registration failed:", result.error)
        alert(`Registration failed: ${result.error || 'An error occurred during registration'}`)
      }
    } catch (error) {
      console.error("Registration failed:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Personal Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm sm:text-base font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={`h-12 sm:h-14 text-base sm:text-lg ${errors.firstName ? "border-destructive" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm sm:text-base font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={`h-12 sm:h-14 text-base sm:text-lg ${errors.lastName ? "border-destructive" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={`h-12 sm:h-14 text-base sm:text-lg ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className={`h-12 sm:h-14 text-base sm:text-lg ${errors.phone ? "border-destructive" : ""}`}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="adminUsername" className="text-sm sm:text-base font-medium">Admin Username</Label>
                <Input
                  id="adminUsername"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.adminUsername}
                  onChange={(e) => updateFormData("adminUsername", e.target.value)}
                  className={`h-12 sm:h-14 text-base sm:text-lg ${errors.adminUsername ? "border-destructive" : ""}`}
                />
                {errors.adminUsername && (
                  <p className="text-sm text-destructive mt-1">{errors.adminUsername}</p>
                )}
              </div>
              <div>
                <Label htmlFor="language" className="text-sm sm:text-base font-medium">Language</Label>
                <Select value={formData.language} onValueChange={(value) => updateFormData("language", value)}>
                  <SelectTrigger className={`h-12 sm:h-14 text-base sm:text-lg ${errors.language ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-sm text-destructive mt-1">{errors.language}</p>
                )}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => updateFormData("businessName", e.target.value)}
                className={errors.businessName ? "border-destructive" : ""}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => updateFormData("businessType", value)}>
                <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
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
              {errors.businessType && (
                <p className="text-sm text-destructive mt-1">{errors.businessType}</p>
              )}
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
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
              {errors.industry && (
                <p className="text-sm text-destructive mt-1">{errors.industry}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter street address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                  className={errors.state ? "border-destructive" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-destructive mt-1">{errors.state}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Enter ZIP code"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                className={errors.zipCode ? "border-destructive" : ""}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                  <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive mt-1">{errors.country}</p>
                )}
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => updateFormData("timezone", value)}
                >
                  <SelectTrigger className={errors.timezone ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-sm text-destructive mt-1">{errors.timezone}</p>
                )}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
              </ul>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Create Your 4-Digit PIN</h3>
              <p className="text-sm text-muted-foreground">You'll use this PIN to log in to the POS system</p>
            </div>
            
            {/* PIN Display */}
            <div className="bg-card/50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Enter PIN</div>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-background border border-border flex items-center justify-center text-lg sm:text-xl font-medium"
                    >
                      {formData.pin[index] ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsive PIN Pad */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-16 sm:h-20 md:h-24 text-lg sm:text-xl md:text-2xl font-medium touch-manipulation active:scale-95 transition-transform"
                  onClick={() => {
                    if (formData.pin.length < 4) {
                      updateFormData("pin", formData.pin + num.toString())
                    }
                  }}
                >
                  {num}
                </Button>
              ))}
              
              {/* Back Button */}
              <Button
                variant="outline"
                className="h-16 sm:h-20 md:h-24 text-lg sm:text-xl md:text-2xl font-medium touch-manipulation active:scale-95 transition-transform"
                onClick={() => {
                  if (formData.pin.length > 0) {
                    updateFormData("pin", formData.pin.slice(0, -1))
                  }
                }}
              >
                ←
              </Button>
              
              {/* 0 Button */}
              <Button
                variant="outline"
                className="h-16 sm:h-20 md:h-24 text-lg sm:text-xl md:text-2xl font-medium touch-manipulation active:scale-95 transition-transform"
                onClick={() => {
                  if (formData.pin.length < 4) {
                    updateFormData("pin", formData.pin + "0")
                  }
                }}
              >
                0
              </Button>
              
              {/* Clear Button */}
              <Button
                variant="outline"
                className="h-16 sm:h-20 md:h-24 text-lg sm:text-xl md:text-2xl font-medium text-destructive hover:text-destructive touch-manipulation active:scale-95 transition-transform"
                onClick={() => updateFormData("pin", "")}
              >
                C
              </Button>
            </div>

            {errors.pin && (
              <p className="text-sm text-destructive text-center mt-4">{errors.pin}</p>
            )}
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
              <div className="grid grid-cols-1 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                      formData.subscriptionTier === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/70"
                    }`}
                    onClick={() => updateFormData("subscriptionTier", plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{plan.price}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData("acceptTerms", checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms}</p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => updateFormData("acceptPrivacy", checked as boolean)}
                />
                <Label htmlFor="acceptPrivacy" className="text-sm">
                  I agree to the{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-sm text-destructive">{errors.acceptPrivacy}</p>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-card rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="space-y-2 sm:space-y-3 pb-6 sm:pb-8 text-center">
          <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight">
            <span className="text-foreground">Bit</span>
            <span className="font-semibold text-foreground">Agora</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create your admin account to get started
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {steps[currentStep - 1].name}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <span 
                key={step.id} 
                className={`${index < currentStep ? 'text-primary' : ''} hidden sm:inline`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-4 sm:space-y-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
          >
            Previous
          </Button>
          
          {currentStep === steps.length ? (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
            >
              Next
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 