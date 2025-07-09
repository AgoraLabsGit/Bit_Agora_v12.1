// BitAgora Admin - Feature Management (Deprecated)
// This page redirects to payment-methods as feature management has been removed

import { redirect } from 'next/navigation'

export default function FeatureManagementPage() {
  redirect('/admin/payment-methods')
} 