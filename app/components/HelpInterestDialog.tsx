"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { helpInterestSchema, type HelpInterest, helpTypes } from "@/lib/schemas/application"
import type { Student } from "./StudentCard"

const helpTypeLabels: Record<string, string> = {
  donate: "I want to donate",
  volunteer: "I want to volunteer",
  corporate: "Corporate partnership",
  other: "Other",
}

export default function HelpInterestDialog({
  student,
  open,
  onOpenChange
}: {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<HelpInterest>({
    resolver: zodResolver(helpInterestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      helpType: undefined,
      message: "",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (data: HelpInterest) => {
    try {
      const response = await fetch('/api/help-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          help_type: data.helpType,
          message: data.message || null,
          student_id: student?.id,
          student_name: student?.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Help interest submission error:', error)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    }
  }

  const handleClose = () => {
    form.reset()
    setIsSubmitted(false)
    onOpenChange(false)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Custom Header with Gradient */}
        <div className="bg-gradient-to-r from-primary to-orange-500 p-5 text-white">
          <DialogHeader className="space-y-1">
            <DialogDescription className="text-orange-100 text-sm">
              Express interest to support
            </DialogDescription>
            <DialogTitle className="text-xl font-bold text-white">
              {student.name}
            </DialogTitle>
            <p className="text-orange-100 text-sm">{student.field}</p>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isSubmitted ? (
            <>
              <p className="text-gray-600 text-sm mb-5">
                Share your details and our team will connect with you to discuss how you can support {student.name.split(' ')[0]}&apos;s education journey.
              </p>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
                <div>
                  <AnimatedInput
                    type="text"
                    label="Your Name"
                    value={form.watch("name")}
                    onChange={(e) => form.setValue("name", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <AnimatedInput
                    type="email"
                    label="Email Address"
                    value={form.watch("email")}
                    onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <AnimatedInput
                    type="tel"
                    label="Phone Number"
                    value={form.watch("phone")}
                    onChange={(e) => form.setValue("phone", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Help Type Dropdown */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">How would you like to help?</Label>
                  <Select
                    onValueChange={(value) => form.setValue("helpType", value as HelpInterest["helpType"], { shouldValidate: true })}
                    value={form.watch("helpType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {helpTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.helpType && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.helpType.message}</p>
                  )}
                </div>

                {form.formState.errors.root && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 donate-button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Interest
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              className="text-center py-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
              <p className="text-gray-600 text-sm">
                We&apos;ve received your interest in supporting {student.name.split(' ')[0]}.
                Our team will reach out within 24-48 hours.
              </p>
              <Button
                onClick={handleClose}
                variant="outline"
                className="mt-6 rounded-full"
              >
                Close
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
