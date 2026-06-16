import { googleDrivePickerConfigured } from './googleDrivePicker'
import { exchangeGoogleOAuthAuthorizationCode } from './googleOAuthCodeExchange'
import { createPkceVerifier } from './googlePkce'
import {
  clearGoogleSheetsOAuthState,
  createGoogleSheetsOAuthState,
  stashGoogleSheetsOAuthState,
  verifyGoogleSheetsOAuthState,
} from './googleSheetsOAuthState'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
/** @deprecated Use {@link DRIVE_FILE_SCOPE} — kept for migration docs only. */
export const LEGACY_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const OAUTH_SCOPE = DRIVE_FILE_SCOPE
const TOKEN_CACHE_KEY = 'towersmith_google_drive_file_token'
const TOKEN_EXPIRY_BUFFER_MS = 60_000
/** Max wait for GIS code callback (consent popup dismissed, blocked, or lost). */
const OAUTH_CALLBACK_TIMEOUT_MS = 120_000

type CodeClient = {
  requestCode: () => void
}

type CodeResponse = {
  code?: string
  scope?: string
  state?: string
  error?: string
  error_description?: string
}

type GisOAuthError = {
  type?: string
  message?: string
}

type GisOAuth2 = {
  initCodeClient: (config: {
    client_id: string
    scope: string
    state?: string
    ux_mode?: 'popup' | 'redirect'
    callback: (response: CodeResponse) => void
    error_callback?: (error: GisOAuthError) => void
    select_account?: boolean
  }) => CodeClient
  revoke?: (accessToken: string, done: () => void) => void
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
  return (
    typeof id === 'string' &&
    id.trim().length > 0 &&
    googleDrivePickerConfigured()
  )
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

export function writeCachedSheetsToken(accessToken: string, expiresInSec?: number): void {
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

function gisOAuth2Ready(): boolean {
  return Boolean(window.google?.accounts?.oauth2)
}

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('google_oauth_unavailable'))
  }
  if (gisOAuth2Ready()) {
    return Promise.resolve()
  }
  if (gisScriptPromise) return gisScriptPromise

  gisScriptPromise = new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (result: 'resolve' | 'reject', err?: Error) => {
      if (settled) return
      settled = true
      if (result === 'resolve') resolve()
      else reject(err ?? new Error('google_oauth_unavailable'))
    }

    const finishIfReady = () => {
      if (gisOAuth2Ready()) finish('resolve')
      return settled
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    )
    if (existing) {
      if (finishIfReady()) return
      existing.addEventListener(
        'load',
        () => {
          if (!finishIfReady()) finish('reject', new Error('google_oauth_unavailable'))
        },
        { once: true },
      )
      existing.addEventListener(
        'error',
        () => finish('reject', new Error('google_oauth_script_failed')),
        { once: true },
      )
      // Script may have finished loading before listeners were attached.
      queueMicrotask(() => {
        finishIfReady()
      })
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!finishIfReady()) finish('reject', new Error('google_oauth_unavailable'))
    }
    script.onerror = () => finish('reject', new Error('google_oauth_script_failed'))
    document.head.appendChild(script)
  }).catch((err: unknown) => {
    gisScriptPromise = null
    throw err
  }) as Promise<void>

  return gisScriptPromise
}

/** GIS popup code flow uses the page origin as redirect_uri (see Google Identity Services docs). */
function gisCodeClientRedirectUri(): string {
  return window.location.origin
}

type CodePromptOptions = {
  forceConsent?: boolean
}

function oauthErrorFromGis(err: GisOAuthError): Error {
  const type = err.type ?? 'unknown'
  if (type === 'popup_closed') return new Error('popup_closed_by_user')
  if (type === 'popup_failed_to_open') return new Error('popup_blocked')
  return new Error(type)
}

async function revokeCachedGoogleAccess(): Promise<void> {
  const cached = readCachedSheetsToken()
  clearCachedGoogleSheetsAccessToken()
  if (!cached) return

  await loadGisScript()
  const revoke = window.google?.accounts?.oauth2?.revoke
  if (!revoke) return

  await new Promise<void>((resolve) => {
    revoke(cached, () => resolve())
  })
}

async function requestCodeWithPrompt(options: CodePromptOptions = {}): Promise<string> {
  await loadGisScript()
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) {
    throw new Error('google_oauth_unavailable')
  }

  const clientId = import.meta.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID as string
  const oauthState = createGoogleSheetsOAuthState()
  const codeVerifier = createPkceVerifier()
  const redirectUri = gisCodeClientRedirectUri()
  stashGoogleSheetsOAuthState(oauthState)

  return new Promise((resolve, reject) => {
    let settled = false
    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      clearGoogleSheetsOAuthState()
      reject(new Error('google_oauth_timeout'))
    }, OAUTH_CALLBACK_TIMEOUT_MS)

    const finish = (result: 'resolve' | 'reject', value?: string, err?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      if (result === 'resolve' && value) resolve(value)
      else reject(err ?? new Error('google_oauth_no_token'))
    }

    const client = oauth2.initCodeClient({
      client_id: clientId,
      scope: OAUTH_SCOPE,
      state: oauthState,
      ux_mode: 'popup',
      select_account: options.forceConsent,
      callback: (response) => {
        void (async () => {
          if (!verifyGoogleSheetsOAuthState(response.state)) {
            finish('reject', undefined, new Error('google_oauth_state_mismatch'))
            return
          }
          if (response.error) {
            finish('reject', undefined, new Error(response.error))
            return
          }
          if (!response.code) {
            finish('reject', undefined, new Error('google_oauth_no_token'))
            return
          }

          const tokenResult = await exchangeGoogleOAuthAuthorizationCode(
            clientId,
            response.code,
            codeVerifier,
            redirectUri,
          )
          if (!tokenResult) {
            finish('reject', undefined, new Error('google_oauth_no_token'))
            return
          }

          writeCachedSheetsToken(tokenResult.accessToken, tokenResult.expiresInSec)
          finish('resolve', tokenResult.accessToken)
        })().catch((err: unknown) => {
          finish(
            'reject',
            undefined,
            err instanceof Error ? err : new Error('google_oauth_failed'),
          )
        })
      },
      error_callback: (err) => {
        clearGoogleSheetsOAuthState()
        finish('reject', undefined, oauthErrorFromGis(err))
      },
    })
    client.requestCode()
  })
}

async function requestInteractiveCode(forceConsent = false): Promise<string> {
  if (forceConsent) {
    await revokeCachedGoogleAccess()
  }

  try {
    return await requestCodeWithPrompt({ forceConsent })
  } catch (err) {
    const code = err instanceof Error ? err.message : ''
    if (code === 'popup_closed_by_user') throw err
    if (code === 'popup_blocked' || isRetryableGoogleAuthError(code)) {
      return requestCodeWithPrompt({ forceConsent })
    }
    throw err
  }
}

export type GoogleSheetsOAuthOptions = {
  /** Force Google consent (re-authorize drive.file scope). */
  consent?: boolean
}

/**
 * Request a short-lived Google access token with drive.file scope.
 * Reuses a cached session token when valid, then runs the GIS authorization-code popup flow.
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

  return requestInteractiveCode(Boolean(options.consent))
}

/** Cached drive.file token for this browser tab session, if still valid. */
export function getCachedGoogleSheetsAccessToken(): string | null {
  return readCachedSheetsToken()
}
