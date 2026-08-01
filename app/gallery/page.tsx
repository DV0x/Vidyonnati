import type { Metadata } from "next"
import GalleryContent from "./GalleryContent"

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Our journey in pictures — scholarship award ceremonies, school visits and student milestones from Vidyonnati Foundation’s work across rural Andhra Pradesh.",
  alternates: { canonical: "/gallery" },
}

export default function GalleryPage() {
  return <GalleryContent />
}
