"use client"

import { useEffect } from "react"

// Last-resort boundary: catches errors thrown by the root layout itself, where
// app/error.tsx cannot help because the layout is what failed. Next.js replaces
// the entire document here, so globals.css is NOT applied — everything below is
// inline-styled and dependency-free on purpose. Do not import UI components.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Root layout error:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#fff",
          color: "#0b1220",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 0.75rem",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Something went wrong
          </h1>

          <p style={{ margin: "0 0 1.75rem", color: "#5b6472" }}>
            The page failed to load. Please try again.
          </p>

          <button
            onClick={reset}
            style={{
              background: "hsl(14 100% 56%)",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: "0.9375rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>

          {error.digest && (
            <p
              style={{
                marginTop: "2rem",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                color: "#5b6472",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#5b6472" }}>
            Still stuck?{" "}
            <a
              href="mailto:hello@vidyonnatifoundation.org"
              style={{ color: "hsl(14 100% 56%)" }}
            >
              Contact us
            </a>
          </p>
        </main>
      </body>
    </html>
  )
}
