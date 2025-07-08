// BitAgora Skeleton Loader Components
// Smooth loading animations that match our component structure

import React from 'react'

// Base skeleton animation
const SkeletonBase = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
)

// Payment Method Card Skeleton
export function PaymentMethodCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <SkeletonBase className="h-5 w-5" />
          <SkeletonBase className="h-6 w-32" />
        </div>
        <SkeletonBase className="h-4 w-48" />
      </div>
      
      {/* Content */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex-1">
            <SkeletonBase className="h-5 w-40 mb-2" />
            <SkeletonBase className="h-4 w-64" />
          </div>
          <SkeletonBase className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

// Cryptocurrency Option Skeleton
export function CryptocurrencyOptionSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <SkeletonBase className="h-5 w-32 mb-2" />
          <SkeletonBase className="h-4 w-48" />
        </div>
        <SkeletonBase className="h-4 w-4" />
      </div>
      
      {/* Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SkeletonBase className="h-4 w-24 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-56" />
        </div>
        <div>
          <SkeletonBase className="h-4 w-20 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-44" />
        </div>
      </div>
    </div>
  )
}

// QR Provider Skeleton
export function QRProviderSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-4 w-4" />
          <SkeletonBase className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-4 w-4" />
          <SkeletonBase className="h-8 w-8" />
        </div>
      </div>
      
      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SkeletonBase className="h-4 w-32 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-48" />
        </div>
        <div>
          <SkeletonBase className="h-4 w-28 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-40" />
        </div>
        <div>
          <SkeletonBase className="h-4 w-24 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-52" />
        </div>
        <div>
          <SkeletonBase className="h-4 w-20 mb-2" />
          <SkeletonBase className="h-10 w-full mb-1" />
          <SkeletonBase className="h-3 w-36" />
        </div>
      </div>
    </div>
  )
}

// Security Option Skeleton
export function SecurityOptionSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
      <SkeletonBase className="h-4 w-4" />
      <div className="flex-1">
        <SkeletonBase className="h-4 w-32 mb-2" />
        <SkeletonBase className="h-3 w-56" />
      </div>
    </div>
  )
}

// Complete Page Skeleton
export function PaymentMethodsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <SkeletonBase className="h-9 w-24" />
              <div className="flex items-center gap-2">
                <SkeletonBase className="h-6 w-6" />
                <SkeletonBase className="h-6 w-56" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SkeletonBase className="h-4 w-96" />
        </div>

        <div className="space-y-6">
          {/* Demo Mode Warning */}
          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 rounded-lg border">
            <div className="flex items-start gap-3">
              <SkeletonBase className="h-5 w-5" />
              <div className="flex-1">
                <SkeletonBase className="h-4 w-20 mb-2" />
                <SkeletonBase className="h-3 w-80" />
              </div>
            </div>
          </div>

          {/* Payment Method Cards */}
          <PaymentMethodCardSkeleton />
          <PaymentMethodCardSkeleton />

          {/* Cryptocurrency Section */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="h-5 w-5" />
                <SkeletonBase className="h-6 w-48" />
              </div>
              <SkeletonBase className="h-4 w-72" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <CryptocurrencyOptionSkeleton />
              <CryptocurrencyOptionSkeleton />
              <CryptocurrencyOptionSkeleton />
              <CryptocurrencyOptionSkeleton />
            </div>
          </div>

          {/* QR Providers Section */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="h-5 w-5" />
                <SkeletonBase className="h-6 w-52" />
              </div>
              <SkeletonBase className="h-4 w-80" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <QRProviderSkeleton />
              <QRProviderSkeleton />
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="h-5 w-5" />
                <SkeletonBase className="h-6 w-36" />
              </div>
              <SkeletonBase className="h-4 w-64" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <SecurityOptionSkeleton />
              <SecurityOptionSkeleton />
              <SecurityOptionSkeleton />
            </div>
          </div>

          {/* Save Controls */}
          <div className="flex justify-end">
            <SkeletonBase className="h-10 w-36" />
          </div>
        </div>
      </main>
    </div>
  )
} 