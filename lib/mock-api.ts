// Mock API for testing purposes
// Complies with Frontend-First Mock Database Strategy using mockStorage

import { mockStorage } from './mock-storage'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  businessType: string
  industry: string
  address: string
  city: string
  state: string
  zipCode: string
  pin: string
  subscriptionTier: string
  createdAt: string
  role: 'admin' | 'manager' | 'employee'
  status: 'active' | 'pending' | 'inactive'
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  emoji: string
  description?: string
  inStock: boolean
  stockQuantity: number
  createdAt: string
  updatedAt: string
  merchantId: string
}

export interface Transaction {
  id: string
  merchantId: string
  items: CartItem[]
  total: number
  paymentMethod: 'cash' | 'card' | 'bitcoin' | 'lightning' | 'usdt' | 'qr'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  employeeId: string
  customerId?: string
  createdAt: string
  completedAt?: string
}

export interface Employee {
  id: string
  merchantId: string
  firstName: string
  lastName: string
  email: string
  pin: string
  role: 'admin' | 'manager' | 'employee'
  status: 'active' | 'inactive'
  hourlyRate?: number
  permissions?: {
    canProcessRefunds: boolean
    canModifyProducts: boolean
    canManageEmployees: boolean
    canViewReports: boolean
    canModifySettings: boolean
    canAccessAdmin: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface CartSession {
  id: string
  merchantId: string
  employeeId: string
  items: CartItem[]
  total: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  category: string
  emoji: string
  quantity: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class MockAPI {
  private getStorageKey(type: string): string {
    return `bitagora_${type}`
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Users management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'role' | 'status'>): Promise<ApiResponse<User>> {
    try {
      const users = this.getUsers()
      
      // Check if email already exists
      const existingUser = users.find(u => u.email === userData.email)
      if (existingUser) {
        return {
          success: false,
          error: "Email already registered"
        }
      }

      const newUser: User = {
        ...userData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        role: 'admin', // First user is always admin
        status: 'active'
      }

      users.push(newUser)
      mockStorage.setItem(this.getStorageKey('users'), JSON.stringify(users))

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        data: newUser,
        message: "User created successfully"
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create user"
      }
    }
  }

  getUsers(): User[] {
    try {
      const users = mockStorage.getItem(this.getStorageKey('users'))
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }

  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const users = this.getUsers()
      const user = users.find(u => u.email === email)
      
      if (!user) {
        return {
          success: false,
          error: "User not found"
        }
      }

      return {
        success: true,
        data: user
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch user"
      }
    }
  }

  async authenticateUser(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const userResponse = await this.getUserByEmail(email)
      
      if (!userResponse.success || !userResponse.data) {
        return {
          success: false,
          error: "Invalid email or password"
        }
      }

      // In a real app, we'd hash and compare passwords
      // For mock purposes, any password works if user exists
      return {
        success: true,
        data: userResponse.data,
        message: "Authentication successful"
      }
    } catch (error) {
      return {
        success: false,
        error: "Authentication failed"
      }
    }
  }

  // Products management
  async createProduct(merchantId: string, productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>): Promise<ApiResponse<Product>> {
    try {
      const products = this.getProducts(merchantId)
      
      const newProduct: Product = {
        ...productData,
        id: this.generateId(),
        merchantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      products.push(newProduct)
      mockStorage.setItem(this.getStorageKey(`products_${merchantId}`), JSON.stringify(products))

      return { success: true, data: newProduct, message: "Product created successfully" }
    } catch (error) {
      return { success: false, error: "Failed to create product" }
    }
  }

  getProducts(merchantId: string): Product[] {
    try {
      const products = mockStorage.getItem(this.getStorageKey(`products_${merchantId}`))
      return products ? JSON.parse(products) : []
    } catch {
      return []
    }
  }

  async updateProduct(merchantId: string, productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const products = this.getProducts(merchantId)
      const index = products.findIndex(p => p.id === productId)
      
      if (index === -1) {
        return { success: false, error: "Product not found" }
      }

      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      mockStorage.setItem(this.getStorageKey(`products_${merchantId}`), JSON.stringify(products))

      return { success: true, data: products[index], message: "Product updated successfully" }
    } catch (error) {
      return { success: false, error: "Failed to update product" }
    }
  }

  async deleteProduct(merchantId: string, productId: string): Promise<ApiResponse<void>> {
    try {
      const products = this.getProducts(merchantId)
      const index = products.findIndex(p => p.id === productId)
      
      if (index === -1) {
        return { success: false, error: "Product not found" }
      }

      products.splice(index, 1)
      mockStorage.setItem(this.getStorageKey(`products_${merchantId}`), JSON.stringify(products))

      return { success: true, message: "Product deleted successfully" }
    } catch (error) {
      return { success: false, error: "Failed to delete product" }
    }
  }

  // Transactions management
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<ApiResponse<Transaction>> {
    try {
      const transactions = this.getTransactions(transactionData.merchantId)
      
      const newTransaction: Transaction = {
        ...transactionData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
      }

      transactions.push(newTransaction)
      mockStorage.setItem(this.getStorageKey(`transactions_${transactionData.merchantId}`), JSON.stringify(transactions))

      return { success: true, data: newTransaction, message: "Transaction created successfully" }
    } catch (error) {
      return { success: false, error: "Failed to create transaction" }
    }
  }

  getTransactions(merchantId: string): Transaction[] {
    try {
      const transactions = mockStorage.getItem(this.getStorageKey(`transactions_${merchantId}`))
      return transactions ? JSON.parse(transactions) : []
    } catch {
      return []
    }
  }

  async updateTransaction(merchantId: string, transactionId: string, updates: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    try {
      const transactions = this.getTransactions(merchantId)
      const index = transactions.findIndex(t => t.id === transactionId)
      
      if (index === -1) {
        return { success: false, error: "Transaction not found" }
      }

      transactions[index] = {
        ...transactions[index],
        ...updates,
        completedAt: updates.paymentStatus === 'completed' ? new Date().toISOString() : transactions[index].completedAt
      }

      mockStorage.setItem(this.getStorageKey(`transactions_${merchantId}`), JSON.stringify(transactions))

      return { success: true, data: transactions[index], message: "Transaction updated successfully" }
    } catch (error) {
      return { success: false, error: "Failed to update transaction" }
    }
  }

  // Employees management
  async createEmployee(merchantId: string, employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>): Promise<ApiResponse<Employee>> {
    try {
      const employees = this.getEmployees(merchantId)
      
      // Check if email already exists
      const existingEmployee = employees.find(e => e.email === employeeData.email)
      if (existingEmployee) {
        return { success: false, error: "Email already registered" }
      }

      const newEmployee: Employee = {
        ...employeeData,
        id: this.generateId(),
        merchantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      employees.push(newEmployee)
      mockStorage.setItem(this.getStorageKey(`employees_${merchantId}`), JSON.stringify(employees))

      return { success: true, data: newEmployee, message: "Employee created successfully" }
    } catch (error) {
      return { success: false, error: "Failed to create employee" }
    }
  }

  getEmployees(merchantId: string): Employee[] {
    try {
      const employees = mockStorage.getItem(this.getStorageKey(`employees_${merchantId}`))
      return employees ? JSON.parse(employees) : []
    } catch {
      return []
    }
  }

  // Initialize default test employees for development/testing
  async initializeTestEmployees(merchantId: string): Promise<ApiResponse<Employee[]>> {
    try {
      const existingEmployees = this.getEmployees(merchantId)
      
      // Only add test employees if none exist
      if (existingEmployees.length === 0) {
        const testEmployees: Employee[] = [
          {
            id: 'emp_001',
            merchantId,
            firstName: 'Alex',
            lastName: 'Admin',
            email: 'alex.admin@test.com',
            pin: '0000',
            role: 'admin',
            status: 'active',
            hourlyRate: 35.00,
            permissions: {
              canProcessRefunds: true,
              canModifyProducts: true,
              canManageEmployees: true,
              canViewReports: true,
              canModifySettings: true,
              canAccessAdmin: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'emp_002',
            merchantId,
            firstName: 'John',
            lastName: 'Manager',
            email: 'john.manager@test.com',
            pin: '1234',
            role: 'manager',
            status: 'active',
            hourlyRate: 25.00,
            permissions: {
              canProcessRefunds: true,
              canModifyProducts: true,
              canManageEmployees: false,
              canViewReports: true,
              canModifySettings: false,
              canAccessAdmin: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'emp_003',
            merchantId,
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@test.com',
            pin: '5678',
            role: 'employee',
            status: 'active',
            hourlyRate: 18.00,
            permissions: {
              canProcessRefunds: false,
              canModifyProducts: false,
              canManageEmployees: false,
              canViewReports: false,
              canModifySettings: false,
              canAccessAdmin: false
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'emp_004',
            merchantId,
            firstName: 'Mike',
            lastName: 'Smith',
            email: 'mike.smith@test.com',
            pin: '9999',
            role: 'employee',
            status: 'active',
            hourlyRate: 16.00,
            permissions: {
              canProcessRefunds: false,
              canModifyProducts: false,
              canManageEmployees: false,
              canViewReports: false,
              canModifySettings: false,
              canAccessAdmin: false
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        // Save to database storage
        mockStorage.setItem(this.getStorageKey(`employees_${merchantId}`), JSON.stringify(testEmployees))
        
        return { success: true, data: testEmployees, message: "Test employees initialized successfully" }
      }
      
      return { success: true, data: existingEmployees, message: "Employees already exist" }
    } catch (error) {
      return { success: false, error: "Failed to initialize test employees" }
    }
  }

  async authenticateEmployee(merchantId: string, pin: string): Promise<ApiResponse<Employee>> {
    try {
      const employees = this.getEmployees(merchantId)
      const employee = employees.find(e => e.pin === pin && e.status === 'active')
      
      if (!employee) {
        return { success: false, error: "Invalid PIN or inactive employee" }
      }

      return { success: true, data: employee, message: "Employee authenticated successfully" }
    } catch (error) {
      return { success: false, error: "Authentication failed" }
    }
  }

  // Cart sessions management
  async saveCartSession(sessionData: Omit<CartSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CartSession>> {
    try {
      const sessions = this.getCartSessions(sessionData.merchantId)
      
      // Remove existing session for same employee
      const filteredSessions = sessions.filter(s => s.employeeId !== sessionData.employeeId)
      
      const newSession: CartSession = {
        ...sessionData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      filteredSessions.push(newSession)
      mockStorage.setItem(this.getStorageKey(`cart_sessions_${sessionData.merchantId}`), JSON.stringify(filteredSessions))

      return { success: true, data: newSession, message: "Cart session saved successfully" }
    } catch (error) {
      return { success: false, error: "Failed to save cart session" }
    }
  }

  getCartSessions(merchantId: string): CartSession[] {
    try {
      const sessions = mockStorage.getItem(this.getStorageKey(`cart_sessions_${merchantId}`))
      return sessions ? JSON.parse(sessions) : []
    } catch {
      return []
    }
  }

  async getCartSession(merchantId: string, employeeId: string): Promise<ApiResponse<CartSession>> {
    try {
      const sessions = this.getCartSessions(merchantId)
      const session = sessions.find(s => s.employeeId === employeeId)
      
      if (!session) {
        return { success: false, error: "Cart session not found" }
      }

      return { success: true, data: session }
    } catch (error) {
      return { success: false, error: "Failed to get cart session" }
    }
  }

  async clearCartSession(merchantId: string, employeeId: string): Promise<ApiResponse<void>> {
    try {
      const sessions = this.getCartSessions(merchantId)
      const filteredSessions = sessions.filter(s => s.employeeId !== employeeId)
      
      mockStorage.setItem(this.getStorageKey(`cart_sessions_${merchantId}`), JSON.stringify(filteredSessions))

      return { success: true, message: "Cart session cleared successfully" }
    } catch (error) {
      return { success: false, error: "Failed to clear cart session" }
    }
  }

  // Analytics/Stats (mock data)
  getBusinessStats() {
    return {
      todaysSales: 1234.56,
      transactions: 45,
      products: 127,
      employees: 3
    }
  }

  // Enhanced Analytics/Stats with real data
  getEnhancedBusinessStats(merchantId: string) {
    const transactions = this.getTransactions(merchantId)
    const products = this.getProducts(merchantId)
    const employees = this.getEmployees(merchantId)
    
    const today = new Date().toDateString()
    const todaysTransactions = transactions.filter(t => 
      new Date(t.createdAt).toDateString() === today && t.paymentStatus === 'completed'
    )
    
    const todaysSales = todaysTransactions.reduce((sum, t) => sum + t.total, 0)
    
    // Get business setup data
    const businessSetup = this.getBusinessSetup(merchantId)
    
    return {
      todaysSales,
      transactions: todaysTransactions.length,
      products: products.length,
      employees: employees.filter(e => e.status === 'active').length,
      totalTransactions: transactions.length,
      totalRevenue: transactions.filter(t => t.paymentStatus === 'completed').reduce((sum, t) => sum + t.total, 0),
      businessSetup
    }
  }

  // Business setup management
  updateBusinessSetup(merchantId: string, setupData: any): any {
    try {
      const currentStats = this.getEnhancedBusinessStats(merchantId)
      
      // Store business setup data
      mockStorage.setItem(this.getStorageKey(`business_setup_${merchantId}`), JSON.stringify(setupData))
      
      // Return updated stats including the business setup
      return {
        ...currentStats,
        businessSetup: setupData
      }
    } catch (error) {
      throw new Error('Failed to update business setup')
    }
  }

  getBusinessSetup(merchantId: string): any {
    try {
      const setup = mockStorage.getItem(this.getStorageKey(`business_setup_${merchantId}`))
      return setup ? JSON.parse(setup) : null
    } catch {
      return null
    }
  }

  // Tax settings management
  async updateTaxSettings(merchantId: string, taxConfig: any): Promise<ApiResponse<any>> {
    try {
      // Store tax configuration
      mockStorage.setItem(this.getStorageKey(`tax_settings_${merchantId}`), JSON.stringify(taxConfig))
      
      return { 
        success: true, 
        data: taxConfig, 
        message: "Tax settings updated successfully" 
      }
    } catch (error) {
      return { 
        success: false, 
        error: "Failed to update tax settings" 
      }
    }
  }

  getTaxSettings(merchantId: string): any {
    try {
      const settings = mockStorage.getItem(this.getStorageKey(`tax_settings_${merchantId}`))
      if (settings) {
        return JSON.parse(settings)
      }
      
      // Return Argentina preset as default for our target market
      return {
        enabled: true,
        defaultRate: 0.21, // 21% IVA
        taxType: 'IVA',
        country: 'Argentina',
        includeTaxInPrice: true,
        roundingMethod: 'round',
        taxName: 'IVA',
      }
    } catch {
      // Return default disabled state if error
      return {
        enabled: false,
        defaultRate: 0.10,
        taxType: 'VAT',
        country: 'Generic',
        includeTaxInPrice: false,
        roundingMethod: 'round',
        taxName: 'Tax',
      }
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    mockStorage.clear()
    console.log('All mock data cleared')
  }

  // Export data (for debugging)
  exportData() {
    const users = this.getUsers()
    const allData: any = { users, timestamp: new Date().toISOString() }
    
    // Get all merchant data
    users.forEach(user => {
      if (user.role === 'admin') {
        const merchantId = user.id
        allData[`merchant_${merchantId}`] = {
          products: this.getProducts(merchantId),
          transactions: this.getTransactions(merchantId),
          employees: this.getEmployees(merchantId),
          cartSessions: this.getCartSessions(merchantId),
          stats: this.getEnhancedBusinessStats(merchantId)
        }
      }
    })
    
    return allData
  }
}

// Singleton instance
export const mockAPI = new MockAPI()

// Helper to check if we should use mock API
export function useMockAPI(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
} 