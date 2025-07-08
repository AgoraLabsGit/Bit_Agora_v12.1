"use client"

import { useState } from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { PinProtectionProvider } from "@/components/admin/PinProtectionService"
import { 
  Calendar,
  Clock,
  Users,
  UserPlus,
  DollarSign,
  Package,
  TrendingUp,
  UserCheck,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  Percent,
  Building,
  Bell,
  Link as LinkIcon,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Calculator,
  Menu,
  X
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavigationSection {
  id: string
  title: string
  icon: React.ReactNode
  items: NavigationItem[]
  defaultOpen?: boolean
}

interface NavigationItem {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  priority?: 'PHASE_1' | 'FUTURE'
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['business'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const navigationSections: NavigationSection[] = [
    {
      id: 'business',
      title: 'Business',
      icon: <Building className="h-5 w-5" />,
      defaultOpen: true,
      items: [
        {
          id: 'transactions',
          title: 'Transactions',
          href: '/admin/transactions',
          icon: <Receipt className="h-4 w-4" />,
          badge: 'PRIORITY',
          priority: 'PHASE_1'
        },
        {
          id: 'products',
          title: 'Products',
          href: '/admin/products',
          icon: <Package className="h-4 w-4" />,
          badge: 'PRIORITY',
          priority: 'PHASE_1'
        },
        {
          id: 'analytics',
          title: 'Analytics',
          href: '/admin/analytics',
          icon: <TrendingUp className="h-4 w-4" />,
          priority: 'FUTURE'
        },
        {
          id: 'reports',
          title: 'Reports',
          href: '/admin/reports',
          icon: <FileText className="h-4 w-4" />,
          priority: 'FUTURE'
        }
      ]
    },
    {
      id: 'team',
      title: 'Team',
      icon: <Users className="h-5 w-5" />,
      items: [
        {
          id: 'employees',
          title: 'Employee Directory',
          href: '/admin/employees',
          icon: <Users className="h-4 w-4" />,
          badge: 'PRIORITY',
          priority: 'PHASE_1'
        },
        {
          id: 'add-employee',
          title: 'Add Employee',
          href: '/admin/employees/add',
          icon: <UserPlus className="h-4 w-4" />,
          badge: 'PRIORITY',
          priority: 'PHASE_1'
        },
        {
          id: 'timesheet',
          title: 'Timesheet & Shifts',
          href: '/admin/timesheet',
          icon: <Calendar className="h-4 w-4" />,
          priority: 'FUTURE'
        },
        {
          id: 'payroll',
          title: 'Payroll',
          href: '/admin/payroll',
          icon: <DollarSign className="h-4 w-4" />,
          priority: 'FUTURE'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
      items: [
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          href: '/admin/payment-methods',
          icon: <CreditCard className="h-4 w-4" />,
          badge: 'PRIORITY',
          priority: 'PHASE_1'
        },
        {
          id: 'tax-settings',
          title: 'Tax Settings',
          href: '/admin/tax-settings',
          icon: <Calculator className="h-4 w-4" />,
          priority: 'PHASE_1'
        },
        {
          id: 'discount-management',
          title: 'Discount Management',
          href: '/admin/discounts',
          icon: <Percent className="h-4 w-4" />,
          priority: 'FUTURE'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          id: 'business-profile',
          title: 'Business Profile',
          href: '/admin/settings/business',
          icon: <Building className="h-4 w-4" />,
          priority: 'PHASE_1'
        },
        {
          id: 'notifications',
          title: 'Notifications',
          href: '/admin/settings/notifications',
          icon: <Bell className="h-4 w-4" />,
          priority: 'FUTURE'
        },
        {
          id: 'integrations',
          title: 'Integration Settings',
          href: '/admin/settings/integrations',
          icon: <LinkIcon className="h-4 w-4" />,
          priority: 'FUTURE'
        }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <PinProtectionProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <Header currentPage="admin" />

        {/* Main Content with Sidebar */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className={`w-64 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out`}>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {navigationSections.map((section) => {
                  const isExpanded = expandedSections.includes(section.id)
                  const hasPhase1Items = section.items.some(item => item.priority === 'PHASE_1')

                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between p-2 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {/* Section Items */}
                      {(isExpanded) && (
                        <div className="ml-2 space-y-1">
                          {section.items.map((item) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={`flex items-center justify-between p-2 text-sm rounded-md transition-colors ${
                                isActive(item.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {item.icon}
                                <span>{item.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {item.badge && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    item.badge === 'PRIORITY'
                                      ? 'bg-orange-500/10 text-orange-600'
                                      : 'bg-blue-500/10 text-blue-600'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                                {item.priority === 'FUTURE' && (
                                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                    Soon
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Phase 1 MVP Focus</p>
                <p>Building core admin functionality first</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </PinProtectionProvider>
  )
} 