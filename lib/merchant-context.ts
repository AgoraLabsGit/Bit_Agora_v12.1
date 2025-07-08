// BitAgora Merchant Context Helper
// Multi-tenant architecture support

// For now, using a default merchant ID
// In production, this would be retrieved from authentication context
export const getCurrentMerchantId = (): string => {
  // TODO: Replace with actual merchant ID from auth context
  return 'default-merchant'
}

// Helper to add merchant context to API headers
export const addMerchantHeaders = (headers: HeadersInit = {}): HeadersInit => {
  return {
    ...headers,
    'X-Merchant-ID': getCurrentMerchantId()
  }
} 