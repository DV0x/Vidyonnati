import type { Metadata } from "next"
import MediaContent from "./MediaContent"

export const metadata: Metadata = {
  title: "Press Coverage",
  description:
    "News and press coverage of Vidyonnati Foundation’s merit scholarship programme for students from Government High Schools in Prakasam and Bapatla Districts.",
  alternates: { canonical: "/media" },
}

export default function MediaPage() {
  return <MediaContent />
}
