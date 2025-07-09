"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Lock, 
  Key, 
  Mail, 
  Phone, 
  Settings, 
  RefreshCw, 
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    // Password Management
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    lastPasswordChange: "",
    
    // PIN Management
    currentPin: "",
    newPin: "",
    confirmPin: "",
    lastPinChange: "",
    
    // Two-Factor Authentication
    twoFactorEnabled: false,
    backupEmail: "",
    backupPhone: "",
    backupCodes: [] as string[],
    
    // Security Policies
    requireTwoFactorForWallets: true,
    requireTwoFactorForPayments: true,
    requireTwoFactorForAdminChanges: true,
    sessionTimeout: "30",
    
    // Audit Log
    recentActivity: [] as any[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load current security settings
        const response = await fetch('/api/security-settings')
        const data = await response.json()
        
        if (data.success && data.data) {
          setSecuritySettings(prev => ({
            ...prev,
            ...data.data,
            currentPassword: "", // Never pre-populate passwords
            newPassword: "",
            confirmPassword: "",
            currentPin: "",
            newPin: "",
            confirmPin: ""
          }))
        }
        
      } catch (error) {
        console.error('Failed to load security settings:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadSecuritySettings()
  }, [])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character"
    return null
  }

  const validatePin = (pin: string): string | null => {
    if (pin.length !== 4) return "PIN must be exactly 4 digits"
    if (!/^\d{4}$/.test(pin)) return "PIN must contain only numbers"
    if (/^(\d)\1{3}$/.test(pin)) return "PIN cannot be all the same digit"
    if (pin === "1234" || pin === "0000" || pin === "9999") return "PIN cannot be a common sequence"
    return null
  }

  const handlePasswordChange = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!securitySettings.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    
    const passwordError = validatePassword(securitySettings.newPassword)
    if (passwordError) {
      newErrors.newPassword = passwordError
    }
    
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPassword,
          newPassword: securitySettings.newPassword
        })
      })
      
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        lastPasswordChange: new Date().toISOString()
      }))
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error('Password change failed:', error)
      setErrors({ general: 'Failed to change password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!securitySettings.currentPin) {
      newErrors.currentPin = "Current PIN is required"
    }
    
    const pinError = validatePin(securitySettings.newPin)
    if (pinError) {
      newErrors.newPin = pinError
    }
    
    if (securitySettings.newPin !== securitySettings.confirmPin) {
      newErrors.confirmPin = "PINs do not match"
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/security/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: securitySettings.currentPin,
          newPin: securitySettings.newPin
        })
      })
      
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setSecuritySettings(prev => ({
        ...prev,
        currentPin: "",
        newPin: "",
        confirmPin: "",
        lastPinChange: new Date().toISOString()
      }))
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error('PIN change failed:', error)
      setErrors({ general: 'Failed to change PIN. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (enabled && (!securitySettings.backupEmail || !securitySettings.backupPhone)) {
      setErrors({ twoFactor: 'Backup email and phone are required for two-factor authentication' })
      return
    }
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/security/two-factor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          backupEmail: securitySettings.backupEmail,
          backupPhone: securitySettings.backupPhone
        })
      })
      
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: enabled,
        backupCodes: enabled ? data.backupCodes || [] : []
      }))
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error('Two-factor toggle failed:', error)
      setErrors({ twoFactor: 'Failed to update two-factor authentication. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handlePolicyChange = (field: string, checked: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: checked }))
  }

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading security settings...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your password, PIN, two-factor authentication, and security policies
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Password Management</span>
            </CardTitle>
            <CardDescription>
              Change your admin login password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={securitySettings.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`mt-1 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={securitySettings.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`mt-1 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={securitySettings.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`mt-1 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button 
              onClick={handlePasswordChange} 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Change Password</span>
            </Button>

            {securitySettings.lastPasswordChange && (
              <p className="text-sm text-muted-foreground">
                Last changed: {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* PIN Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-600" />
              <span>PIN Management</span>
            </CardTitle>
            <CardDescription>
              Change your 4-digit POS login PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                maxLength={4}
                value={securitySettings.currentPin}
                onChange={(e) => handleInputChange('currentPin', e.target.value.replace(/\D/g, ''))}
                className={`mt-1 ${errors.currentPin ? 'border-red-500' : ''}`}
                placeholder="Enter your current PIN"
              />
              {errors.currentPin && <p className="text-sm text-red-600 mt-1">{errors.currentPin}</p>}
            </div>

            <div>
              <Label htmlFor="newPin">New PIN</Label>
              <Input
                id="newPin"
                type="password"
                maxLength={4}
                value={securitySettings.newPin}
                onChange={(e) => handleInputChange('newPin', e.target.value.replace(/\D/g, ''))}
                className={`mt-1 ${errors.newPin ? 'border-red-500' : ''}`}
                placeholder="Enter your new PIN"
              />
              {errors.newPin && <p className="text-sm text-red-600 mt-1">{errors.newPin}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                PIN must be 4 digits and cannot be 0000, 1234, or all the same digit
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                maxLength={4}
                value={securitySettings.confirmPin}
                onChange={(e) => handleInputChange('confirmPin', e.target.value.replace(/\D/g, ''))}
                className={`mt-1 ${errors.confirmPin ? 'border-red-500' : ''}`}
                placeholder="Confirm your new PIN"
              />
              {errors.confirmPin && <p className="text-sm text-red-600 mt-1">{errors.confirmPin}</p>}
            </div>

            <Button 
              onClick={handlePinChange} 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Change PIN</span>
            </Button>

            {securitySettings.lastPinChange && (
              <p className="text-sm text-muted-foreground">
                Last changed: {new Date(securitySettings.lastPinChange).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Two-Factor Authentication</span>
              {securitySettings.twoFactorEnabled && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Enabled
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backupEmail">Backup Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="backupEmail"
                  type="email"
                  value={securitySettings.backupEmail}
                  onChange={(e) => handleInputChange('backupEmail', e.target.value)}
                  className="pl-10 mt-1"
                  placeholder="backup@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="backupPhone">Backup Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="backupPhone"
                  type="tel"
                  value={securitySettings.backupPhone}
                  onChange={(e) => handleInputChange('backupPhone', e.target.value)}
                  className="pl-10 mt-1"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
              <Checkbox
                id="twoFactorEnabled"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => handleTwoFactorToggle(checked as boolean)}
              />
              <div>
                <Label htmlFor="twoFactorEnabled" className="font-medium">
                  Enable Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require email or SMS verification for sensitive operations
                </p>
              </div>
            </div>

            {errors.twoFactor && <p className="text-sm text-red-600">{errors.twoFactor}</p>}
          </CardContent>
        </Card>

        {/* Security Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Security Policies</span>
            </CardTitle>
            <CardDescription>
              Configure when two-factor authentication is required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="requireTwoFactorForWallets"
                  checked={securitySettings.requireTwoFactorForWallets}
                  onCheckedChange={(checked) => handlePolicyChange('requireTwoFactorForWallets', checked as boolean)}
                />
                <div>
                  <Label htmlFor="requireTwoFactorForWallets" className="font-medium">
                    Wallet Address Changes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA when changing crypto wallet addresses
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="requireTwoFactorForPayments"
                  checked={securitySettings.requireTwoFactorForPayments}
                  onCheckedChange={(checked) => handlePolicyChange('requireTwoFactorForPayments', checked as boolean)}
                />
                <div>
                  <Label htmlFor="requireTwoFactorForPayments" className="font-medium">
                    Payment Settings Changes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA when modifying payment method settings
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="requireTwoFactorForAdminChanges"
                  checked={securitySettings.requireTwoFactorForAdminChanges}
                  onCheckedChange={(checked) => handlePolicyChange('requireTwoFactorForAdminChanges', checked as boolean)}
                />
                <div>
                  <Label htmlFor="requireTwoFactorForAdminChanges" className="font-medium">
                    Admin Changes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin user management and critical settings
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="120"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                className="mt-1 w-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Automatically log out after this period of inactivity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Security Best Practices</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Use a strong, unique password and enable two-factor authentication. 
                  Your PIN is used for quick POS access, while your password secures admin functions. 
                  Two-factor authentication is highly recommended for wallet and payment changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 