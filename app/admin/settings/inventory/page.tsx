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
  Package, 
  AlertTriangle, 
  Bell, 
  Settings, 
  RefreshCw, 
  Save,
  BarChart3,
  Zap,
  CheckCircle
} from "lucide-react"

export default function InventorySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Inventory Settings State
  const [inventorySettings, setInventorySettings] = useState({
    // Stock Alert Settings
    lowStockAlert: "5",
    criticalStockAlert: "2",
    outOfStockAlert: true,
    stockAlertEmail: "",
    stockAlertFrequency: "immediate", // immediate, daily, weekly
    
    // Product Management
    autoUpdateInventory: true,
    trackProductVariants: false,
    enableBarcodeScanning: false,
    allowNegativeStock: false,
    requireProductImages: false,
    
    // Display Settings
    showStockLevelsInPOS: true,
    hideOutOfStockItems: false,
    showLowStockWarnings: true,
    stockDisplayThreshold: "10",
    
    // Inventory Tracking
    trackExpirationDates: false,
    trackSuppliers: false,
    trackPurchaseCost: false,
    enableStockMovementLog: true,
    
    // Automation Settings
    autoReorderEnabled: false,
    autoReorderPoint: "10",
    autoReorderQuantity: "50",
    preferredSupplierEmail: "",
    
    // Categories & Organization
    enableProductCategories: true,
    enableProductTags: false,
    enableProductNotes: true,
    sortProductsBy: "name", // name, price, stock, category
    
    // Performance Settings
    inventoryUpdateFrequency: "realtime", // realtime, hourly, daily
    enableInventoryCache: true,
    maxProductsPerPage: "50"
  })

  const [currentStockLevels, setCurrentStockLevels] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    criticalStockItems: 0
  })

  useEffect(() => {
    const loadInventorySettings = async () => {
      try {
        setIsInitialLoading(true)
        
        // Load inventory settings
        const [settingsResponse, stockResponse] = await Promise.all([
          fetch('/api/inventory-settings'),
          fetch('/api/inventory/stock-levels')
        ])
        
        const settingsData = await settingsResponse.json()
        const stockData = await stockResponse.json()
        
        if (settingsData.success && settingsData.data) {
          setInventorySettings(prev => ({
            ...prev,
            ...settingsData.data
          }))
        }
        
        if (stockData.success && stockData.data) {
          setCurrentStockLevels(stockData.data)
        }
        
      } catch (error) {
        console.error('Failed to load inventory settings:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadInventorySettings()
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setInventorySettings(prev => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/inventory-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventorySettings)
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save inventory settings')
      }
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      
    } catch (error) {
      console.error('Failed to save inventory settings:', error)
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const alertFrequencyOptions = [
    { value: "immediate", label: "Immediate" },
    { value: "daily", label: "Daily Summary" },
    { value: "weekly", label: "Weekly Summary" }
  ]

  const sortOptions = [
    { value: "name", label: "Product Name" },
    { value: "price", label: "Price" },
    { value: "stock", label: "Stock Level" },
    { value: "category", label: "Category" }
  ]

  const updateFrequencyOptions = [
    { value: "realtime", label: "Real-time" },
    { value: "hourly", label: "Every Hour" },
    { value: "daily", label: "Daily" }
  ]

  const pageOptions = [
    { value: "25", label: "25 products" },
    { value: "50", label: "50 products" },
    { value: "100", label: "100 products" },
    { value: "200", label: "200 products" }
  ]

  if (isInitialLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory settings...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventory & Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage stock alerts, product settings, and inventory tracking preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
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
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Stock Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Current Stock Overview</span>
            </CardTitle>
            <CardDescription>Current inventory status across all products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentStockLevels.totalProducts}</div>
                <div className="text-sm text-blue-800">Total Products</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{currentStockLevels.lowStockItems}</div>
                <div className="text-sm text-yellow-800">Low Stock</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{currentStockLevels.criticalStockItems}</div>
                <div className="text-sm text-red-800">Critical Stock</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{currentStockLevels.outOfStockItems}</div>
                <div className="text-sm text-gray-800">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Stock Alert Settings</span>
            </CardTitle>
            <CardDescription>Configure when and how you receive inventory alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lowStockAlert">Low Stock Alert (quantity)</Label>
                <Input
                  id="lowStockAlert"
                  type="number"
                  min="1"
                  max="100"
                  value={inventorySettings.lowStockAlert}
                  onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Alert when stock reaches this level</p>
              </div>
              
              <div>
                <Label htmlFor="criticalStockAlert">Critical Stock Alert (quantity)</Label>
                <Input
                  id="criticalStockAlert"
                  type="number"
                  min="0"
                  max="50"
                  value={inventorySettings.criticalStockAlert}
                  onChange={(e) => handleInputChange('criticalStockAlert', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Urgent alert when stock is critically low</p>
              </div>
              
              <div>
                <Label htmlFor="stockDisplayThreshold">Show Stock Count When Below</Label>
                <Input
                  id="stockDisplayThreshold"
                  type="number"
                  min="0"
                  max="50"
                  value={inventorySettings.stockDisplayThreshold}
                  onChange={(e) => handleInputChange('stockDisplayThreshold', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Display stock numbers in POS when below this level</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockAlertEmail">Stock Alert Email</Label>
                <Input
                  id="stockAlertEmail"
                  type="email"
                  value={inventorySettings.stockAlertEmail}
                  onChange={(e) => handleInputChange('stockAlertEmail', e.target.value)}
                  className="mt-1"
                  placeholder="alerts@yourbusiness.com"
                />
              </div>
              
              <div>
                <Label htmlFor="stockAlertFrequency">Alert Frequency</Label>
                <Select 
                  value={inventorySettings.stockAlertFrequency} 
                  onValueChange={(value) => handleInputChange('stockAlertFrequency', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {alertFrequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="outOfStockAlert"
                checked={inventorySettings.outOfStockAlert}
                onCheckedChange={(checked) => handleInputChange('outOfStockAlert', checked)}
              />
              <div>
                <Label htmlFor="outOfStockAlert" className="font-medium">
                  Out of Stock Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send immediate alerts when products go out of stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Product Management</span>
            </CardTitle>
            <CardDescription>Configure how products are managed and displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="autoUpdateInventory"
                  checked={inventorySettings.autoUpdateInventory}
                  onCheckedChange={(checked) => handleInputChange('autoUpdateInventory', checked)}
                />
                <div>
                  <Label htmlFor="autoUpdateInventory" className="font-medium">
                    Auto-Update Inventory
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically decrease stock when items are sold
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="showStockLevelsInPOS"
                  checked={inventorySettings.showStockLevelsInPOS}
                  onCheckedChange={(checked) => handleInputChange('showStockLevelsInPOS', checked)}
                />
                <div>
                  <Label htmlFor="showStockLevelsInPOS" className="font-medium">
                    Show Stock in POS
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display stock levels in the point of sale interface
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="hideOutOfStockItems"
                  checked={inventorySettings.hideOutOfStockItems}
                  onCheckedChange={(checked) => handleInputChange('hideOutOfStockItems', checked)}
                />
                <div>
                  <Label htmlFor="hideOutOfStockItems" className="font-medium">
                    Hide Out of Stock Items
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hide products with zero stock from POS display
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="showLowStockWarnings"
                  checked={inventorySettings.showLowStockWarnings}
                  onCheckedChange={(checked) => handleInputChange('showLowStockWarnings', checked)}
                />
                <div>
                  <Label htmlFor="showLowStockWarnings" className="font-medium">
                    Show Low Stock Warnings
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display visual warnings for low stock items in POS
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="allowNegativeStock"
                  checked={inventorySettings.allowNegativeStock}
                  onCheckedChange={(checked) => handleInputChange('allowNegativeStock', checked)}
                />
                <div>
                  <Label htmlFor="allowNegativeStock" className="font-medium">
                    Allow Negative Stock
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow selling items even when stock reaches zero
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="enableProductCategories"
                  checked={inventorySettings.enableProductCategories}
                  onCheckedChange={(checked) => handleInputChange('enableProductCategories', checked)}
                />
                <div>
                  <Label htmlFor="enableProductCategories" className="font-medium">
                    Product Categories
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable categorization of products for better organization
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortProductsBy">Default Product Sort</Label>
                <Select 
                  value={inventorySettings.sortProductsBy} 
                  onValueChange={(value) => handleInputChange('sortProductsBy', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxProductsPerPage">Products Per Page</Label>
                <Select 
                  value={inventorySettings.maxProductsPerPage} 
                  onValueChange={(value) => handleInputChange('maxProductsPerPage', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Advanced Features</span>
            </CardTitle>
            <CardDescription>Advanced inventory tracking and automation features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="trackProductVariants"
                  checked={inventorySettings.trackProductVariants}
                  onCheckedChange={(checked) => handleInputChange('trackProductVariants', checked)}
                />
                <div>
                  <Label htmlFor="trackProductVariants" className="font-medium">
                    Product Variants
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track sizes, colors, and other product variations
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="trackExpirationDates"
                  checked={inventorySettings.trackExpirationDates}
                  onCheckedChange={(checked) => handleInputChange('trackExpirationDates', checked)}
                />
                <div>
                  <Label htmlFor="trackExpirationDates" className="font-medium">
                    Expiration Dates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track expiration dates for perishable products
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="trackSuppliers"
                  checked={inventorySettings.trackSuppliers}
                  onCheckedChange={(checked) => handleInputChange('trackSuppliers', checked)}
                />
                <div>
                  <Label htmlFor="trackSuppliers" className="font-medium">
                    Supplier Information
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track supplier details for each product
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="enableStockMovementLog"
                  checked={inventorySettings.enableStockMovementLog}
                  onCheckedChange={(checked) => handleInputChange('enableStockMovementLog', checked)}
                />
                <div>
                  <Label htmlFor="enableStockMovementLog" className="font-medium">
                    Stock Movement Log
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Log all inventory changes for audit purposes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="inventoryUpdateFrequency">Inventory Update Frequency</Label>
              <Select 
                value={inventorySettings.inventoryUpdateFrequency} 
                onValueChange={(value) => handleInputChange('inventoryUpdateFrequency', value)}
              >
                <SelectTrigger className="mt-1 w-48">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {updateFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How often inventory levels are synchronized across all systems
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Inventory Management</h3>
                <p className="text-sm text-blue-800 mt-1">
                  These settings control how your inventory is tracked and managed. 
                  Low stock alerts help you maintain adequate stock levels, while automation features 
                  can streamline your inventory management process. Adjust these settings based on your business needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 