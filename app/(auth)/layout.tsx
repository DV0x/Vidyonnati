import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth pages have their own full-screen layout
  // Position fixed to overlay nav/footer from root layout
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/40 overflow-auto">
      {children}
    </div>
  )
}
