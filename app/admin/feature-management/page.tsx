// BitAgora Admin - Feature Management Page

import { Suspense } from 'react'
import FeatureManagement from '@/components/admin/FeatureManagement'

export default function FeatureManagementPage() {
  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Loading...</p></div></div>}>
        <FeatureManagement />
      </Suspense>
    </div>
  )
} 