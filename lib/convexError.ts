import { ConvexError } from "convex/values"

// Pulls a user-facing message out of whatever a Convex mutation threw.
//
// Convex functions throw two different shapes deliberately. Most guards throw a
// plain string (`new ConvexError("Application not found")`), while the ones the
// UI has to branch on carry a structured payload so the client gets a code and
// the extra fields alongside the text:
//
//   throw new ConvexError({ code: "DUPLICATE_APPLICATION", message, existingApplicationId })
//
// Anything that is not a ConvexError — a network failure, a bug in the client —
// has no message worth showing a donor or a student, so it collapses to the
// caller's fallback. Convex also strips non-ConvexError messages in production
// builds, so there would be nothing useful there anyway.
export function convexErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    const data = error.data as unknown
    if (typeof data === "string") return data
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message
    }
  }
  return fallback
}

// The structured payload, for the two call sites that need more than the text —
// the wizards, which link to the application the student already has.
export function convexErrorData(
  error: unknown,
): { code?: string; message?: string; existingApplicationId?: string } | null {
  if (!(error instanceof ConvexError)) return null
  const data = error.data as unknown
  if (data && typeof data === "object") {
    return data as { code?: string; message?: string; existingApplicationId?: string }
  }
  return null
}
