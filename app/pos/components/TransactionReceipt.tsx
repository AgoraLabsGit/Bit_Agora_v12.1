"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Receipt, 
  Download, 
  Mail, 
  Printer, 
  Share,
  Calendar,
  Clock,
  CreditCard,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CartItem } from '../types/product'
import { TaxCalculationResult, TaxConfiguration } from '@/lib/tax-calculation'

interface TransactionReceiptProps {
  transactionId: string
  items: CartItem[]
  total: number
  paymentMethod: string
  paymentStatus: string
  completedAt: Date
  taxCalculation?: TaxCalculationResult
  taxConfig?: TaxConfiguration
  employeeId?: string
  businessName?: string
  onClose?: () => void
  onNewTransaction?: () => void
  className?: string
}

export const TransactionReceipt = ({
  transactionId,
  items,
  total,
  paymentMethod,
  paymentStatus,
  completedAt,
  taxCalculation,
  taxConfig,
  employeeId = 'emp-001',
  businessName = 'BitAgora POS',
  onClose,
  onNewTransaction,
  className
}: TransactionReceiptProps) => {
  const [isSharing, setIsSharing] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  // Format date and time
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'lightning':
        return 'Bitcoin Lightning'
      case 'bitcoin':
        return 'Bitcoin'
      case 'usdt':
        return 'USDT'
      case 'cash':
        return 'Cash'
      case 'stripe':
        return 'Credit Card'
      default:
        return method.charAt(0).toUpperCase() + method.slice(1)
    }
  }

  // Handle receipt actions
  const handlePrint = () => {
    setIsPrinting(true)
    // Simulate printing
    setTimeout(() => {
      setIsPrinting(false)
      console.log('Receipt printed')
    }, 2000)
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      // Simulate sharing
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Receipt shared')
    } catch (error) {
      console.error('Error sharing receipt:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = () => {
    console.log('Receipt downloaded')
  }

  const handleEmail = () => {
    console.log('Receipt emailed')
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-green-700">
          Payment Successful!
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your transaction has been completed
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Business Information */}
        <div className="text-center">
          <h3 className="font-semibold text-lg">{businessName}</h3>
          <p className="text-sm text-muted-foreground">
            Transaction Receipt
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Transaction ID</span>
            </div>
            <span className="text-sm font-mono">{transactionId}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date</span>
            </div>
            <span className="text-sm">{formatDate(completedAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Payment Method</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatPaymentMethod(paymentMethod)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Processed by</span>
            </div>
            <span className="text-sm">{employeeId}</span>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="font-medium mb-3">Items ({items.length})</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal</span>
            <span className="text-sm">
              {formatCurrency(taxCalculation?.subtotal || total)}
            </span>
          </div>

          {taxCalculation && taxConfig?.showTaxLine && taxCalculation.totalTax > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {taxCalculation.breakdown.primaryTaxName} ({(taxCalculation.taxRate * 100).toFixed(1)}%)
                </span>
                <span className="text-sm">
                  {formatCurrency(taxCalculation.primaryTax)}
                </span>
              </div>
              
              {taxCalculation.secondaryTax > 0 && taxCalculation.breakdown.secondaryTaxName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {taxCalculation.breakdown.secondaryTaxName} ({(taxCalculation.secondaryTaxRate * 100).toFixed(1)}%)
                  </span>
                  <span className="text-sm">
                    {formatCurrency(taxCalculation.secondaryTax)}
                  </span>
                </div>
              )}
            </>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">
            Payment {paymentStatus}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2"
          >
                          <Printer className="h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmail}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4">
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          )}
          
          {onNewTransaction && (
            <Button
              onClick={onNewTransaction}
              className="flex-1"
            >
              New Transaction
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Thank you for your business!</p>
          <p>Powered by BitAgora POS</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact receipt for display in lists
export const CompactReceipt = ({
  transactionId,
  total,
  paymentMethod,
  completedAt,
  className
}: {
  transactionId: string
  total: number
  paymentMethod: string
  completedAt: Date
  className?: string
}) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">{formatCurrency(total)}</div>
              <div className="text-xs text-muted-foreground">
                {transactionId}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{paymentMethod}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(completedAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 