import { corsHeaders } from './http'

export function effectivePathsCors(origin: string | null): Record<string, string> {
  return {
    ...corsHeaders(origin),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Google-Access-Token',
  }
}

export function googleAccessToken(req: Request): string | null {
  return req.headers.get('X-Google-Access-Token')?.trim() || null
}

export const SPREADSHEET_ID_RE = /^[a-zA-Z0-9_-]{20,}$/
