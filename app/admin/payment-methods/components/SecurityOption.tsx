// BitAgora Security Option Component
// Individual security setting with checkbox and description

import React from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface SecurityOptionProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function SecurityOption({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false
}: SecurityOptionProps) {
  return (
    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div>
        <Label htmlFor={id} className="font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
} 