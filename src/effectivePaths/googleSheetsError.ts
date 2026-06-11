/** True when Google Sheets rejected the call due to per-minute read/write quota. */
export function isGoogleSheetsQuotaExceededError(raw: string | undefined): boolean {
  if (!raw?.trim()) return false
  const message = summarizeGoogleSheetsApiError(raw) ?? raw.trim()
  return /quota exceeded/i.test(message) || /rate limit exceeded/i.test(message)
}

/** Pull a short human-readable message from a Google API error body. */
export function summarizeGoogleSheetsApiError(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      const body = JSON.parse(trimmed) as {
        error?: { message?: string }
        message?: string
      }
      const message = body.error?.message ?? body.message
      if (typeof message === 'string' && message.length > 0) {
        return message.length > 220 ? `${message.slice(0, 217)}…` : message
      }
    } catch {
      /* fall through */
    }
  }
  return trimmed.length > 220 ? `${trimmed.slice(0, 217)}…` : trimmed
}
