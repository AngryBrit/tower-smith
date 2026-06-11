import { SPREADSHEET_ID_RE } from './effectivePathsHttp'

export function parseEffectivePathsMasterBody(raw: unknown):
  | { ok: true; masterSpreadsheetId: string; sheetGid: number | null }
  | { ok: false; error: 'invalid_json' | 'invalid_spreadsheet' } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_json' }
  }
  const masterSpreadsheetId =
    typeof (raw as { masterSpreadsheetId?: unknown }).masterSpreadsheetId === 'string'
      ? (raw as { masterSpreadsheetId: string }).masterSpreadsheetId.trim()
      : ''
  if (!SPREADSHEET_ID_RE.test(masterSpreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  const gidRaw = (raw as { sheetGid?: unknown }).sheetGid
  const sheetGid =
    typeof gidRaw === 'number' && Number.isInteger(gidRaw) ? gidRaw : null

  return { ok: true, masterSpreadsheetId, sheetGid }
}
