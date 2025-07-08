// BitAgora Validated Input Component
// Input field with real-time validation feedback

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertTriangle, Loader2, Info } from 'lucide-react'
import { useFieldValidation, FieldValidationOptions } from '../hooks/use-field-validation'

interface ValidatedInputProps {
  // Input props
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  disabled?: boolean
  
  // Label props
  label: string
  description?: string
  
  // Validation props
  validationOptions?: FieldValidationOptions
  
  // Visual props
  showValidationIcon?: boolean
  showValidationMessage?: boolean
}

export function ValidatedInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  disabled = false,
  label,
  description,
  validationOptions = {},
  showValidationIcon = true,
  showValidationMessage = true
}: ValidatedInputProps) {
  
  const validation = useFieldValidation(value, validationOptions)
  
  // Determine input styling based on validation state
  const getInputClassName = () => {
    let baseClass = "mt-1 pr-10"
    
    if (disabled) {
      return `${baseClass} ${className}`
    }
    
    if (value.trim() && !validation.isValidating) {
      if (validation.isValid) {
        baseClass += " border-green-500 focus:border-green-500 focus:ring-green-500"
      } else {
        baseClass += " border-red-500 focus:border-red-500 focus:ring-red-500"
      }
    }
    
    return `${baseClass} ${className}`
  }
  
  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcon || !value.trim()) return null
    
    if (validation.isValidating) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
    
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }
  
  // Get validation message
  const getValidationMessage = () => {
    if (!showValidationMessage || !value.trim()) return null
    
    if (validation.isValidating) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          <p className="text-xs text-blue-600">Validating...</p>
        </div>
      )
    }
    
    if (validation.error) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <p className="text-xs text-red-600">{validation.error}</p>
        </div>
      )
    }
    
    if (validation.success) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <p className="text-xs text-green-600">{validation.success}</p>
        </div>
      )
    }
    
    if (validation.warning) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <Info className="h-3 w-3 text-yellow-500" />
          <p className="text-xs text-yellow-600">{validation.warning}</p>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div>
      <Label htmlFor={id} className="font-medium">
        {label}
        {validationOptions.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={getInputClassName()}
          disabled={disabled}
        />
        
        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      
      {/* Validation Message */}
      {getValidationMessage()}
      
      {/* Additional Details */}
      {validation.details && validation.isValid && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="text-xs text-green-800 dark:text-green-200">
            <strong>Detected:</strong> {validation.details.currency} ({validation.details.symbol})
            {validation.details.network && (
              <span className="ml-2">
                <strong>Network:</strong> {validation.details.network}
              </span>
            )}
            {validation.details.addressFormat && (
              <span className="ml-2">
                <strong>Format:</strong> {validation.details.addressFormat}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 