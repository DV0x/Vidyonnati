import type { Metadata } from "next"
import DonateContent from "./DonateContent"

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Donate to educate. Fund a merit scholarship for a student from a Government High School in rural Andhra Pradesh. Vidyonnati Foundation is 80G certified, so donations are tax deductible.",
  alternates: { canonical: "/donate" },
}

export default function DonatePage() {
  return <DonateContent />
}
