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
  User,
  Users,
  UserCheck,
  Mail,
  Phone,
  Shield,
  Settings,
  Bell,
  Crown,
  Key,
  RefreshCw,
  Save,
  Plus,
  Edit,
  Trash2,
  Info,
  AlertTriangle
} from "lucide-react"

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  adminUsername: string
  language: string
  subscriptionTier: string
  role: 'owner' | 'admin' | 'manager'
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  createdAt: string
  profilePhoto?: string
  permissions: {
    sales: boolean
    inventory: boolean
    employees: boolean
    payments: boolean
    settings: boolean
    reports: boolean
  }
  notifications: {
    sales: boolean
    inventory: boolean
    employees: boolean
    system: boolean
  }
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Load admin users from API
  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        setIsInitialLoading(true)
        
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.success && data.data) {
          // Map API data to AdminUser format
          const mappedUsers: AdminUser[] = data.data.map((user: any, index: number) => ({
            id: user.id || `user-${index}`,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            adminUsername: user.adminUsername || "",
            language: user.language || "en",
            subscriptionTier: user.subscriptionTier || "basic",
            role: index === 0 ? 'owner' : 'admin', // First user is owner
            status: 'active',
            lastLogin: user.lastLogin || new Date().toISOString(),
            createdAt: user.createdAt || new Date().toISOString(),
            profilePhoto: user.profilePhoto || "",
            permissions: {
              sales: true,
              inventory: true,
              employees: true,
              payments: index === 0, // Only owner has payment permissions by default
              settings: index === 0, // Only owner has settings permissions by default
              reports: true
            },
            notifications: user.notifications || {
              sales: true,
              inventory: true,
              employees: true,
              system: false
            }
          }))
          
          setAdminUsers(mappedUsers)
          if (mappedUsers.length > 0) {
            setSelectedUser(mappedUsers[0])
          }
        }
        
      } catch (error) {
        console.error('Failed to load admin users:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadAdminUsers()
  }, [])

  const handleUserInfoChange = (field: string, value: string) => {
    if (!selectedUser) return
    
    setSelectedUser(prev => ({
      ...prev!,
      [field]: value
    }))
    setIsSaved(false)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!selectedUser) return
    
    setSelectedUser(prev => ({
      ...prev!,
      permissions: {
        ...prev!.permissions,
        [permission]: checked
      }
    }))
    setIsSaved(false)
  }

  const handleNotificationChange = (notification: string, checked: boolean) => {
    if (!selectedUser) return
    
    setSelectedUser(prev => ({
      ...prev!,
      notifications: {
        ...prev!.notifications,
        [notification]: checked
      }
    }))
    setIsSaved(false)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUser)
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save user')
      }
      
      // Update local state
      setAdminUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id ? selectedUser : user
        )
      )
      
      setIsSaved(true)
      setIsEditMode(false)
      
      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error("Save failed:", error)
      alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'manager': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
  ]

  const subscriptionTiers = [
    { value: "free", label: "Free Plan" },
    { value: "basic", label: "Basic Plan" },
    { value: "pro", label: "Pro Plan" },
  ]

  const roles = [
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
  ]

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin users...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin users, permissions, and access levels for your business
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
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>{isEditMode ? 'Cancel Edit' : 'Edit User'}</span>
          </Button>
          <Button
            onClick={handleSaveUser}
            disabled={!selectedUser || isLoading}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Admin Users</span>
              </CardTitle>
              <CardDescription>
                {adminUsers.length} admin user{adminUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {adminUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUser?.id === user.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">@{user.adminUsername}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>User Information</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Personal information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={selectedUser.firstName}
                        onChange={(e) => handleUserInfoChange('firstName', e.target.value)}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={selectedUser.lastName}
                        onChange={(e) => handleUserInfoChange('lastName', e.target.value)}
                        disabled={!isEditMode}
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
                          value={selectedUser.email}
                          onChange={(e) => handleUserInfoChange('email', e.target.value)}
                          disabled={!isEditMode}
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
                          value={selectedUser.phone}
                          onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                          disabled={!isEditMode}
                          className="pl-10 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="adminUsername">Username</Label>
                      <Input
                        id="adminUsername"
                        value={selectedUser.adminUsername}
                        onChange={(e) => handleUserInfoChange('adminUsername', e.target.value)}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={selectedUser.language} 
                        onValueChange={(value) => handleUserInfoChange('language', value)}
                        disabled={!isEditMode}
                      >
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
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={selectedUser.role} 
                        onValueChange={(value) => handleUserInfoChange('role', value)}
                        disabled={!isEditMode || selectedUser.role === 'owner'} // Can't change owner role
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                      <p className="text-sm font-medium">{formatDate(selectedUser.lastLogin)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                      <p className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Permissions</span>
                  </CardTitle>
                  <CardDescription>
                    Control what areas of the system this user can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedUser.permissions).map(([permission, enabled]) => (
                      <div key={permission} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id={permission}
                          checked={enabled}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                          disabled={!isEditMode || (selectedUser.role === 'owner' && ['payments', 'settings'].includes(permission))}
                        />
                        <div className="flex-1">
                          <Label htmlFor={permission} className="font-medium capitalize">
                            {permission}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {permission === 'sales' && 'Access to sales transactions and POS'}
                            {permission === 'inventory' && 'Manage products and inventory levels'}
                            {permission === 'employees' && 'View and manage employee information'}
                            {permission === 'payments' && 'Configure payment methods and settings'}
                            {permission === 'settings' && 'Access to business settings and configuration'}
                            {permission === 'reports' && 'View business reports and analytics'}
                          </p>
                        </div>
                        {selectedUser.role === 'owner' && ['payments', 'settings'].includes(permission) && (
                          <Crown className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Configure what notifications this user receives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedUser.notifications).map(([notification, enabled]) => (
                      <div key={notification} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id={notification}
                          checked={enabled}
                          onCheckedChange={(checked) => handleNotificationChange(notification, checked as boolean)}
                          disabled={!isEditMode}
                        />
                        <div>
                          <Label htmlFor={notification} className="font-medium capitalize">
                            {notification} Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {notification === 'sales' && 'New sales and transaction notifications'}
                            {notification === 'inventory' && 'Low stock alerts and inventory updates'}
                            {notification === 'employees' && 'Employee schedule and activity updates'}
                            {notification === 'system' && 'System maintenance and security alerts'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Warning */}
              {selectedUser.role === 'owner' && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-900">Owner Account</h3>
                        <p className="text-sm text-yellow-800 mt-1">
                          This is the primary owner account with full system access. Some permissions cannot be modified 
                          and role changes are restricted for security purposes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a user to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Information Notice */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Admin User Management</h3>
              <p className="text-sm text-blue-800 mt-1">
                Admin users have access to the administrative interface and can manage various aspects of your business. 
                The owner account has full privileges and cannot be downgraded. Changes to user permissions take effect immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 