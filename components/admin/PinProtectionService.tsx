"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle, Lock, User, CheckCircle } from "lucide-react"
import { PinPad } from "@/components/ui/pin-pad"

interface Employee {
  id: string
  firstName: string
  lastName: string
  pin: string
  role: 'admin' | 'manager' | 'employee'
  status: 'active' | 'inactive'
  permissions?: {
    canProcessRefunds: boolean
    canModifyProducts: boolean
    canManageEmployees: boolean
    canViewReports: boolean
    canModifySettings: boolean
    canAccessAdmin: boolean
  }
}

interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'employee'
  permissions: {
    canProcessRefunds: boolean
    canModifyProducts: boolean
    canManageEmployees: boolean
    canViewReports: boolean
    canModifySettings: boolean
    canAccessAdmin: boolean
  }
  authenticatedAt: string
}

interface PinProtectionContextType {
  authenticatedUser: AuthenticatedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  authenticate: (pin: string) => Promise<boolean>
  logout: () => void
  requireAuthentication: (action: string, callback: () => void, requiredPermission?: string) => void
  // Permission checkers
  canProcessRefunds: () => boolean
  canModifyProducts: () => boolean
  canManageEmployees: () => boolean
  canViewReports: () => boolean
  canModifySettings: () => boolean
  canAccessAdmin: () => boolean
  // Role checkers
  isAdmin: () => boolean
  isManager: () => boolean
  isEmployee: () => boolean
}

const PinProtectionContext = createContext<PinProtectionContextType | undefined>(undefined)

// PIN Protection Modal Component
function PinProtectionModal({ isOpen, onClose, onAuthenticate, title, description }: {
  isOpen: boolean
  onClose: () => void
  onAuthenticate: (pin: string) => Promise<boolean>
  title: string
  description?: string
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await onAuthenticate(pin)
      if (success) {
        handleClose()
      } else {
        setError('Invalid PIN or insufficient permissions')
      }
    } catch (error) {
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPin('')
    setError('')
    setIsLoading(false)
    onClose()
  }

  const handlePinChange = (value: string) => {
    setPin(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <PinPad
            value={pin}
            onChange={handlePinChange}
            label="Admin/Manager PIN"
            placeholder="Enter 4-digit PIN"
            disabled={isLoading}
          />
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              className="flex-1" 
              disabled={isLoading || pin.length !== 4}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Authenticate
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Session Status Component
function AdminSessionStatus() {
  const { authenticatedUser, isAuthenticated, logout } = usePinProtection()

  if (!isAuthenticated || !authenticatedUser) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
        <Lock className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-600">Not authenticated</span>
      </div>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'manager': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'employee': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'manager': return <User className="h-4 w-4" />
      case 'employee': return <CheckCircle className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${getRoleColor(authenticatedUser.role)}`}>
      {getRoleIcon(authenticatedUser.role)}
      <span className="text-sm capitalize">
        {authenticatedUser.role}: {authenticatedUser.firstName} {authenticatedUser.lastName}
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={logout}
        className="ml-2 text-xs"
      >
        Logout
      </Button>
    </div>
  )
}

// PIN Protection Provider Component
export function PinProtectionProvider({ children }: { children: ReactNode }) {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
    callback: () => {}
  })

  useEffect(() => {
    // Check for existing session
    const checkExistingSession = () => {
      try {
        const saved = localStorage.getItem('bitagora_admin_session')
        if (saved) {
          const session = JSON.parse(saved)
          const now = new Date()
          const authenticatedAt = new Date(session.authenticatedAt)
          const sessionDuration = now.getTime() - authenticatedAt.getTime()
          
          // Session expires after 1 hour
          if (sessionDuration < 60 * 60 * 1000) {
            setAuthenticatedUser(session)
          } else {
            localStorage.removeItem('bitagora_admin_session')
          }
        }
      } catch (error) {
        localStorage.removeItem('bitagora_admin_session')
      }
      setIsLoading(false)
    }

    checkExistingSession()
  }, [])

  const authenticate = async (pin: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()
      
      if (result.success) {
        const employee = result.data.find((e: Employee) => 
          e.pin === pin && 
          (e.role === 'admin' || e.role === 'manager') && 
          e.status === 'active'
        )
        
        if (employee) {
          // Default permissions based on role
          const defaultPermissions = {
            admin: {
              canProcessRefunds: true,
              canModifyProducts: true,
              canManageEmployees: true,
              canViewReports: true,
              canModifySettings: true,
              canAccessAdmin: true
            },
            manager: {
              canProcessRefunds: true,
              canModifyProducts: true,
              canManageEmployees: false,
              canViewReports: true,
              canModifySettings: false,
              canAccessAdmin: true
            },
            employee: {
              canProcessRefunds: false,
              canModifyProducts: false,
              canManageEmployees: false,
              canViewReports: false,
              canModifySettings: false,
              canAccessAdmin: false
            }
          }

          const user: AuthenticatedUser = {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role,
            permissions: employee.permissions || defaultPermissions[employee.role],
            authenticatedAt: new Date().toISOString()
          }
          
          setAuthenticatedUser(user)
          
          // Save session to localStorage
          localStorage.setItem('bitagora_admin_session', JSON.stringify(user))
          
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    }
  }

  const logout = () => {
    setAuthenticatedUser(null)
    localStorage.removeItem('bitagora_admin_session')
  }

  const requireAuthentication = (action: string, callback: () => void, requiredPermission?: string) => {
    if (authenticatedUser) {
      // Check if session is still valid (1 hour)
      const now = new Date()
      const authenticatedAt = new Date(authenticatedUser.authenticatedAt)
      const sessionDuration = now.getTime() - authenticatedAt.getTime()
      
      if (sessionDuration < 60 * 60 * 1000) {
        // Check if user has required permission
        if (requiredPermission) {
          const hasPermission = authenticatedUser.permissions[requiredPermission as keyof typeof authenticatedUser.permissions]
          if (!hasPermission) {
            alert(`Access denied: You don't have permission to ${action.toLowerCase()}`)
            return
          }
        }
        callback()
        return
      } else {
        // Session expired
        logout()
      }
    }
    
    // Show authentication modal
    setModalState({
      isOpen: true,
      title: 'Admin Authentication Required',
      description: `This action requires admin/manager authentication: ${action}`,
      callback
    })
  }

  const handleModalAuthenticate = async (pin: string): Promise<boolean> => {
    const success = await authenticate(pin)
    if (success) {
      modalState.callback()
    }
    return success
  }

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      title: '',
      description: '',
      callback: () => {}
    })
  }

  // Permission checkers
  const canProcessRefunds = () => authenticatedUser?.permissions?.canProcessRefunds || false
  const canModifyProducts = () => authenticatedUser?.permissions?.canModifyProducts || false
  const canManageEmployees = () => authenticatedUser?.permissions?.canManageEmployees || false
  const canViewReports = () => authenticatedUser?.permissions?.canViewReports || false
  const canModifySettings = () => authenticatedUser?.permissions?.canModifySettings || false
  const canAccessAdmin = () => authenticatedUser?.permissions?.canAccessAdmin || false

  // Role checkers
  const isAdmin = () => authenticatedUser?.role === 'admin'
  const isManager = () => authenticatedUser?.role === 'manager'
  const isEmployee = () => authenticatedUser?.role === 'employee'

  const value: PinProtectionContextType = {
    authenticatedUser,
    isAuthenticated: !!authenticatedUser,
    isLoading,
    authenticate,
    logout,
    requireAuthentication,
    // Permission checkers
    canProcessRefunds,
    canModifyProducts,
    canManageEmployees,
    canViewReports,
    canModifySettings,
    canAccessAdmin,
    // Role checkers
    isAdmin,
    isManager,
    isEmployee
  }

  return (
    <PinProtectionContext.Provider value={value}>
      {children}
      <PinProtectionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onAuthenticate={handleModalAuthenticate}
        title={modalState.title}
        description={modalState.description}
      />
    </PinProtectionContext.Provider>
  )
}

// Hook to use PIN protection
export function usePinProtection() {
  const context = useContext(PinProtectionContext)
  if (context === undefined) {
    throw new Error('usePinProtection must be used within a PinProtectionProvider')
  }
  return context
}

// Protected Action Component
export function ProtectedAction({ 
  action, 
  children, 
  requireAuth = true,
  requiredPermission,
  onClick
}: { 
  action: string
  children: ReactNode
  requireAuth?: boolean
  requiredPermission?: string
  onClick?: () => void
}) {
  const { isAuthenticated, requireAuthentication, authenticatedUser } = usePinProtection()

  const handleClick = () => {
    if (requireAuth && !isAuthenticated) {
      requireAuthentication(action, () => {
        if (onClick) onClick()
      }, requiredPermission)
    } else if (requiredPermission && authenticatedUser) {
      // Check permission
      const hasPermission = authenticatedUser.permissions[requiredPermission as keyof typeof authenticatedUser.permissions]
      if (!hasPermission) {
        alert(`Access denied: You don't have permission to ${action.toLowerCase()}`)
        return
      }
      if (onClick) onClick()
    } else {
      if (onClick) onClick()
    }
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  )
}

// Protected Button Component
export function ProtectedButton({ 
  action, 
  requiredPermission,
  onClick,
  disabled = false,
  className = "",
  variant = "default",
  size = "default",
  children
}: { 
  action: string
  requiredPermission?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: ReactNode
}) {
  const { requireAuthentication, authenticatedUser, isAuthenticated } = usePinProtection()

  const handleClick = () => {
    if (!isAuthenticated) {
      requireAuthentication(action, () => {
        if (onClick) onClick()
      }, requiredPermission)
    } else if (requiredPermission && authenticatedUser) {
      // Check permission
      const hasPermission = authenticatedUser.permissions[requiredPermission as keyof typeof authenticatedUser.permissions]
      if (!hasPermission) {
        alert(`Access denied: You don't have permission to ${action.toLowerCase()}`)
        return
      }
      if (onClick) onClick()
    } else {
      if (onClick) onClick()
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  )
}

// Protected Input Component
export function ProtectedInput({ 
  action, 
  requiredPermission,
  onFocus,
  onChange,
  className = "",
  type = "text",
  placeholder = "",
  value,
  disabled = false
}: { 
  action: string
  requiredPermission?: string
  onFocus?: () => void
  onChange?: (value: string) => void
  className?: string
  type?: string
  placeholder?: string
  value?: string
  disabled?: boolean
}) {
  const { requireAuthentication, authenticatedUser, isAuthenticated } = usePinProtection()

  const handleFocus = () => {
    if (!isAuthenticated) {
      requireAuthentication(action, () => {
        if (onFocus) onFocus()
      }, requiredPermission)
    } else if (requiredPermission && authenticatedUser) {
      // Check permission
      const hasPermission = authenticatedUser.permissions[requiredPermission as keyof typeof authenticatedUser.permissions]
      if (!hasPermission) {
        alert(`Access denied: You don't have permission to ${action.toLowerCase()}`)
        return
      }
      if (onFocus) onFocus()
    } else {
      if (onFocus) onFocus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value)
  }

  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      disabled={disabled}
      className={className}
    />
  )
}

// Protected Select Component
export function ProtectedSelect({ 
  action, 
  requiredPermission,
  onValueChange,
  value,
  placeholder = "Select option",
  disabled = false,
  children
}: { 
  action: string
  requiredPermission?: string
  onValueChange?: (value: string) => void
  value?: string
  placeholder?: string
  disabled?: boolean
  children: ReactNode
}) {
  const { requireAuthentication, authenticatedUser, isAuthenticated } = usePinProtection()

  const handleValueChange = (newValue: string) => {
    if (!isAuthenticated) {
      requireAuthentication(action, () => {
        if (onValueChange) onValueChange(newValue)
      }, requiredPermission)
    } else if (requiredPermission && authenticatedUser) {
      // Check permission
      const hasPermission = authenticatedUser.permissions[requiredPermission as keyof typeof authenticatedUser.permissions]
      if (!hasPermission) {
        alert(`Access denied: You don't have permission to ${action.toLowerCase()}`)
        return
      }
      if (onValueChange) onValueChange(newValue)
    } else {
      if (onValueChange) onValueChange(newValue)
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleValueChange(e.target.value)}
      disabled={disabled}
      className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
    >
      {children}
    </select>
  )
}

// Admin Session Status Export
export { AdminSessionStatus } 