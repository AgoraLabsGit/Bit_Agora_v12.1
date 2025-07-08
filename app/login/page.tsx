"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Delete } from "lucide-react"
import { PinPad } from "@/components/ui/pin-pad"

export default function LoginPage() {
  const [mode, setMode] = useState<"admin" | "pos">("admin")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (mode === "admin") {
        // Use real API to authenticate user
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })
        
        const result = await response.json()
        
        if (result.success && result.data) {
          console.log("✅ Login successful:", result.data)
          
          // Store user session
          localStorage.setItem('bitagora_current_user', JSON.stringify(result.data))
          
          // Redirect to dashboard
          window.location.href = "/dashboard"
        } else {
          console.error("❌ Login failed:", result.error)
          alert(`Login failed: ${result.error || 'Invalid email or password'}`)
        }
      } else {
        // POS PIN login
        if (pin.length !== 4) {
          alert("Please enter a 4-digit PIN")
          return
        }

        // Use real API to authenticate by PIN
        const response = await fetch('/api/employees')
        const result = await response.json()
        
        if (result.success && result.data) {
          // Find employee with matching PIN
          const employee = result.data.find((emp: any) => emp.pin === pin && emp.status === 'active')
          
          if (employee) {
            console.log("✅ PIN login successful:", employee)
            
            // Store employee session
            localStorage.setItem('bitagora_current_user', JSON.stringify({
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              role: employee.role,
              status: employee.status,
              pin: employee.pin
            }))
            
            // Redirect to POS
            window.location.href = "/pos"
          } else {
            console.error("❌ PIN login failed: Invalid PIN or inactive employee")
            alert("Invalid PIN or inactive employee. Please try again.")
            setPin("")
          }
        } else {
          console.error("❌ Failed to fetch employees:", result.error)
          alert("Failed to authenticate. Please try again.")
          setPin("")
        }
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinLogin = async () => {
    if (pin.length === 4) {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent
      await handleSubmit(mockEvent)
    }
  }

  const handlePinChange = (value: string) => {
    setPin(value)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg bg-card rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="space-y-2 sm:space-y-3 pb-6 sm:pb-8 text-center">
          <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2 sm:mb-3" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-1 sm:mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8">
            Sign in to your account
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Button
            variant={mode === "admin" ? "default" : "secondary"}
            onClick={() => setMode("admin")}
            className="h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform"
          >
            Admin Login
          </Button>
          <Button
            variant={mode === "pos" ? "default" : "secondary"}
            onClick={() => setMode("pos")}
            className="h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform"
          >
            POS Login
          </Button>
        </div>

        {mode === "admin" ? (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-primary hover:underline text-sm sm:text-base">
                Forgot password?
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-6 sm:mt-8 h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <PinPad
                value={pin}
              onChange={handlePinChange}
              onSubmit={handlePinLogin}
              label="Enter PIN"
                placeholder="Enter 4-digit PIN"
              disabled={isLoading}
            />
            
            {/* Additional Login Button for better UX */}
            <Button 
              onClick={handlePinLogin}
              className={`w-full h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform ${
                pin.length === 4 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={pin.length !== 4 || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
          <p className="text-sm sm:text-base text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 