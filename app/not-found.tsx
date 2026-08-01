import type { Metadata } from "next"
import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
}

const SUGGESTIONS = [
  { href: "/spotlight", label: "Student Spotlight" },
  { href: "/students", label: "Featured Students" },
  { href: "/apply", label: "Apply for a Scholarship" },
  { href: "/donate", label: "Donate" },
  { href: "/about", label: "About Us" },
]

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Compass className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <p className="mb-2 text-sm font-semibold tracking-widest text-primary">
          404
        </p>

        <h1 className="mb-3 text-2xl font-bold text-foreground">
          We couldn&rsquo;t find that page
        </h1>

        <p className="mb-8 text-muted-foreground">
          The link may be outdated, or the page may have moved.
        </p>

        <Button
          asChild
          className="bg-primary transition-colors duration-300 hover:bg-primary/90"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Go to homepage
          </Link>
        </Button>

        <div className="mt-10">
          <p className="mb-4 text-sm text-muted-foreground">
            Or try one of these:
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {SUGGESTIONS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-primary underline underline-offset-4 hover:no-underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
