import type { ZodError } from 'zod'

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')

/** Standard response shape for all server actions. */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/** Extract the first human-readable message from a ZodError. */
export function firstZodError(error: ZodError): string {
  return error.issues[0]?.message ?? 'Validation failed'
}