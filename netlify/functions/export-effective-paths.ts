import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'
import { exportRelicsToGoogleSheet, GoogleSheetsApiError } from './lib/googleSheets'

function parseBody(raw: unknown):
  | {
      ok: true
      masterSpreadsheetId: string | null
      masterSheetGid: number | null
      spreadsheetId: string | null
      sheetGid: number | null
      relicOwnedIds: string[]
    }
  | { ok: false; error: 'invalid_json' | 'invalid_spreadsheet' } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_json' }
  }

  const masterRaw = (raw as { masterSpreadsheetId?: unknown }).masterSpreadsheetId
  const masterSpreadsheetId =
    typeof masterRaw === 'string' && masterRaw.trim() ? masterRaw.trim() : null
  if (masterSpreadsheetId && !SPREADSHEET_ID_RE.test(masterSpreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  const spreadsheetRaw = (raw as { spreadsheetId?: unknown }).spreadsheetId
  const spreadsheetId =
    typeof spreadsheetRaw === 'string' && spreadsheetRaw.trim() ? spreadsheetRaw.trim() : null
  if (spreadsheetId && !SPREADSHEET_ID_RE.test(spreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  if (!masterSpreadsheetId && !spreadsheetId) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  const masterGidRaw = (raw as { masterSheetGid?: unknown }).masterSheetGid
  const masterSheetGid =
    typeof masterGidRaw === 'number' && Number.isInteger(masterGidRaw) ? masterGidRaw : null

  const gidRaw = (raw as { sheetGid?: unknown }).sheetGid
  const sheetGid = typeof gidRaw === 'number' && Number.isInteger(gidRaw) ? gidRaw : null

  const relicRaw = (raw as { relicOwnedIds?: unknown }).relicOwnedIds
  const relicOwnedIds = Array.isArray(relicRaw)
    ? relicRaw.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  return {
    ok: true,
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetId,
    sheetGid,
    relicOwnedIds,
  }
}

function mapExportError(message: string | undefined): string {
  if (message === 'no_relic_rows') return 'no_relic_rows'
  if (message === 'relic_workbook_not_found') return 'relic_workbook_not_found'
  if (message === 'relic_workbook_access_denied') return 'relic_workbook_access_denied'
  if (message === 'relic_tab_not_found') return 'relic_tab_not_found'
  if (message === 'ids_master_empty') return 'ids_master_empty'
  return 'sheets_api_error'
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

  try {
    const result = await exportRelicsToGoogleSheet({
      accessToken: token,
      masterSpreadsheetId: parsed.masterSpreadsheetId,
      masterSheetGid: parsed.masterSheetGid,
      spreadsheetId: parsed.spreadsheetId,
      sheetGid: parsed.sheetGid,
      relicOwnedIds: parsed.relicOwnedIds,
    })
    return jsonResponse(200, { ok: true, ...result }, cors)
  } catch (err) {
    if (err instanceof GoogleSheetsApiError) {
      const mapped = mapExportError(err.message)
      if (mapped !== 'sheets_api_error') {
        return jsonResponse(400, { error: mapped }, cors)
      }
      const status = err.reason === 'sheets_auth_failed' ? 401 : err.status >= 400 ? err.status : 502
      const detail = summarizeGoogleSheetsApiError(err.message) ?? err.message
      return jsonResponse(status, { error: err.reason, message: detail }, cors)
    }
    return jsonResponse(502, { error: 'sheets_api_error' }, cors)
  }
}

export const config: Config = {
  path: '/api/effective-paths/export',
}
