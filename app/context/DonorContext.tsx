"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface DonorInfo {
  name: string
  email: string
  phone: string
  amount: string
}

interface DonorContextType {
  donorInfo: DonorInfo
  setDonorInfo: React.Dispatch<React.SetStateAction<DonorInfo>>
}

const DonorContext = createContext<DonorContextType | undefined>(undefined)

export function DonorProvider({ children }: { children: ReactNode }) {
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    name: "",
    email: "",
    phone: "",
    amount: "",
  })

  return <DonorContext.Provider value={{ donorInfo, setDonorInfo }}>{children}</DonorContext.Provider>
}

export function useDonorContext() {
  const context = useContext(DonorContext)
  if (context === undefined) {
    throw new Error("useDonorContext must be used within a DonorProvider")
  }
  return context
}

