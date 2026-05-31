export type GlobalErrorSource = 'error' | 'unhandledrejection'

export type CapturedGlobalError = {
  error: Error
  source: GlobalErrorSource
  capturedAt: number
}

let lastCaptured: CapturedGlobalError | null = null

export function getLastCapturedGlobalError(): CapturedGlobalError | null {
  return lastCaptured
}

export function clearCapturedGlobalError(): void {
  lastCaptured = null
}

function normalizeError(reason: unknown): Error {
  if (reason instanceof Error) return reason
  if (typeof reason === 'string') return new Error(reason)
  try {
    return new Error(JSON.stringify(reason))
  } catch {
    return new Error(String(reason))
  }
}

function capture(reason: unknown, source: GlobalErrorSource): void {
  lastCaptured = {
    error: normalizeError(reason),
    source,
    capturedAt: Date.now(),
  }
}

/** @internal Vitest only */
export function __testCaptureGlobalError(reason: unknown, source: GlobalErrorSource): void {
  capture(reason, source)
}

/** Install window error handlers; returns cleanup. */
export function registerBugBusterGlobalErrorHandlers(): () => void {
  const onError = (event: ErrorEvent) => {
    capture(event.error ?? event.message, 'error')
  }
  const onRejection = (event: PromiseRejectionEvent) => {
    capture(event.reason, 'unhandledrejection')
  }
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}
