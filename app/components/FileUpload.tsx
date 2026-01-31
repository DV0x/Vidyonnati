"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Upload, X, FileText, Image as ImageIcon, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // in MB
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
  description?: string
  required?: boolean
}

export function FileUpload({
  label,
  accept = "image/*,.pdf",
  maxSize = 5, // 5MB default
  value,
  onChange,
  error,
  description,
  required = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSize * 1024 * 1024

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const acceptedTypes = accept.split(",").map((t) => t.trim())
    const fileType = file.type
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExtension === type.toLowerCase()
      }
      if (type.endsWith("/*")) {
        return fileType.startsWith(type.replace("/*", "/"))
      }
      return fileType === type
    })

    if (!isAccepted) {
      return `Please upload a valid file type (${accept})`
    }

    return null
  }, [accept, maxSize, maxSizeBytes])

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setLocalError(null)

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    onChange(file)
  }, [onChange, validateFile])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    onChange(null)
    setPreview(null)
    setLocalError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [onChange])

  const displayError = error || localError

  const isImage = value instanceof File && value.type.startsWith("image/")
  const isPdf = value instanceof File && value.type === "application/pdf"

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : displayError
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-gray-100"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={cn(
                  "p-3 rounded-full transition-colors",
                  isDragging ? "bg-primary/10" : "bg-gray-200"
                )}
              >
                <Upload
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isDragging ? "text-primary" : "text-gray-500"
                  )}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? "Drop your file here" : "Click to upload or drag and drop"}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Max size: {maxSize}MB
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {isImage && preview ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : isPdf ? (
                  <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center border border-red-200">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Ready to upload</span>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-red-500"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-sm">{displayError}</span>
        </motion.div>
      )}
    </div>
  )
}
