import { getLastCapturedGlobalError } from './globalErrorCapture'
import type { BugBusterInitial } from './BugBusterContext'

/** Merge explicit Bug Buster open options with the last uncaught window error, if any. */
export function mergeBugBusterInitial(initial?: BugBusterInitial): BugBusterInitial | null {
  if (!initial) {
    const captured = getLastCapturedGlobalError()
    if (!captured) return null
    return {
      category: 'crash',
      description: captured.error.message,
      error: captured.error,
    }
  }

  if (initial.error) return initial

  const captured = getLastCapturedGlobalError()
  if (!captured) return initial

  return {
    ...initial,
    category: initial.category ?? 'crash',
    description: initial.description ?? captured.error.message,
    error: captured.error,
  }
}
