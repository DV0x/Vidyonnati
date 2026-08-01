import type { Metadata } from "next"
import StudentsContent from "./StudentsContent"

export const metadata: Metadata = {
  title: "Students",
  description:
    "Student spotlights from Vidyonnati Foundation are on the way — profiles of meritorious students from rural Andhra Pradesh seeking support for their education.",
  alternates: { canonical: "/students" },
  // Deliberately kept out of the index while this is a placeholder. The page
  // has no student profiles yet, so anything Google surfaced for it would be a
  // dead end for the searcher. Drop this once the spotlight list ships — the
  // featured.list query already exists, it just has no consumer.
  robots: { index: false, follow: true },
}

export default function StudentsPage() {
  return <StudentsContent />
}
