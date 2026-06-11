import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import {
  importBotsFromGoogleSheet,
  importCardsFromGoogleSheet,
  importModulesFromGoogleSheet,
  importRelicsFromGoogleSheet,
  importThemesFromGoogleSheet,
  importUwsFromGoogleSheet,
} from './lib/effectivePathsImportSheets'
import { jsonResponse } from './lib/http'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'
import {
  GoogleSheetsApiError,
  importLabsFromGoogleSheet,
  importWorkshopFromGoogleSheet,
} from './lib/googleSheets'

type ImportSyncTarget =
  | 'relics'
  | 'themes'
  | 'cards'
  | 'workshop'
  | 'bots'
  | 'labs'
  | 'uws'
  | 'modules'

const IMPORT_SYNC_TARGETS = new Set<ImportSyncTarget>([
  'relics',
  'themes',
  'cards',
  'workshop',
  'bots',
  'labs',
  'uws',
  'modules',
])

function parseBody(raw: unknown):
  | {
      ok: true
      syncTarget: ImportSyncTarget
      masterSpreadsheetId: string | null
      masterSheetGid: number | null
      spreadsheetId: string | null
      sheetGid: number | null
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

  const syncTargetRaw = (raw as { syncTarget?: unknown }).syncTarget
  if (typeof syncTargetRaw !== 'string' || !IMPORT_SYNC_TARGETS.has(syncTargetRaw as ImportSyncTarget)) {
    return { ok: false, error: 'invalid_json' }
  }

  return {
    ok: true,
    syncTarget: syncTargetRaw as ImportSyncTarget,
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetId,
    sheetGid,
  }
}

function mapImportError(syncTarget: ImportSyncTarget, message: string | undefined): string {
  if (syncTarget === 'relics') {
    if (message === 'no_relic_rows') return 'no_relic_rows'
    if (message === 'relic_workbook_not_found') return 'relic_workbook_not_found'
    if (message === 'relic_workbook_access_denied') return 'relic_workbook_access_denied'
    if (message === 'relic_tab_not_found') return 'relic_tab_not_found'
  }
  if (syncTarget === 'themes') {
    if (message === 'no_theme_rows') return 'no_theme_rows'
    if (message === 'themes_workbook_not_found') return 'themes_workbook_not_found'
    if (message === 'themes_workbook_access_denied') return 'themes_workbook_access_denied'
    if (message === 'themes_tab_not_found') return 'themes_tab_not_found'
  }
  if (syncTarget === 'cards') {
    if (message === 'no_card_rows') return 'no_card_rows'
    if (message === 'no_card_preset_rows') return 'no_card_preset_rows'
    if (message === 'cards_workbook_not_found') return 'cards_workbook_not_found'
    if (message === 'cards_workbook_access_denied') return 'cards_workbook_access_denied'
    if (message === 'cards_tab_not_found') return 'cards_tab_not_found'
  }
  if (syncTarget === 'workshop') {
    if (message === 'no_workshop_rows') return 'no_workshop_rows'
    if (message === 'workshop_workbook_not_found') return 'workshop_workbook_not_found'
    if (message === 'workshop_workbook_access_denied') return 'workshop_workbook_access_denied'
    if (message === 'workshop_tab_not_found') return 'workshop_tab_not_found'
  }
  if (syncTarget === 'bots') {
    if (message === 'no_bot_rows') return 'no_bot_rows'
    if (message === 'bots_workbook_not_found') return 'bots_workbook_not_found'
    if (message === 'bots_workbook_access_denied') return 'bots_workbook_access_denied'
    if (message === 'bots_tab_not_found') return 'bots_tab_not_found'
  }
  if (syncTarget === 'labs') {
    if (message === 'no_lab_rows') return 'no_lab_rows'
    if (message === 'laboratory_workbook_not_found') return 'laboratory_workbook_not_found'
    if (message === 'laboratory_workbook_access_denied') return 'laboratory_workbook_access_denied'
    if (message === 'laboratory_tab_not_found') return 'laboratory_tab_not_found'
  }
  if (syncTarget === 'uws') {
    if (message === 'no_uws_rows') return 'no_uws_rows'
    if (message === 'uws_workbook_not_found') return 'uws_workbook_not_found'
    if (message === 'uws_workbook_access_denied') return 'uws_workbook_access_denied'
    if (message === 'uws_tab_not_found') return 'uws_tab_not_found'
  }
  if (syncTarget === 'modules') {
    if (message === 'no_modules_rows') return 'no_modules_rows'
    if (message === 'modules_workbook_not_found') return 'modules_workbook_not_found'
    if (message === 'modules_workbook_access_denied') return 'modules_workbook_access_denied'
    if (message === 'modules_tab_not_found') return 'modules_tab_not_found'
  }
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

  const sheetOptions = {
    accessToken: token,
    masterSpreadsheetId: parsed.masterSpreadsheetId,
    masterSheetGid: parsed.masterSheetGid,
    spreadsheetId: parsed.spreadsheetId,
    sheetGid: parsed.sheetGid,
  }

  try {
    switch (parsed.syncTarget) {
      case 'relics': {
        const result = await importRelicsFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'relics', ...result }, cors)
      }
      case 'themes': {
        const result = await importThemesFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'themes', ...result }, cors)
      }
      case 'cards': {
        const result = await importCardsFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'cards', ...result }, cors)
      }
      case 'workshop': {
        const result = await importWorkshopFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'workshop', ...result }, cors)
      }
      case 'bots': {
        const result = await importBotsFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'bots', ...result }, cors)
      }
      case 'labs': {
        const result = await importLabsFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'labs', ...result }, cors)
      }
      case 'uws': {
        const result = await importUwsFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'uws', ...result }, cors)
      }
      case 'modules': {
        const result = await importModulesFromGoogleSheet(sheetOptions)
        return jsonResponse(200, { ok: true, syncTarget: 'modules', ...result }, cors)
      }
    }
  } catch (err) {
    if (err instanceof GoogleSheetsApiError) {
      const mapped = mapImportError(parsed.syncTarget, err.message)
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
  path: '/api/effective-paths/import',
}
