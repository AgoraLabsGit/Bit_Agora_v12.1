"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Trash2, Download, User as UserIcon, RefreshCw, Activity } from "lucide-react"
// Debug panel now uses real APIs instead of mock data

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  businessName: string
  businessType: string
  city: string
  state: string
  zipCode: string
  subscriptionTier: string
  role: string
  status: string
  createdAt: string
}

export default function DebugPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Check if we're in development environment
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Redirect in production
  useEffect(() => {
    if (!isDevelopment) {
      window.location.href = '/dashboard'
    }
  }, [isDevelopment])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch users from real API
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success && result.data) {
        setUsers(result.data)
      } else {
        setUsers([])
      }
      
      // Get current logged-in user
      try {
        const stored = localStorage.getItem('bitagora_current_user')
        if (stored) {
          setCurrentUser(JSON.parse(stored))
        }
      } catch {
        setCurrentUser(null)
      }
      
      setRefreshCount(prev => prev + 1)
    } catch (error) {
      console.error('Error loading data:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClearAllData = async () => {
    if (confirm('⚠️ This will clear ALL data including server-side storage. This action cannot be undone. Continue?')) {
      try {
        setIsLoading(true)
        
        // Clear client-side localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('bitagora_'))
        keys.forEach(key => localStorage.removeItem(key))
        
        // Clear server-side data by calling a new API endpoint
        const response = await fetch('/api/debug/clear-all', { method: 'POST' })
        const result = await response.json()
        
        if (result.success) {
          setUsers([])
          setCurrentUser(null)
          alert('✅ All data cleared successfully! You can now test fresh onboarding.')
        } else {
          throw new Error(result.error || 'Failed to clear server data')
        }
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('❌ Error clearing data: ' + (error instanceof Error ? error.message : String(error)))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClearSessionOnly = () => {
    if (confirm('Clear current session only? (Server data will remain)')) {
      // Clear client-side localStorage only
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bitagora_'))
      keys.forEach(key => localStorage.removeItem(key))
      
      setUsers([])
      setCurrentUser(null)
      alert('✅ Session cleared! Server data still exists.')
    }
  }

  const handleExportData = async () => {
    try {
      // Export current users data
      const data = {
        users: users,
        currentUser: currentUser,
        exportedAt: new Date().toISOString(),
        note: "Data exported from BitAgora POS Debug Panel"
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bitagora-debug-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Check console for details.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('bitagora_current_user')
    setCurrentUser(null)
    alert('Logged out successfully!')
  }

  // Show loading if redirecting in production
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Development Environment Notice */}
      <div className="bg-amber-100 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
            🚧 Development Debug Panel - Not available in production
          </p>
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-light tracking-tight">
                <span className="text-foreground">Bit</span>
                <span className="font-semibold text-foreground">Agora</span>
              </span>
              <span className="text-sm text-muted-foreground ml-4">Debug Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">← Landing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Debug Panel - Real API Data
          </h1>
          <p className="text-muted-foreground">
            View and manage user registration data from the API for testing and debugging.
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Controls</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data ({refreshCount})
            </Button>
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={handleClearAllData} variant="destructive" disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading ? "Clearing..." : "Clear All Data"}
            </Button>
            <Button onClick={handleClearSessionOnly} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Session Only
            </Button>
            {currentUser && (
              <Button onClick={handleLogout} variant="secondary">
                Logout Current User
              </Button>
            )}
          </div>
        </div>

        {/* Current User */}
        {currentUser && (
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
                         <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
               <UserIcon className="h-5 w-5" />
               Currently Logged In
             </h2>
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Name</p>
                  <p className="text-sm text-muted-foreground">{currentUser.firstName} {currentUser.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Business</p>
                  <p className="text-sm text-muted-foreground">{currentUser.businessName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Plan</p>
                  <p className="text-sm text-muted-foreground">{currentUser.subscriptionTier}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Registered Users ({users.length})
          </h2>
          
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No users registered yet.</p>
              <Button asChild>
                <Link href="/register">Register First User</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Name & Email</p>
                      <p className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Business</p>
                      <p className="text-sm text-muted-foreground">{user.businessName}</p>
                      <p className="text-sm text-muted-foreground">{user.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">{user.city}, {user.state}</p>
                      <p className="text-sm text-muted-foreground">{user.zipCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Account</p>
                      <p className="text-sm text-muted-foreground">Plan: {user.subscriptionTier}</p>
                      <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                      <p className="text-sm text-muted-foreground">Status: {user.status}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id} • Created: {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Testing Instructions</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>1. <strong>Register a new user:</strong> Go to <Link href="/register" className="text-primary hover:underline">/register</Link> and complete the 4-step form</p>
            <p>2. <strong>View registration data:</strong> Check this page to see the stored user data</p>
            <p>3. <strong>Test login:</strong> Go to <Link href="/login" className="text-primary hover:underline">/login</Link> and use the email you registered with (any password works)</p>
            <p>4. <strong>Browser console:</strong> Open DevTools Console to see detailed API responses</p>
            <p>5. <strong>Data persistence:</strong> Data persists in .bitagora-data/ directory on server</p>
            <p>6. <strong>API endpoints:</strong> All data now comes from real API endpoints at /api/*</p>
          </div>
        </div>
      </main>
    </div>
  )
}