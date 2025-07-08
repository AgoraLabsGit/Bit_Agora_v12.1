import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Delete } from "lucide-react"

interface PinPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  label?: string
  placeholder?: string
  maxLength?: number
  className?: string
  disabled?: boolean
}

export function PinPad({
  value,
  onChange,
  onSubmit,
  label = "Enter PIN",
  placeholder = "Enter 4-digit PIN",
  maxLength = 4,
  className = "",
  disabled = false
}: PinPadProps) {
  const addDigit = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit)
    }
  }

  const removeDigit = () => {
    onChange(value.slice(0, -1))
  }

  const clearPin = () => {
    onChange("")
  }

  const handleSubmit = () => {
    if (onSubmit && value.length === maxLength) {
      onSubmit()
    }
  }

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* PIN Display */}
      <div>
        <Label className="text-sm sm:text-base font-medium mb-2 block">{label}</Label>
        <Input
          type="password"
          value={value}
          readOnly
          placeholder={placeholder}
          className="h-16 sm:h-20 text-center text-2xl sm:text-3xl tracking-widest bg-background border border-input rounded-md touch-manipulation"
          disabled={disabled}
        />
      </div>

      {/* PIN Pad */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <Button
            key={digit}
            onClick={() => addDigit(digit.toString())}
            className="h-16 sm:h-20 text-2xl sm:text-3xl font-semibold bg-background border border-input hover:bg-accent touch-manipulation active:scale-95 transition-transform"
            type="button"
            disabled={disabled}
          >
            {digit}
          </Button>
        ))}
        
        {/* Clear Button */}
        <Button
          onClick={clearPin}
          className="h-16 sm:h-20 text-base sm:text-lg font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-manipulation active:scale-95 transition-transform"
          type="button"
          disabled={disabled}
        >
          Clear
        </Button>
        
        {/* Zero Button */}
        <Button
          onClick={() => addDigit("0")}
          className="h-16 sm:h-20 text-2xl sm:text-3xl font-semibold bg-background border border-input hover:bg-accent touch-manipulation active:scale-95 transition-transform"
          type="button"
          disabled={disabled}
        >
          0
        </Button>
        
        {/* Backspace Button */}
        <Button
          onClick={removeDigit}
          className="h-16 sm:h-20 text-base sm:text-lg font-semibold bg-background border border-input hover:bg-accent touch-manipulation active:scale-95 transition-transform"
          type="button"
          disabled={disabled}
        >
          <Delete className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      </div>

      {/* Submit Button (optional) */}
      {onSubmit && (
        <Button 
          onClick={handleSubmit}
          className={`w-full h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform ${
            value.length === maxLength 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          disabled={value.length !== maxLength || disabled}
        >
          Submit
        </Button>
      )}
    </div>
  )
} 