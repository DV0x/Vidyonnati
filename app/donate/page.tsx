"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { toast } from "@/components/ui/use-toast"
import { useDonorContext } from "@/app/context/DonorContext"
import { Check, Loader2 } from "lucide-react"

const PRESET_AMOUNTS = [
  { value: "500", label: "₹500" },
  { value: "1000", label: "₹1,000" },
  { value: "2000", label: "₹2,000" },
  { value: "5000", label: "₹5,000" },
]

export default function DonatePage() {
  const router = useRouter()
  const { setDonorInfo } = useDonorContext()
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAmountSelect = (value: string) => {
    setAmount(value)
    setIsCustom(false)
    setCustomAmount("")
    setErrors({ ...errors, amount: "", customAmount: "" })
  }

  const handleCustomClick = () => {
    setIsCustom(true)
    setAmount("")
    setErrors({ ...errors, amount: "" })
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!amount && !customAmount) {
      newErrors.amount = "Please select or enter an amount"
    }

    if (isCustom && !customAmount) {
      newErrors.customAmount = "Please enter an amount"
    }

    if (isCustom && customAmount && parseInt(customAmount) < 100) {
      newErrors.customAmount = "Minimum amount is ₹100"
    }

    if (!donorName.trim()) {
      newErrors.donorName = "Please enter your name"
    }

    if (!donorEmail.trim()) {
      newErrors.donorEmail = "Please enter your email"
    } else if (!/\S+@\S+\.\S+/.test(donorEmail)) {
      newErrors.donorEmail = "Please enter a valid email"
    }

    if (!donorPhone.trim()) {
      newErrors.donorPhone = "Please enter your phone number"
    } else if (!/^\d{10}$/.test(donorPhone)) {
      newErrors.donorPhone = "Enter a valid 10-digit number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const finalAmount = isCustom ? customAmount : amount

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: donorName,
          donor_email: donorEmail,
          donor_phone: donorPhone,
          amount: parseFloat(finalAmount),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create donation')
      }

      const data = await response.json()

      setDonorInfo({
        name: donorName,
        email: donorEmail,
        phone: donorPhone,
        amount: finalAmount,
        donationId: data.donation_id,
      })
      router.push("/donate/wire-transfer")
    } catch (error) {
      console.error('Donation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-orange-300/30 to-rose-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/20 via-purple-200/20 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Donate to Educate
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Your contribution changes a student's life
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleAmountSelect(preset.value)}
                      className={`relative py-4 px-4 rounded-xl border-2 text-center font-semibold transition-all duration-200 ${
                        amount === preset.value && !isCustom
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {amount === preset.value && !isCustom && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <button
                  type="button"
                  onClick={handleCustomClick}
                  className={`w-full mt-3 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${
                    isCustom
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isCustom ? "Enter Custom Amount" : "Other Amount"}
                </button>

                {isCustom && (
                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          setErrors({ ...errors, customAmount: "" })
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg font-medium"
                        min="100"
                      />
                    </div>
                    {errors.customAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.customAmount}</p>
                    )}
                  </div>
                )}

                {errors.amount && (
                  <p className="text-red-500 text-xs mt-2">{errors.amount}</p>
                )}
              </div>

              {/* Donor Details */}
              <div className="space-y-4 pt-2">
                <div>
                  <AnimatedInput
                    type="text"
                    label="Full Name"
                    value={donorName}
                    onChange={(e) => {
                      setDonorName(e.target.value)
                      setErrors({ ...errors, donorName: "" })
                    }}
                  />
                  {errors.donorName && (
                    <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>
                  )}
                </div>

                <div>
                  <AnimatedInput
                    type="email"
                    label="Email Address"
                    value={donorEmail}
                    onChange={(e) => {
                      setDonorEmail(e.target.value)
                      setErrors({ ...errors, donorEmail: "" })
                    }}
                  />
                  {errors.donorEmail && (
                    <p className="text-red-500 text-xs mt-1">{errors.donorEmail}</p>
                  )}
                </div>

                <div>
                  <AnimatedInput
                    type="tel"
                    label="Phone Number"
                    value={donorPhone}
                    onChange={(e) => {
                      setDonorPhone(e.target.value)
                      setErrors({ ...errors, donorPhone: "" })
                    }}
                  />
                  {errors.donorPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.donorPhone}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>

              {/* Footer note */}
              <p className="text-center text-xs text-gray-500 pt-2">
                Eligible for tax deduction under Section 80G
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
