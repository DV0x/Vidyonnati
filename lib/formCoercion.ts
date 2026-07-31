import { incomeBrackets } from "@/lib/schemas/application"

// Bridges the two wizards' react-hook-form values to the Convex mutation
// arguments.
//
// The gap is a typing one, not a data one. Both forms declare their defaults
// inline (`annualFamilyIncome: ""`, `totalMarks: undefined`), so react-hook-form
// infers `string` and `undefined` for fields the schema requires to be a bracket
// union and a number. Zod validates them step by step long before submit, so by
// the time these run the values are already right — but the compiler cannot see
// that, and the honest options are to assert or to cast.
//
// These assert. A blind `as` would turn a wrong value into an
// ArgumentValidationError thrown from the mutation boundary, which reaches the
// student as an opaque failure after they have filled in eleven steps.

type IncomeBracket = (typeof incomeBrackets)[number]

// Narrowed through the shared `incomeBrackets` const rather than re-listing the
// values, so the form, the zod schema and the Convex union cannot drift apart.
export function asIncomeBracket(
  value: string | undefined,
): IncomeBracket | undefined {
  return incomeBrackets.includes(value as IncomeBracket)
    ? (value as IncomeBracket)
    : undefined
}

export function requiredNumber(
  value: number | undefined,
  label: string,
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${label} is required`)
  }
  return value
}

// Required single-choice fields (currentStatus, parentStatus). The caller passes
// the same `as const` options array the form's radio group renders from, so the
// narrowing is checked against the real option list rather than a re-typed copy
// of the union.
export function requiredOption<T extends string>(
  value: string | undefined,
  options: readonly T[],
  label: string,
): T {
  if (options.includes(value as T)) return value as T
  throw new Error(`${label} is required`)
}
