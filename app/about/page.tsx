import type { Metadata } from "next"
import AboutContent from "./AboutContent"

// Server Component wrapper so this route can export metadata — `export const
// metadata` is unavailable in a client module, which is why all 23 pages used
// to emit the root layout's title verbatim.
//
// The content stays a Client Component: it is built on motion/react, which
// needs the client. That costs nothing for SEO, because Next server-renders
// client components too — the prerendered HTML already carried this page's
// copy before the split. Metadata was the only thing actually missing.

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Vidyonnati Foundation promotes education for rural India, awarding merit scholarships to students from Government High Schools in Prakasam and Bapatla Districts, Andhra Pradesh.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return <AboutContent />
}
