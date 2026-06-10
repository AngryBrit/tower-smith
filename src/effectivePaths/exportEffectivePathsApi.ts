import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

export type LinkedWorkbookAccess = {
  name: string
  spreadsheetId: string
  access: 'ok' | 'denied' | 'not_found'
}

const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type EffectivePathsExportError =
  | 'network'
  | 'invalid_spreadsheet'
  | 'sheets_auth_failed'
  | 'sheet_not_found'
  | 'ids_master_not_found'
  | 'ids_master_empty'
  | 'relic_workbook_not_found'
  | 'relic_workbook_access_denied'
  | 'relic_tab_not_found'
  | 'no_relic_rows'
  | 'sheets_api_error'
  | 'unknown'

export type EffectivePathsExportResult = {
  ok: true
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  relicsWorkbookId: string
}

export type EffectivePathsListResult = {
  ok: true
  workbooks: EffectivePathsLinkedWorkbook[]
  idsTabTitle: string
  relicsWorkbook: EffectivePathsLinkedWorkbook | null
  relicsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  workbookAccess: LinkedWorkbookAccess[]
}

async function parseApiError(res: Response, body: unknown): Promise<{
  error: EffectivePathsExportError
  message?: string
}> {
  const code = body && typeof body === 'object' && 'error' in body ? body.error : undefined
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : undefined
  return {
    error: isExportError(code) ? code : res.status === 0 ? 'network' : 'unknown',
    message,
  }
}

export async function listEffectivePathsWorkbooks(options: {
  googleAccessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<
  | EffectivePathsListResult
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  try {
    const res = await fetch(`${API_BASE}/effective-paths/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Google-Access-Token': options.googleAccessToken,
      },
      body: JSON.stringify({
        masterSpreadsheetId: options.masterSpreadsheetId,
        sheetGid: options.sheetGid,
      }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const err = await parseApiError(res, body)
      return { ok: false, ...err }
    }

    if (!body || typeof body !== 'object' || !('workbooks' in body)) {
      return { ok: false, error: 'unknown' }
    }

    const parsed = body as EffectivePathsListResult
    const access = (parsed as { relicsWorkbookAccess?: unknown }).relicsWorkbookAccess
    const relicsWorkbookAccess =
      access === 'ok' || access === 'denied' || access === 'not_found' ? access : null
    const rawAccess = (parsed as { workbookAccess?: unknown }).workbookAccess
    const workbookAccess = Array.isArray(rawAccess)
      ? rawAccess.filter(
          (row): row is LinkedWorkbookAccess =>
            row != null &&
            typeof row === 'object' &&
            typeof (row as LinkedWorkbookAccess).name === 'string' &&
            typeof (row as LinkedWorkbookAccess).spreadsheetId === 'string' &&
            ((row as LinkedWorkbookAccess).access === 'ok' ||
              (row as LinkedWorkbookAccess).access === 'denied' ||
              (row as LinkedWorkbookAccess).access === 'not_found'),
        )
      : []

    return {
      ok: true,
      workbooks: parsed.workbooks,
      idsTabTitle: typeof parsed.idsTabTitle === 'string' ? parsed.idsTabTitle : 'IDS',
      relicsWorkbook:
        parsed.relicsWorkbook &&
        typeof parsed.relicsWorkbook === 'object' &&
        typeof parsed.relicsWorkbook.spreadsheetId === 'string'
          ? parsed.relicsWorkbook
          : null,
      relicsWorkbookAccess,
      workbookAccess,
    }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function exportRelicsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  /** When set, syncs this Relics workbook instead of resolving from IDS Master. */
  relicsSpreadsheetId?: string | null
  relicsSheetGid?: number | null
  relicOwnedIds: readonly string[]
}): Promise<
  | { ok: true; result: EffectivePathsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  try {
    const res = await fetch(`${API_BASE}/effective-paths/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Google-Access-Token': options.googleAccessToken,
      },
      body: JSON.stringify({
        masterSpreadsheetId: options.masterSpreadsheetId ?? null,
        masterSheetGid: options.masterSheetGid ?? null,
        spreadsheetId: options.relicsSpreadsheetId ?? null,
        sheetGid: options.relicsSheetGid ?? null,
        relicOwnedIds: options.relicOwnedIds,
      }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const err = await parseApiError(res, body)
      return { ok: false, ...err }
    }

    if (!body || typeof body !== 'object' || !('matchedRows' in body)) {
      return { ok: false, error: 'unknown' }
    }

    return { ok: true, result: body as EffectivePathsExportResult }
  } catch {
    return { ok: false, error: 'network' }
  }
}

function isExportError(value: unknown): value is EffectivePathsExportError {
  return (
    value === 'invalid_spreadsheet' ||
    value === 'sheets_auth_failed' ||
    value === 'sheet_not_found' ||
    value === 'ids_master_not_found' ||
    value === 'ids_master_empty' ||
    value === 'relic_workbook_not_found' ||
    value === 'relic_workbook_access_denied' ||
    value === 'relic_tab_not_found' ||
    value === 'no_relic_rows' ||
    value === 'sheets_api_error' ||
    value === 'network' ||
    value === 'unknown'
  )
}
