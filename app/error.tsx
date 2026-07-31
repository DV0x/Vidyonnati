"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <AlertTriangle className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mb-2 text-muted-foreground">
          We hit an unexpected error. This is on us, not you.
        </p>

        {/* The application wizards autosave to localStorage on every step, so an
            in-progress application survives this. Worth saying plainly — a student
            halfway through a 9-step form will assume the worst otherwise. */}
        <p className="mb-8 text-sm text-muted-foreground">
          If you were filling out an application, your progress has been saved.
          Reloading will pick up where you left off.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="bg-primary transition-colors duration-300 hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Go to homepage
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Still stuck?{" "}
          <a
            href="mailto:hello@vidyonnatifoundation.org"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
