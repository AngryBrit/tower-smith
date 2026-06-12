import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { GoogleSheetsApiError } from './lib/googleSheets'
import { readIdsGatewayLookup } from './lib/idsMasterSheets'
import { filterKnownIdsWorkbooks } from '../../src/effectivePaths/effectivePathsIdsWorkbooks'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'
import { parseEffectivePathsMasterBody } from './lib/parseEffectivePathsMasterBody'

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

  const parsed = parseEffectivePathsMasterBody(raw)
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
    return jsonResponse(
      200,
      {
        ok: true,
        workbooks: filterKnownIdsWorkbooks(gateway.workbooks),
        idsTabTitle: gateway.idsTabTitle,
        relicsWorkbook: gateway.relicsWorkbook,
        themesWorkbook: gateway.themesWorkbook,
        cardsWorkbook: gateway.cardsWorkbook,
        workshopWorkbook: gateway.workshopWorkbook,
        botsWorkbook: gateway.botsWorkbook,
        laboratoryWorkbook: gateway.laboratoryWorkbook,
        uwsWorkbook: gateway.uwsWorkbook,
        guardiansWorkbook: gateway.guardiansWorkbook,
        modulesWorkbook: gateway.modulesWorkbook,
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
  path: '/api/effective-paths/ids-gateway',
}
