import type { Metadata } from "next"
import ScholarsContent from "./ScholarsContent"

export const metadata: Metadata = {
  title: "Merit Scholarship Awardees",
  description:
    "The students supported by Vidyonnati Foundation — 69 merit scholarship awardees from Government High Schools across three mandals in Andhra Pradesh, with Rs. 13.1 Lakhs disbursed since 2023.",
  alternates: { canonical: "/scholars" },
}

export default function ScholarsPage() {
  return <ScholarsContent />
}
