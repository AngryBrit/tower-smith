import { createPkceVerifier } from './googlePkce'

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type GoogleOAuthTokenResult = {
  accessToken: string
  expiresInSec?: number
}

/** PKCE authorization-code exchange for redirect flows (one-pick picker). */
export async function exchangeGoogleOAuthAuthorizationCode(
  clientId: string,
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<GoogleOAuthTokenResult | null> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) return null

  const json = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) return null
  return {
    accessToken: json.access_token,
    expiresInSec: json.expires_in,
  }
}

/**
 * GIS initCodeClient popup codes must be exchanged server-side (client secret).
 * Returns null when the Netlify function is not configured (503).
 */
export async function exchangeGoogleOAuthCodeViaTowerSmith(
  code: string,
  redirectUri: string,
): Promise<GoogleOAuthTokenResult | 'not_configured' | null> {
  const response = await fetch(`${API_BASE}/google/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  })

  if (response.status === 503) return 'not_configured'

  const json = (await response.json().catch(() => null)) as {
    accessToken?: string
    expiresInSec?: number
  } | null

  if (!response.ok || !json?.accessToken) return null
  return {
    accessToken: json.accessToken,
    expiresInSec: json.expiresInSec,
  }
}

export { createPkceVerifier }
