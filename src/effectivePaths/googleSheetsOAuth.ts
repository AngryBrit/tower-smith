const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const TOKEN_CACHE_KEY = 'towersmith_google_sheets_token'
const TOKEN_EXPIRY_BUFFER_MS = 60_000

type TokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

type GisTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_subtype?: string
}

type GisOAuth2 = {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GisTokenResponse) => void
  }) => TokenClient
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GisOAuth2
      }
    }
  }
}

type CachedSheetsToken = {
  accessToken: string
  expiresAt: number
}

let gisScriptPromise: Promise<void> | null = null

export function googleSheetsOAuthConfigured(): boolean {
  const id = import.meta.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID
  return typeof id === 'string' && id.trim().length > 0
}

function readCachedSheetsToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(TOKEN_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedSheetsToken
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER_MS
    ) {
      sessionStorage.removeItem(TOKEN_CACHE_KEY)
      return null
    }
    return parsed.accessToken
  } catch {
    sessionStorage.removeItem(TOKEN_CACHE_KEY)
    return null
  }
}

function writeCachedSheetsToken(accessToken: string, expiresInSec?: number): void {
  if (typeof sessionStorage === 'undefined') return
  const ttlMs = typeof expiresInSec === 'number' && expiresInSec > 0 ? expiresInSec * 1000 : 3_600_000
  const payload: CachedSheetsToken = {
    accessToken,
    expiresAt: Date.now() + ttlMs,
  }
  sessionStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(payload))
}

export function clearCachedGoogleSheetsAccessToken(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(TOKEN_CACHE_KEY)
}

function isRetryableGoogleAuthError(code: string): boolean {
  return (
    code === 'interaction_required' ||
    code === 'login_required' ||
    code === 'account_selection_required' ||
    code === 'consent_required'
  )
}

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('google_oauth_unavailable'))
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }
  if (gisScriptPromise) return gisScriptPromise

  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('google_oauth_script_failed')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('google_oauth_script_failed'))
    document.head.appendChild(script)
  })

  return gisScriptPromise
}

async function requestTokenWithPrompt(prompt: '' | 'none' | 'consent'): Promise<string> {
  await loadGisScript()
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) {
    throw new Error('google_oauth_unavailable')
  }

  const clientId = import.meta.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID as string

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: SHEETS_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        if (!response.access_token) {
          reject(new Error('google_oauth_no_token'))
          return
        }
        writeCachedSheetsToken(response.access_token, response.expires_in)
        resolve(response.access_token)
      },
    })
    client.requestAccessToken({ prompt })
  })
}

export type GoogleSheetsOAuthOptions = {
  /** Force Google consent (re-authorize spreadsheets scope). */
  consent?: boolean
}

/**
 * Request a short-lived Google access token with spreadsheets scope.
 * Reuses a cached session token when valid, then tries silent GIS auth before prompting.
 */
export async function requestGoogleSheetsAccessToken(
  options: GoogleSheetsOAuthOptions = {},
): Promise<string> {
  if (!googleSheetsOAuthConfigured()) {
    throw new Error('google_oauth_not_configured')
  }

  if (!options.consent) {
    const cached = readCachedSheetsToken()
    if (cached) return cached
  }

  if (!options.consent) {
    try {
      return await requestTokenWithPrompt('none')
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (!isRetryableGoogleAuthError(code)) throw err
    }
    try {
      return await requestTokenWithPrompt('')
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (!isRetryableGoogleAuthError(code)) throw err
    }
  }

  return requestTokenWithPrompt(options.consent ? 'consent' : '')
}

/** Cached spreadsheets token for this browser tab session, if still valid. */
export function getCachedGoogleSheetsAccessToken(): string | null {
  return readCachedSheetsToken()
}
