const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

type TokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

type GisOAuth2 = {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: { access_token?: string; error?: string }) => void
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

let gisScriptPromise: Promise<void> | null = null

export function googleSheetsOAuthConfigured(): boolean {
  const id = import.meta.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID
  return typeof id === 'string' && id.trim().length > 0
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

export type GoogleSheetsOAuthOptions = {
  /** Show Google consent (use when user clicks Allow Google Sheets). */
  consent?: boolean
}

/** Request a short-lived Google access token with spreadsheets scope. */
export async function requestGoogleSheetsAccessToken(
  options: GoogleSheetsOAuthOptions = {},
): Promise<string> {
  if (!googleSheetsOAuthConfigured()) {
    throw new Error('google_oauth_not_configured')
  }

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
        resolve(response.access_token)
      },
    })
    client.requestAccessToken({ prompt: options.consent ? 'consent' : '' })
  })
}
