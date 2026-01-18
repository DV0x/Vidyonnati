"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WireTransferForm } from "@/app/components/WireTransferForm"
import { toast } from "@/components/ui/use-toast"
import { useDonorContext } from "@/app/context/DonorContext"

export default function WireTransferPage() {
  const router = useRouter()
  const { donorInfo } = useDonorContext()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleBack = () => {
    router.push("/donate")
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    toast({
      title: "Transfer Initiated",
      description: "Thank you for your donation. We've received your wire transfer details.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        <Card className="w-full shadow-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center text-primary">Wire Transfer Details</CardTitle>
            <CardDescription className="text-center text-lg">Complete your donation via wire transfer</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <WireTransferForm
                donorName={donorInfo.name}
                donorEmail={donorInfo.email}
                donorPhone={donorInfo.phone}
                amount={donorInfo.amount}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            ) : (
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold text-green-600">Thank You for Your Donation!</p>
                {donorInfo.donationId && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Your Donation Reference</p>
                    <p className="font-mono text-lg font-bold text-gray-900">{donorInfo.donationId}</p>
                  </div>
                )}
                <p>
                  Your wire transfer details have been received. Please complete the transfer using the provided
                  information.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleBack}
                    className="mt-4 bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
                  >
                    Return to Donations
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

