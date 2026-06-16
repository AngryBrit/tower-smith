import type { Config } from '@netlify/functions'
import { corsHeaders, jsonResponse } from './lib/http'

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

function readOAuthClientId(): string | null {
  const raw =
    process.env.GOOGLE_SHEETS_OAUTH_CLIENT_ID?.trim() ||
    process.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID?.trim()
  return raw && raw.length > 0 ? raw : null
}

function readOAuthClientSecret(): string | null {
  const raw = process.env.GOOGLE_SHEETS_OAUTH_CLIENT_SECRET?.trim()
  return raw && raw.length > 0 ? raw : null
}

function parseBody(raw: unknown):
  | { ok: true; code: string; redirectUri: string }
  | { ok: false; error: 'invalid_json' | 'invalid_request' } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_json' }
  }
  const code =
    typeof (raw as { code?: unknown }).code === 'string'
      ? (raw as { code: string }).code.trim()
      : ''
  const redirectUri =
    typeof (raw as { redirectUri?: unknown }).redirectUri === 'string'
      ? (raw as { redirectUri: string }).redirectUri.trim()
      : ''
  if (!code || !redirectUri) {
    return { ok: false, error: 'invalid_request' }
  }
  return { ok: true, code, redirectUri }
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }

  const clientId = readOAuthClientId()
  const clientSecret = readOAuthClientSecret()
  if (!clientId || !clientSecret) {
    return jsonResponse(503, { error: 'oauth_token_exchange_not_configured' }, cors)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }

  const parsed = parseBody(raw)
  if (!parsed.ok) {
    return jsonResponse(400, { error: parsed.error }, cors)
  }

  const body = new URLSearchParams({
    code: parsed.code,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: parsed.redirectUri,
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const json = (await response.json().catch(() => null)) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  } | null

  if (!response.ok || !json?.access_token) {
    return jsonResponse(response.ok ? 502 : response.status, {
      error: 'token_exchange_failed',
      message: json?.error_description ?? json?.error,
    }, cors)
  }

  return jsonResponse(200, {
    accessToken: json.access_token,
    expiresInSec: json.expires_in,
  }, cors)
}

export const config: Config = {
  path: '/api/google/oauth/token',
}
