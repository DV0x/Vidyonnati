"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function AnimatedInput({ label, className, value, onChange, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pt-6", className)}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=" "
      />
      <Label
        className={cn(
          "absolute left-3 top-5 text-gray-500 transition-all duration-200 pointer-events-none",
          (isFocused || hasValue) && "text-xs text-primary -translate-y-4",
        )}
      >
        {label}
      </Label>
    </div>
  )
}

