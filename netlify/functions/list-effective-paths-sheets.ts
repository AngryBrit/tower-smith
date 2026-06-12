import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { GoogleSheetsApiError } from './lib/googleSheets'
import { authorizeLinkedWorkbooks } from './lib/authorizeLinkedWorkbooks'
import { readIdsGatewayLookup } from './lib/idsMasterSheets'
import {
  isBotsWorkbookName,
  isLaboratoryWorkbookName,
  isUwsWorkbookName,
  isGuardiansWorkbookName,
  isModulesWorkbookName,
  isCardsWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
  isWorkshopWorkbookName,
} from '../../src/effectivePaths/effectivePathsCategoryNames'
import {
  filterKnownIdsWorkbooks,
  isKnownIdsWorkbookName,
} from '../../src/effectivePaths/effectivePathsIdsWorkbooks'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'

function parseBody(raw: unknown):
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
    const gateway = await readIdsGatewayLookup({
      accessToken: token,
      masterSpreadsheetId: parsed.masterSpreadsheetId,
      sheetGid: parsed.sheetGid,
    })
    const workbooksToAuthorize = filterKnownIdsWorkbooks([
      ...gateway.workbooks,
      ...(gateway.relicsWorkbook ? [gateway.relicsWorkbook] : []),
      ...(gateway.themesWorkbook ? [gateway.themesWorkbook] : []),
      ...(gateway.cardsWorkbook ? [gateway.cardsWorkbook] : []),
      ...(gateway.workshopWorkbook ? [gateway.workshopWorkbook] : []),
      ...(gateway.botsWorkbook ? [gateway.botsWorkbook] : []),
      ...(gateway.laboratoryWorkbook ? [gateway.laboratoryWorkbook] : []),
      ...(gateway.uwsWorkbook ? [gateway.uwsWorkbook] : []),
      ...(gateway.guardiansWorkbook ? [gateway.guardiansWorkbook] : []),
      ...(gateway.modulesWorkbook ? [gateway.modulesWorkbook] : []),
    ])
    const workbookAccess = (
      await authorizeLinkedWorkbooks(token, workbooksToAuthorize)
    ).filter((row) => isKnownIdsWorkbookName(row.name))
    const relicsWorkbookAccess =
      workbookAccess.find((row) => isRelicsWorkbookName(row.name))?.access ?? null
    const themesWorkbookAccess =
      workbookAccess.find((row) => isThemesWorkbookName(row.name))?.access ?? null
    const cardsWorkbookAccess =
      workbookAccess.find((row) => isCardsWorkbookName(row.name))?.access ?? null
    const workshopWorkbookAccess =
      workbookAccess.find((row) => isWorkshopWorkbookName(row.name))?.access ?? null
    const botsWorkbookAccess =
      workbookAccess.find((row) => isBotsWorkbookName(row.name))?.access ?? null
    const laboratoryWorkbookAccess =
      workbookAccess.find((row) => isLaboratoryWorkbookName(row.name))?.access ?? null
    const uwsWorkbookAccess =
      workbookAccess.find((row) => isUwsWorkbookName(row.name))?.access ?? null
    const guardiansWorkbookAccess =
      workbookAccess.find((row) => isGuardiansWorkbookName(row.name))?.access ?? null
    const modulesWorkbookAccess =
      workbookAccess.find((row) => isModulesWorkbookName(row.name))?.access ?? null
    return jsonResponse(
      200,
      {
        ok: true,
        workbooks: filterKnownIdsWorkbooks(gateway.workbooks),
        idsTabTitle: gateway.idsTabTitle,
        relicsWorkbook: gateway.relicsWorkbook,
        relicsWorkbookAccess,
        themesWorkbook: gateway.themesWorkbook,
        themesWorkbookAccess,
        cardsWorkbook: gateway.cardsWorkbook,
        cardsWorkbookAccess,
        workshopWorkbook: gateway.workshopWorkbook,
        workshopWorkbookAccess,
        botsWorkbook: gateway.botsWorkbook,
        botsWorkbookAccess,
        laboratoryWorkbook: gateway.laboratoryWorkbook,
        laboratoryWorkbookAccess,
        uwsWorkbook: gateway.uwsWorkbook,
        uwsWorkbookAccess,
        guardiansWorkbook: gateway.guardiansWorkbook,
        guardiansWorkbookAccess,
        modulesWorkbook: gateway.modulesWorkbook,
        modulesWorkbookAccess,
        workbookAccess,
      },
      cors,
    )
  } catch (err) {
    if (err instanceof GoogleSheetsApiError) {
      if (err.message === 'ids_master_empty') {
        return jsonResponse(400, { error: 'ids_master_empty' }, cors)
      }
      if (err.message === 'ids_master_tab_not_found') {
        return jsonResponse(404, { error: 'ids_master_not_found' }, cors)
      }
      const status = err.reason === 'sheets_auth_failed' ? 401 : err.status >= 400 ? err.status : 502
      const detail = summarizeGoogleSheetsApiError(err.message) ?? err.message
      return jsonResponse(status, { error: err.reason, message: detail }, cors)
    }
    return jsonResponse(502, { error: 'sheets_api_error' }, cors)
  }
}

export const config: Config = {
  path: '/api/effective-paths/list',
}
