"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { toast } from "@/components/ui/use-toast"
import { useDonorContext } from "@/app/context/DonorContext"

export default function DonatePage() {
  const router = useRouter()
  const { setDonorInfo } = useDonorContext()
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!amount) {
      newErrors.amount = "Please select an amount"
    }

    if (amount === "custom" && !customAmount) {
      newErrors.customAmount = "Please enter a custom amount"
    }

    if (!donorName.trim()) {
      newErrors.donorName = "Please enter your name"
    }

    if (!donorEmail.trim()) {
      newErrors.donorEmail = "Please enter your email"
    } else if (!/\S+@\S+\.\S+/.test(donorEmail)) {
      newErrors.donorEmail = "Please enter a valid email address"
    }

    if (!donorPhone.trim()) {
      newErrors.donorPhone = "Please enter your phone number"
    } else if (!/^\d{10}$/.test(donorPhone)) {
      newErrors.donorPhone = "Please enter a valid 10-digit phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const finalAmount = amount === "custom" ? customAmount : amount
      setDonorInfo({
        name: donorName,
        email: donorEmail,
        phone: donorPhone,
        amount: finalAmount,
      })
      router.push("/donate/wire-transfer")
    } else {
      toast({
        title: "Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="w-full shadow-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center text-primary">Donate to Educate</CardTitle>
            <CardDescription className="text-center text-lg">
              Your contribution can change a student's life. Choose an amount to donate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <RadioGroup
                  value={amount}
                  onValueChange={(value) => {
                    setAmount(value)
                    setErrors({ ...errors, amount: "", customAmount: "" })
                  }}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500" id="r1" />
                      <Label htmlFor="r1">₹500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1000" id="r2" />
                      <Label htmlFor="r2">₹1,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2000" id="r3" />
                      <Label htmlFor="r3">₹2,000</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <RadioGroupItem value="custom" id="r4" />
                    <Label htmlFor="r4">Custom Amount</Label>
                  </div>
                </RadioGroup>
                {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                {amount === "custom" && (
                  <div>
                    <AnimatedInput
                      type="number"
                      label="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setErrors({ ...errors, customAmount: "" })
                      }}
                      className="mt-2"
                    />
                    {errors.customAmount && <p className="text-red-500 text-sm">{errors.customAmount}</p>}
                  </div>
                )}
                <AnimatedInput
                  type="text"
                  label="Full Name"
                  required
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(e.target.value)
                    setErrors({ ...errors, donorName: "" })
                  }}
                />
                {errors.donorName && <p className="text-red-500 text-sm">{errors.donorName}</p>}
                <AnimatedInput
                  type="email"
                  label="Email Address"
                  required
                  value={donorEmail}
                  onChange={(e) => {
                    setDonorEmail(e.target.value)
                    setErrors({ ...errors, donorEmail: "" })
                  }}
                />
                {errors.donorEmail && <p className="text-red-500 text-sm">{errors.donorEmail}</p>}
                <AnimatedInput
                  type="tel"
                  label="Phone Number"
                  required
                  value={donorPhone}
                  onChange={(e) => {
                    setDonorPhone(e.target.value)
                    setErrors({ ...errors, donorPhone: "" })
                  }}
                />
                {errors.donorPhone && <p className="text-red-500 text-sm">{errors.donorPhone}</p>}
                <Button
                  type="submit"
                  className="w-full mt-6 text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 donate-button"
                >
                  Proceed to Payment
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            Your donation is eligible for tax deduction under Section 80G of the Income Tax Act.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

