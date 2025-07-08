"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePinProtection, AdminSessionStatus, ProtectedButton, ProtectedInput, ProtectedSelect } from "@/components/admin/PinProtectionService"
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  format,
  isWithinInterval,
  parseISO
} from 'date-fns'

import { 
  Receipt,
  RefreshCw,
  Filter,
  Search,
  Download,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Undo2,
  X,
  ChevronDown,
  Bitcoin,
  Smartphone,
  Banknote,
  Zap,
  QrCode,
  XCircle,
  RotateCcw,
  Shield,
  FilterX,
  ArrowUpDown
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Transaction interface matching our database schema
interface Transaction {
  id: string
  merchantId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category: string
    emoji: string
  }>
  total: number
  paymentMethod: 'cash' | 'card' | 'bitcoin' | 'lightning' | 'usdt' | 'qr'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  employeeId: string
  customerId?: string
  createdAt: string
  completedAt?: string
  customerAddress?: string // For crypto payments
  refunded?: boolean
}

// Filter state interface
interface TransactionFilters {
  dateFrom: string
  dateTo: string
  paymentMethod: string
  paymentStatus: string
  searchQuery: string
  employee: string
}

// Using centralized PIN protection service - no local modal needed

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'employee'
  pin: string
  isActive: boolean
  permissions?: {
    canProcessRefunds: boolean
    canModifyProducts: boolean
    canManageEmployees: boolean
    canViewReports: boolean
    canModifySettings: boolean
    canAccessAdmin: boolean
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: '',
    dateTo: '',
    paymentMethod: '',
    paymentStatus: '',
    searchQuery: '',
    employee: ''
  })
  
  const [showFilters, setShowFilters] = useState(false)

  // PIN Protection Service
  const { requireAuthentication, authenticatedUser } = usePinProtection()

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/transactions')
        const result = await response.json()
        
        if (result.success && result.data) {
          console.log('✅ Loaded transactions:', result.data.length, 'items')
          console.log('Sample transaction:', result.data[0])
          setTransactions(result.data)
        } else {
          console.error('❌ Failed to load transactions:', result)
          setError('Failed to load transactions')
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchTransactions, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Apply filters whenever transactions or filter states change
    applyFilters()
  }, [transactions, filters])

  // Filter transactions based on current filters
  const applyFilters = () => {
    let filtered = [...transactions]

    // Date range filter - Timezone-aware comparison using date-fns
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.createdAt)
        
        // Convert filter dates to local timezone for comparison
        if (filters.dateFrom && filters.dateTo) {
          const fromDate = startOfDay(new Date(filters.dateFrom + 'T00:00:00'))
          const toDate = endOfDay(new Date(filters.dateTo + 'T23:59:59'))
          return isWithinInterval(transactionDate, { start: fromDate, end: toDate })
        } else if (filters.dateFrom) {
          const fromDate = startOfDay(new Date(filters.dateFrom + 'T00:00:00'))
          return transactionDate >= fromDate
        } else if (filters.dateTo) {
          const toDate = endOfDay(new Date(filters.dateTo + 'T23:59:59'))
          return transactionDate <= toDate
        }
        
        return true
      })
    }
    
    // Payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod)
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentStatus === filters.paymentStatus)
    }
    
    // Search query filter (ID, employee, items)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(transaction => {
        const matchesId = transaction.id.toLowerCase().includes(query)
        const matchesEmployee = transaction.employeeId.toLowerCase().includes(query)
        const matchesItems = transaction.items.some(item => 
          item.name.toLowerCase().includes(query)
        )
        
        return matchesId || matchesEmployee || matchesItems
      })
    }
    
    // Employee filter
    if (filters.employee && filters.employee !== 'all') {
      filtered = filtered.filter(transaction => transaction.employeeId === filters.employee)
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTransactions(filtered)
  }

  // Handle filter changes
  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      paymentMethod: '',
      paymentStatus: '',
      searchQuery: '',
      employee: ''
    })
  }

  // Quick filter functions - Timezone-aware using date-fns
  const setTodayFilter = () => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    
    setFilters(prev => ({ 
      ...prev, 
      dateFrom: todayStr, 
      dateTo: todayStr,
      paymentMethod: '',
      paymentStatus: '',
      searchQuery: '',
      employee: ''
    }))
  }

  const setYesterdayFilter = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd')
    
    setFilters(prev => ({ 
      ...prev, 
      dateFrom: yesterdayStr, 
      dateTo: yesterdayStr 
    }))
  }

  const setThisWeekFilter = () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }) // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 }) // Saturday
    
    setFilters(prev => ({ 
      ...prev, 
      dateFrom: format(weekStart, 'yyyy-MM-dd'), 
      dateTo: format(weekEnd, 'yyyy-MM-dd')
    }))
  }

  const setThisMonthFilter = () => {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    
    setFilters(prev => ({ 
      ...prev, 
      dateFrom: format(monthStart, 'yyyy-MM-dd'),
      dateTo: format(monthEnd, 'yyyy-MM-dd')
    }))
  }

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        const result = await response.json()
        
        if (result.success) {
          setEmployees(result.data || [])
        }
      } catch (err) {
        console.error('Error loading employees:', err)
      }
    }

    fetchEmployees()
  }, [])

  // Utility functions
  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'bitcoin': return <Bitcoin className="h-4 w-4" />
      case 'lightning': return <Zap className="h-4 w-4" />
      case 'usdt': return <DollarSign className="h-4 w-4" />
      case 'qr': return <Smartphone className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash'
      case 'card': return 'Card'
      case 'bitcoin': return 'Bitcoin'
      case 'lightning': return 'Lightning'
      case 'usdt': return 'USDT'
      case 'qr': return 'QR Payment'
      default: return method
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'refunded': return <RotateCcw className="h-4 w-4 text-orange-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId
  }

  const processRefund = async (transactionId: string) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          paymentStatus: 'refunded',
          refundedBy: authenticatedUser?.firstName || 'Admin',
          refundedAt: new Date().toISOString()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Refund processed successfully!')
        // Reload transactions to show updated status
        const fetchTransactions = async () => {
          try {
            const response = await fetch('/api/transactions')
            const result = await response.json()
            if (result.success && result.data) {
              setTransactions(result.data)
            }
          } catch (error) {
            console.error('Error reloading transactions:', error)
          }
        }
        await fetchTransactions()
      } else {
        alert('Failed to process refund: ' + result.error)
      }
    } catch (error) {
      alert('Error processing refund. Please try again.')
    }
  }

  const handleRefundClick = (transactionId: string) => {
    processRefund(transactionId)
  }

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      
      if (sortOrder === 'asc') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })
  }, [filteredTransactions, sortOrder])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Transaction Management</h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <AdminSessionStatus />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <ProtectedButton
                action="Export transaction data"
                requiredPermission="canViewReports"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </ProtectedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          
          {/* Filters Section */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Transaction Filters
                </CardTitle>
                <CardDescription>Filter transactions by date, payment method, and status</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Top Row - Search, Status, Payment Method, Employee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <Label htmlFor="searchQuery" className="text-sm font-medium">Search</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <ProtectedInput
                        action="Search transactions"
                        requiredPermission="canViewReports"
                        placeholder="ID, items..."
                        value={filters.searchQuery}
                        onChange={(value) => updateFilter('searchQuery', value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  {/* Payment Status */}
                  <div>
                    <Label htmlFor="paymentStatus" className="text-sm font-medium">Status</Label>
                    <ProtectedSelect
                      action="Filter by payment status"
                      requiredPermission="canViewReports"
                      value={filters.paymentStatus}
                      onValueChange={(value) => updateFilter('paymentStatus', value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </ProtectedSelect>
                  </div>
                  
                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</Label>
                    <ProtectedSelect
                      action="Filter by payment method"
                      requiredPermission="canViewReports"
                      value={filters.paymentMethod}
                      onValueChange={(value) => updateFilter('paymentMethod', value)}
                    >
                      <option value="">All Methods</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bitcoin">Bitcoin</option>
                      <option value="lightning">Lightning</option>
                      <option value="usdt">USDT</option>
                      <option value="qr">QR Payment</option>
                    </ProtectedSelect>
                  </div>

                  {/* Employee */}
                  <div>
                    <Label htmlFor="employee" className="text-sm font-medium">Employee</Label>
                    <ProtectedSelect
                      action="Filter by employee"
                      requiredPermission="canViewReports"
                      value={filters.employee}
                      onValueChange={(value) => updateFilter('employee', value)}
                    >
                      <option value="">All Employees</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </option>
                      ))}
                    </ProtectedSelect>
                  </div>
                </div>
                
                {/* Second Row - Date Range and Quick Filters */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Label className="text-sm font-medium mb-3 block">Date Range & Quick Filters</Label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                    {/* Date From */}
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">From Date</Label>
                      <ProtectedInput
                        action="Set date range filter"
                        requiredPermission="canViewReports"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(value) => updateFilter('dateFrom', value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    {/* Date To */}
                    <div>
                      <Label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">To Date</Label>
                      <ProtectedInput
                        action="Set date range filter"
                        requiredPermission="canViewReports"
                        type="date"
                        value={filters.dateTo}
                        onChange={(value) => updateFilter('dateTo', value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <ProtectedButton
                      action="Apply Today filter"
                      requiredPermission="canViewReports"
                      onClick={setTodayFilter}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-9 text-xs"
                    >
                      <Calendar className="h-3 w-3" />
                      Today
                    </ProtectedButton>
                    
                    <ProtectedButton
                      action="Apply Yesterday filter"
                      requiredPermission="canViewReports"
                      onClick={setYesterdayFilter}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-9 text-xs"
                    >
                      <Calendar className="h-3 w-3" />
                      Yesterday
                    </ProtectedButton>
                    
                    <ProtectedButton
                      action="Apply This Week filter"
                      requiredPermission="canViewReports"
                      onClick={setThisWeekFilter}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-9 text-xs"
                    >
                      <Calendar className="h-3 w-3" />
                      This Week
                    </ProtectedButton>
                    
                    <ProtectedButton
                      action="Clear all filters"
                      requiredPermission="canViewReports"
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-9 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </ProtectedButton>
                  </div>
                </div>
                
                {/* Filter Summary */}
                <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                  </span>
                  {(filters.dateFrom || filters.dateTo) && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {filters.dateFrom && filters.dateTo && filters.dateFrom === filters.dateTo
                        ? `Date: ${format(new Date(filters.dateFrom), 'MMM dd, yyyy')} (${filters.dateFrom})`
                        : filters.dateFrom && filters.dateTo
                        ? `Range: ${format(new Date(filters.dateFrom), 'MMM dd')} - ${format(new Date(filters.dateTo), 'MMM dd, yyyy')}`
                        : filters.dateFrom
                        ? `From: ${format(new Date(filters.dateFrom), 'MMM dd, yyyy')}`
                        : `Until: ${format(new Date(filters.dateTo), 'MMM dd, yyyy')}`
                      }
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatAmount(filteredTransactions.reduce((sum, t) => sum + t.total, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredTransactions.filter(t => t.paymentStatus === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Refunded</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {filteredTransactions.filter(t => t.paymentStatus === 'refunded').length}
                    </p>
                  </div>
                  <RotateCcw className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Transactions ({sortedTransactions.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort by Date ({sortOrder === 'asc' ? 'Oldest' : 'Newest'})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                    {(filters.dateFrom || filters.dateTo || filters.paymentMethod || filters.paymentStatus || filters.searchQuery) && (
                      <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Date/Time</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Payment Type</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Employee</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground">Items</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-sm font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                          {/* Transaction ID */}
                          <td className="py-3 px-2 sm:px-4">
                            <span className="text-sm font-mono text-foreground">
                              #{transaction.id.slice(-6)}
                            </span>
                          </td>
                          
                          {/* Date/Time */}
                          <td className="py-3 px-2 sm:px-4">
                            <span className="text-sm text-foreground">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </td>
                          
                          {/* Amount */}
                          <td className="py-3 px-2 sm:px-4">
                            <span className="text-sm font-semibold text-foreground">
                              {formatAmount(transaction.total)}
                            </span>
                          </td>
                          
                          {/* Payment Type */}
                          <td className="py-3 px-2 sm:px-4">
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                              <span className="text-sm text-foreground">
                                {getPaymentMethodLabel(transaction.paymentMethod)}
                              </span>
                            </div>
                          </td>
                          
                          {/* Employee */}
                          <td className="py-3 px-2 sm:px-4">
                            <span className="text-sm text-foreground">
                              {getEmployeeName(transaction.employeeId)}
                            </span>
                          </td>
                          
                          {/* Status */}
                          <td className="py-3 px-2 sm:px-4">
                            <Badge className={`${getStatusColor(transaction.paymentStatus)} text-xs`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(transaction.paymentStatus)}
                                {getStatusLabel(transaction.paymentStatus)}
                              </div>
                            </Badge>
                          </td>
                          
                          {/* Items */}
                          <td className="py-3 px-2 sm:px-4">
                            <div className="text-sm text-foreground">
                              {transaction.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span>{item.emoji}</span>
                                  <span>{item.name}</span>
                                  <span className="text-muted-foreground">x{item.quantity}</span>
                                </div>
                              ))}
                              {transaction.items.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{transaction.items.length - 2} more...
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Refund */}
                          <td className="py-3 px-2 sm:px-4 text-right">
                            {transaction.paymentStatus === 'completed' && !transaction.refunded && (
                              <ProtectedButton
                                action={`Refund transaction ${transaction.id.slice(-6)}`}
                                requiredPermission="canProcessRefunds"
                                onClick={() => handleRefundClick(transaction.id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">Refund</span>
                              </ProtectedButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 