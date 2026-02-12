import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { CreditCard, Info, User } from "lucide-react"

interface WireTransferFormProps {
  donorName: string
  donorEmail: string
  donorPhone: string
  amount: string
  onBack: () => void
  onSubmit: () => void
}

export function WireTransferForm({
  donorName,
  donorEmail,
  donorPhone,
  amount,
  onBack,
  onSubmit,
}: WireTransferFormProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 py-4 flex flex-row items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Donor Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm py-4">
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Name:</span>
            <span className="col-span-2">{donorName}</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="col-span-2">{donorEmail}</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="col-span-2">{donorPhone}</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Amount:</span>
            <span className="col-span-2 text-primary font-semibold">₹{amount}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 py-4 flex flex-row items-center space-x-2">
          <CreditCard className="w-5 h-5 text-secondary" />
          <CardTitle className="text-lg font-semibold">Bank Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm py-4">
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Account Name:</span>
            <span className="col-span-2">Vidyonnati Foundation</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Account Number:</span>
            <span className="col-span-2 font-mono">20511248091</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Account Type:</span>
            <span className="col-span-2">Current Account</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">IFSC Code:</span>
            <span className="col-span-2 font-mono">SBIN0012919</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Bank Name:</span>
            <span className="col-span-2">State Bank of India</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-gray-600">Branch:</span>
            <span className="col-span-2">Kurnool Road, Ongole, Prakasam, AP 523002</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="py-4 flex flex-row items-center space-x-2">
          <Info className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg font-semibold text-yellow-800">Important Note</CardTitle>
        </CardHeader>
        <CardContent className="text-sm py-4 text-yellow-800">
          <p>
            Please include your name and email in the transfer description for easy identification of your donation.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onBack}
            variant="outline"
            className="transition-all duration-300 hover:shadow-lg border-primary text-primary hover:bg-primary/10"
          >
            Back to Donation Form
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onSubmit}
            className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
          >
            I've Completed the Transfer
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

