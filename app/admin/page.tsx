"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Receipt,
  ShoppingCart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  RefreshCw,
  Archive,
  AlertTriangle
} from "lucide-react"

interface DashboardStats {
  totalSales: number
  todaySales: number
  totalTransactions: number
  todayTransactions: number
  totalProducts: number
  totalEmployees: number
  lowStockItems: number
  pendingRefunds: number
}

interface RecentActivity {
  id: string
  type: 'product_added' | 'product_updated' | 'employee_added' | 'employee_updated' | 'transaction_refunded' | 'settings_changed'
  title: string
  description: string
  timestamp: string
  user: string
  icon: any
  color: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats from various APIs
        const [transactionsResponse, productsResponse, employeesResponse] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/products'),
          fetch('/api/employees')
        ])

        const transactions = await transactionsResponse.json()
        const products = await productsResponse.json()
        const employees = await employeesResponse.json()

        // Calculate stats
        const today = new Date().toDateString()
        const transactionData = transactions.data || []
        const productData = products.data || []
        const employeeData = employees.data || []

        const todayTransactions = transactionData.filter((t: any) => 
          new Date(t.timestamp || Date.now()).toDateString() === today
        )

        const totalSales = transactionData.reduce((sum: number, t: any) => sum + (t.total || 0), 0)
        const todaySales = todayTransactions.reduce((sum: number, t: any) => sum + (t.total || 0), 0)

        setStats({
          totalSales,
          todaySales,
          totalTransactions: transactionData.length,
          todayTransactions: todayTransactions.length,
          totalProducts: productData.length,
          totalEmployees: employeeData.length,
          lowStockItems: productData.filter((p: any) => p.stockQuantity && p.stockQuantity < 5).length,
          pendingRefunds: transactionData.filter((t: any) => t.refundStatus === 'pending').length
        })

        // Generate mock recent admin activity
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'product_added',
            title: 'New Product Added',
            description: 'Fresh Smoothie added to menu',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user: 'Admin',
            icon: Package,
            color: 'text-green-600'
          },
          {
            id: '2',
            type: 'employee_updated',
            title: 'Employee Updated',
            description: 'Updated role for Sarah Johnson',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Admin',
            icon: UserPlus,
            color: 'text-blue-600'
          },
          {
            id: '3',
            type: 'transaction_refunded',
            title: 'Refund Processed',
            description: 'Refund completed for transaction #1234',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: 'Admin',
            icon: RefreshCw,
            color: 'text-orange-600'
          },
          {
            id: '4',
            type: 'settings_changed',
            title: 'Tax Settings Updated',
            description: 'Updated tax rate to 21% (Argentina IVA)',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            user: 'Admin',
            icon: Settings,
            color: 'text-purple-600'
          },
          {
            id: '5',
            type: 'product_updated',
            title: 'Product Status Changed',
            description: 'Coffee marked as 86\'d (out of stock)',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            user: 'Admin',
            icon: Archive,
            color: 'text-red-600'
          }
        ]

        setRecentActivity(mockActivity)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ago`
    } else {
      return `${minutes}m ago`
    }
  }

  if (isLoading) {
  return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Manage your business operations and settings
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Business Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <ShoppingCart className="h-6 w-6" />
                  Business Management
                </CardTitle>
                <CardDescription>Core business operations and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/admin/transactions">
                    <Receipt className="h-4 w-4 mr-2" />
                    Transactions
                  </Link>
                  </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/products">
                    <Package className="h-4 w-4 mr-2" />
                    Products
                    </Link>
                  </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/employees">
                    <Users className="h-4 w-4 mr-2" />
                    Employees
                    </Link>
                  </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Clock className="h-6 w-6" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest admin actions and changes</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 3).map((activity) => {
                      const IconComponent = activity.icon
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${activity.color}`}>
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      )
                    })}
                    <Button asChild variant="outline" className="w-full mt-3">
                      <Link href="/admin/activity">View All Activity</Link>
                  </Button>
                </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* System Status & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <AlertCircle className="h-6 w-6" />
                  System Status
                </CardTitle>
                <CardDescription>Important notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.lowStockItems && stats.lowStockItems > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{stats.lowStockItems} items low in stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>All items in stock</span>
                  </div>
                )}
                
                {stats?.pendingRefunds && stats.pendingRefunds > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{stats.pendingRefunds} pending refunds</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>No pending refunds</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>All systems operational</span>
                </div>

                <Button asChild variant="outline" className="w-full mt-3">
                  <Link href="/admin/settings">System Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Phase 1 MVP Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Calendar className="h-6 w-6" />
                Phase 1 MVP Development Status
              </CardTitle>
              <CardDescription>Core admin functionality progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Admin Layout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Tax System</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Product Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Employee Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Transaction Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Refund Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Payment Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Quality Assurance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 