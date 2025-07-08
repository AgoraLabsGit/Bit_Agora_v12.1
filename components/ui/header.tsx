"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  BarChart3,
  Settings,
  ShoppingCart
} from "lucide-react"

interface HeaderProps {
  currentPage: 'dashboard' | 'pos' | 'admin'
}

export function Header({ currentPage }: HeaderProps) {
  const [businessName, setBusinessName] = useState('Your Business')

  // Load business name from current user or API
  useEffect(() => {
    const loadBusinessName = async () => {
      try {
        // First try localStorage
        const currentUser = localStorage.getItem('bitagora_current_user')
        console.log('Header: localStorage bitagora_current_user:', currentUser) // Debug log
        
        if (currentUser) {
          const user = JSON.parse(currentUser)
          console.log('Header: Parsed user data:', user) // Debug log
          if (user.businessName) {
            console.log('Header: Setting business name from localStorage:', user.businessName) // Debug log
            setBusinessName(user.businessName)
            return
          }
        }
        
        // If no localStorage data, try to fetch from API
        console.log('Header: No localStorage data, fetching from API...') // Debug log
        const response = await fetch('/api/users')
        const result = await response.json()
        
        if (result.success && result.data && result.data.length > 0) {
          const user = result.data[0] // Get first user (admin)
          console.log('Header: Fetched user from API:', user) // Debug log
          if (user.businessName) {
            console.log('Header: Setting business name from API:', user.businessName) // Debug log
            setBusinessName(user.businessName)
            // Store in localStorage for future use
            localStorage.setItem('bitagora_current_user', JSON.stringify(user))
          }
        }
      } catch (error) {
        console.error('Header: Error loading business name:', error)
      }
    }
    
    loadBusinessName()
  }, [])

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 z-10">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <span className="text-xl sm:text-2xl font-light tracking-tight">
              <span className="text-foreground">Bit</span>
              <span className="font-semibold text-foreground">Agora</span>
            </span>
          </div>

          {/* Business Name - Absolutely Centered */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <span 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-wide font-bebas-neue" 
              style={{ letterSpacing: '0.1em', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              {businessName}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4 z-10">
            <Button 
              variant={currentPage === 'pos' ? "default" : "outline"} 
              asChild 
              className="h-10 sm:h-12 touch-manipulation"
            >
              <Link href="/pos" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden md:inline">POS</span>
              </Link>
            </Button>
            <Button 
              variant={currentPage === 'dashboard' ? "default" : "outline"} 
              asChild 
              className="h-10 sm:h-12 touch-manipulation"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <Button 
              variant={currentPage === 'admin' ? "default" : "outline"} 
              asChild 
              className="h-10 sm:h-12 touch-manipulation"
            >
              <Link href="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-10 sm:h-12 touch-manipulation">
              <Link href="/login">
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 