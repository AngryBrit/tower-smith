export const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

export type SheetProperties = {
  sheetId: number
  title: string
  gridProperties?: {
    rowCount?: number
    columnCount?: number
  }
}

export class GoogleSheetsApiError extends Error {
  readonly status: number
  readonly reason: 'sheets_auth_failed' | 'sheet_not_found' | 'sheets_api_error'

  constructor(
    reason: 'sheets_auth_failed' | 'sheet_not_found' | 'sheets_api_error',
    status: number,
    message?: string,
  ) {
    super(message ?? reason)
    this.reason = reason
    this.status = status
  }
}

const SHEETS_FETCH_MAX_ATTEMPTS = 4
const SHEETS_FETCH_RETRY_BASE_MS = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sheetsFetch(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let lastResponse: Response | null = null
  for (let attempt = 0; attempt < SHEETS_FETCH_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${SHEETS_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    })
    lastResponse = response
    if (response.status !== 429 || attempt === SHEETS_FETCH_MAX_ATTEMPTS - 1) {
      return response
    }
    await sleep(SHEETS_FETCH_RETRY_BASE_MS * 2 ** attempt)
  }
  return lastResponse!
}

export type SpreadsheetAccess = 'ok' | 'denied' | 'not_found'

/** Lightweight check that the token can open a spreadsheet (metadata only). */
export async function checkSpreadsheetAccess(
  accessToken: string,
  spreadsheetId: string,
): Promise<SpreadsheetAccess> {
  const res = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId`,
  )
  if (res.status === 404) return 'not_found'
  if (res.status === 401 || res.status === 403) return 'denied'
  if (!res.ok) return 'denied'
  return 'ok'
}

export function throwIfSheetsAccessDenied(
  status: number,
  context:
    | 'ids_master'
    | 'relic_workbook'
    | 'themes_workbook'
    | 'cards_workbook'
    | 'workshop_workbook'
    | 'bots_workbook'
    | 'laboratory_workbook'
    | 'uws_workbook',
): void {
  if (status !== 401 && status !== 403) return
  if (context === 'relic_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'relic_workbook_access_denied')
  }
  if (context === 'themes_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'themes_workbook_access_denied')
  }
  if (context === 'cards_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'cards_workbook_access_denied')
  }
  if (context === 'workshop_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'workshop_workbook_access_denied')
  }
  if (context === 'bots_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'bots_workbook_access_denied')
  }
  if (context === 'laboratory_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'laboratory_workbook_access_denied')
  }
  if (context === 'uws_workbook') {
    throw new GoogleSheetsApiError('sheets_api_error', status, 'uws_workbook_access_denied')
  }
  throw new GoogleSheetsApiError('sheets_auth_failed', status)
}
