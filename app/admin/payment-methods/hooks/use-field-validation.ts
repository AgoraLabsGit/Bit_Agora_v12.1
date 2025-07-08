// BitAgora Field Validation Hook
// Real-time validation with debouncing for better performance

import { useState, useEffect, useCallback } from 'react'
import { validateCryptoAddress, ValidationResult } from '@/lib/crypto-validation'

export interface FieldValidationState {
  isValid: boolean
  isValidating: boolean
  error?: string
  warning?: string
  success?: string
  details?: any
}

export interface FieldValidationOptions {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  cryptoType?: string
  customValidator?: (value: string) => Promise<ValidationResult> | ValidationResult
  debounceMs?: number
}

export function useFieldValidation(
  value: string,
  options: FieldValidationOptions = {}
) {
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    cryptoType,
    customValidator,
    debounceMs = 500
  } = options

  const [validationState, setValidationState] = useState<FieldValidationState>({
    isValid: true,
    isValidating: false
  })

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const validateField = useCallback(async (inputValue: string): Promise<FieldValidationState> => {
    // Empty value validation
    if (!inputValue.trim()) {
      if (required) {
        return {
          isValid: false,
          isValidating: false,
          error: 'This field is required'
        }
      }
      return {
        isValid: true,
        isValidating: false
      }
    }

    // Length validation
    if (minLength && inputValue.length < minLength) {
      return {
        isValid: false,
        isValidating: false,
        error: `Must be at least ${minLength} characters`
      }
    }

    if (maxLength && inputValue.length > maxLength) {
      return {
        isValid: false,
        isValidating: false,
        error: `Must be no more than ${maxLength} characters`
      }
    }

    // Pattern validation
    if (pattern && !pattern.test(inputValue)) {
      return {
        isValid: false,
        isValidating: false,
        error: 'Invalid format'
      }
    }

    // Crypto address validation
    if (cryptoType) {
      try {
        const result = validateCryptoAddress(inputValue, cryptoType)
        
        if (!result.isValid) {
          return {
            isValid: false,
            isValidating: false,
            error: result.error || 'Invalid address format'
          }
        }

        return {
          isValid: true,
          isValidating: false,
          success: `Valid ${result.addressType}`,
          details: result.details
        }
      } catch (error) {
        return {
          isValid: false,
          isValidating: false,
          error: 'Validation error occurred'
        }
      }
    }

    // Custom validator
    if (customValidator) {
      try {
        const result = await customValidator(inputValue)
        
        if (!result.isValid) {
          return {
            isValid: false,
            isValidating: false,
            error: result.error || 'Validation failed'
          }
        }

        return {
          isValid: true,
          isValidating: false,
          success: 'Valid input',
          details: result.details
        }
      } catch (error) {
        return {
          isValid: false,
          isValidating: false,
          error: 'Validation error occurred'
        }
      }
    }

    // Default: valid if no specific validations failed
    return {
      isValid: true,
      isValidating: false
    }
  }, [required, minLength, maxLength, pattern, cryptoType, customValidator])

  // Debounced validation effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set validating state immediately for responsive UI
    if (value.trim()) {
      setValidationState(prev => ({
        ...prev,
        isValidating: true
      }))
    }

    // Set new timer for validation
    const timer = setTimeout(async () => {
      const result = await validateField(value)
      setValidationState(result)
    }, debounceMs)

    setDebounceTimer(timer)

    // Cleanup timer on unmount or value change
    return () => {
      clearTimeout(timer)
    }
  }, [value, validateField, debounceMs])

  // Immediate validation for required field when empty
  useEffect(() => {
    if (!value.trim() && required) {
      setValidationState({
        isValid: false,
        isValidating: false,
        error: 'This field is required'
      })
    } else if (!value.trim()) {
      setValidationState({
        isValid: true,
        isValidating: false
      })
    }
  }, [value, required])

  return validationState
} 