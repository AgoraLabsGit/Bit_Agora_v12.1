// BitAgora Security Settings Section Component
// Complete security settings section with individual security options

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from 'lucide-react'
import { SecurityOption } from './SecurityOption'

interface SecuritySettingsData {
  requireSignature: boolean
  requireId: boolean
  autoSettle: boolean
}

interface SecuritySettingsSectionProps {
  data: SecuritySettingsData
  onFieldChange: (field: keyof SecuritySettingsData, value: boolean) => void
}

export function SecuritySettingsSection({
  data,
  onFieldChange
}: SecuritySettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Settings
        </CardTitle>
        <CardDescription>Payment security and verification requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SecurityOption
          id="requireSignature"
          title="Require Signature"
          description="Require customer signature for payments over $25"
          checked={data.requireSignature}
          onCheckedChange={(checked) => onFieldChange('requireSignature', checked)}
        />
        
        <SecurityOption
          id="requireId"
          title="Require ID Verification"
          description="Check ID for credit card payments over $50"
          checked={data.requireId}
          onCheckedChange={(checked) => onFieldChange('requireId', checked)}
        />
        
        <SecurityOption
          id="autoSettle"
          title="Automatic Settlement"
          description="Automatically settle card payments at end of day"
          checked={data.autoSettle}
          onCheckedChange={(checked) => onFieldChange('autoSettle', checked)}
        />
      </CardContent>
    </Card>
  )
} 