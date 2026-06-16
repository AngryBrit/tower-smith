import { createPkceVerifier } from './googlePkce'

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export type GoogleOAuthTokenResult = {
  accessToken: string
  expiresInSec?: number
}

/** PKCE authorization-code exchange for a public Google Web OAuth client (no client secret). */
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

export { createPkceVerifier }
