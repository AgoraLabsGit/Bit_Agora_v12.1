// BitAgora Save Controls Component
// Save button with loading states and error handling

import React from 'react'
import { Button } from "@/components/ui/button"
import { Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

interface SaveControlsProps {
  onSave: () => void
  loading: boolean
  saved: boolean
  error?: string
  disabled?: boolean
  className?: string
}

export function SaveControls({
  onSave,
  loading,
  saved,
  error,
  disabled = false,
  className = ''
}: SaveControlsProps) {
  return (
    <div className={className}>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSave} 
          disabled={loading || disabled}
          className="min-w-[140px]"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Save Failed</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 