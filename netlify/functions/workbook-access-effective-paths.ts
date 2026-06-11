import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { checkSpreadsheetAccess } from './lib/googleSheetsClient'

function parseBody(raw: unknown):
  | { ok: true; name: string; spreadsheetId: string }
  | { ok: false; error: 'invalid_json' | 'invalid_spreadsheet' } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_json' }
  }
  const name =
    typeof (raw as { name?: unknown }).name === 'string'
      ? (raw as { name: string }).name.trim()
      : ''
  const spreadsheetId =
    typeof (raw as { spreadsheetId?: unknown }).spreadsheetId === 'string'
      ? (raw as { spreadsheetId: string }).spreadsheetId.trim()
      : ''
  if (!name || !SPREADSHEET_ID_RE.test(spreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }
  return { ok: true, name, spreadsheetId }
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = effectivePathsCors(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }

  const token = googleAccessToken(req)
  if (!token) {
    return jsonResponse(401, { error: 'sheets_auth_failed' }, cors)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }

  const parsed = parseBody(raw)
  if (!parsed.ok) {
    return jsonResponse(
      400,
      { error: parsed.error === 'invalid_spreadsheet' ? 'invalid_spreadsheet' : 'invalid_json' },
      cors,
    )
  }

  const access = await checkSpreadsheetAccess(token, parsed.spreadsheetId)
  return jsonResponse(
    200,
    {
      ok: true,
      name: parsed.name,
      spreadsheetId: parsed.spreadsheetId,
      access,
    },
    cors,
  )
}

export const config: Config = {
  path: '/api/effective-paths/workbook-access',
}
