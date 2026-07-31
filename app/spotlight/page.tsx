import type { Metadata } from "next"
import SpotlightContent from "./SpotlightContent"

export const metadata: Metadata = {
  title: "Student Spotlight",
  description:
    "Share your story and get featured. The Vidyonnati Spotlight programme connects meritorious students from rural Andhra Pradesh with donors who fund their education directly.",
  alternates: { canonical: "/spotlight" },
}

export default function SpotlightPage() {
  return <SpotlightContent />
}
