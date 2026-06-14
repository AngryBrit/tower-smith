const OAUTH_STATE_KEY = 'towersmith_google_sheets_oauth_state'

export function createGoogleSheetsOAuthState(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
}

export function stashGoogleSheetsOAuthState(state: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(OAUTH_STATE_KEY, state)
}

export function clearGoogleSheetsOAuthState(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(OAUTH_STATE_KEY)
}

export function verifyGoogleSheetsOAuthState(received: string | undefined): boolean {
  if (typeof sessionStorage === 'undefined') return false
  const expected = sessionStorage.getItem(OAUTH_STATE_KEY)
  clearGoogleSheetsOAuthState()
  return typeof received === 'string' && received.length > 0 && received === expected
}
