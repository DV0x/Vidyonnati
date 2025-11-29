"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  maxLength?: number
  showCount?: boolean
}

export function AnimatedTextarea({
  label,
  className,
  value,
  onChange,
  maxLength,
  showCount = true,
  ...props
}: AnimatedTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(!!value && String(value).length > 0)
  }, [value])

  const currentLength = value ? String(value).length : 0

  return (
    <div className="relative">
      <Textarea
        {...props}
        className={cn(
          "pt-7 min-h-[120px] resize-none",
          className
        )}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=" "
        maxLength={maxLength}
      />
      <Label
        className={cn(
          "absolute left-3 top-5 text-gray-500 transition-all duration-200 pointer-events-none",
          (isFocused || hasValue) && "text-xs text-primary -translate-y-3",
        )}
      >
        {label}
      </Label>
      {showCount && maxLength && (
        <span
          className={cn(
            "absolute bottom-2 right-3 text-xs transition-colors",
            currentLength >= maxLength * 0.9
              ? "text-red-500"
              : currentLength >= maxLength * 0.7
              ? "text-orange-500"
              : "text-gray-400"
          )}
        >
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  )
}
