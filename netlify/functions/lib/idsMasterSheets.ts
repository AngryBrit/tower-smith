import { quoteSheetTitleForRange } from '../../../src/effectivePaths/buildRelicUnlockedUpdates'
import { padSheetRowsToWidth } from '../../../src/effectivePaths/relicSheetLayout'
import {
  findCardsWorkbook,
  findRelicsWorkbook,
  findThemesWorkbook,
  findWorkshopWorkbook,
} from '../../../src/effectivePaths/effectivePathsCategoryNames'
import { filterKnownIdsWorkbooks } from '../../../src/effectivePaths/effectivePathsIdsWorkbooks'
import { lookupRelicsWorkbookOnIdsGrid } from '../../../src/effectivePaths/lookupRelicsOnIdsGrid'
import { lookupCardsWorkbookOnIdsGrid } from '../../../src/effectivePaths/lookupCardsOnIdsGrid'
import { lookupWorkshopWorkbookOnIdsGrid } from '../../../src/effectivePaths/lookupWorkshopOnIdsGrid'
import { lookupThemesWorkbookOnIdsGrid } from '../../../src/effectivePaths/lookupThemesOnIdsGrid'
import {
  parseIdsMasterWorkbooks,
  type EffectivePathsLinkedWorkbook,
  type IdsMasterSheetGrid,
} from '../../../src/effectivePaths/parseIdsMasterWorkbooks'
import { orderedIdsMasterTabs } from '../../../src/effectivePaths/pickIdsMasterTab'
import { GoogleSheetsApiError, sheetsFetch, type SheetProperties } from './googleSheetsClient'

type SpreadsheetMetadata = {
  sheets?: { properties: SheetProperties }[]
}

type GridDataHyperlinkResponse = {
  sheets?: {
    data?: {
      rowData?: {
        values?: { hyperlink?: string }[]
      }[]
    }[]
  }[]
}

const IDS_TAB_GRID_WIDTH = 26

function alignColumnDHyperlinks(hyperlinks: string[], rowCount: number): string[] {
  const out = hyperlinks.slice(0, rowCount)
  while (out.length < rowCount) out.push('')
  return out
}

function padIdsMasterGrid(
  formatted: string[][],
  formulas: string[][],
  columnDHyperlinks: string[],
): IdsMasterSheetGrid {
  const maxRows = Math.max(formatted.length, formulas.length)
  const padRows = (rows: string[][]): string[][] => {
    const padded = padSheetRowsToWidth(rows, IDS_TAB_GRID_WIDTH)
    while (padded.length < maxRows) {
      padded.push(Array(IDS_TAB_GRID_WIDTH).fill(''))
    }
    return padded
  }
  const hyperlinks = [...columnDHyperlinks]
  while (hyperlinks.length < maxRows) hyperlinks.push('')
  return {
    formatted: padRows(formatted),
    formulas: padRows(formulas),
    columnDHyperlinks: hyperlinks,
  }
}

async function readColumnDHyperlinks(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string,
): Promise<string[]> {
  const quoted = quoteSheetTitleForRange(tabTitle)
  const range = encodeURIComponent(`${quoted}!D1:D500`)
  const fields = encodeURIComponent('sheets.data.rowData.values.hyperlink')
  const res = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}?includeGridData=true&ranges=${range}&fields=${fields}`,
  )
  if (res.status === 401 || res.status === 403) {
    throw new GoogleSheetsApiError('sheets_auth_failed', res.status)
  }
  if (!res.ok) return []

  const body = (await res.json()) as GridDataHyperlinkResponse
  const rowData = body.sheets?.[0]?.data?.[0]?.rowData ?? []
  return rowData.map((row) => row.values?.[0]?.hyperlink?.trim() ?? '')
}

async function readTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string,
): Promise<IdsMasterSheetGrid> {
  const quoted = quoteSheetTitleForRange(tabTitle)
  const range = encodeURIComponent(`${quoted}!A:Z`)
  const base = `/${encodeURIComponent(spreadsheetId)}/values/${range}`

  const [formattedRes, formulaRes, columnDHyperlinks] = await Promise.all([
    sheetsFetch(accessToken, `${base}?valueRenderOption=FORMATTED_VALUE`),
    sheetsFetch(accessToken, `${base}?valueRenderOption=FORMULA`),
    readColumnDHyperlinks(accessToken, spreadsheetId, tabTitle),
  ])

  if (formattedRes.status === 401 || formattedRes.status === 403) {
    throw new GoogleSheetsApiError('sheets_auth_failed', formattedRes.status)
  }
  if (!formattedRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', formattedRes.status, await formattedRes.text())
  }
  if (formulaRes.status === 401 || formulaRes.status === 403) {
    throw new GoogleSheetsApiError('sheets_auth_failed', formulaRes.status)
  }
  if (!formulaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', formulaRes.status, await formulaRes.text())
  }

  const formattedBody = (await formattedRes.json()) as { values?: string[][] }
  const formulaBody = (await formulaRes.json()) as { values?: string[][] }
  const formatted = formattedBody.values ?? []
  const formulas = formulaBody.values ?? []
  const rowCount = Math.max(formatted.length, formulas.length)

  return padIdsMasterGrid(
    formatted,
    formulas,
    alignColumnDHyperlinks(columnDHyperlinks, rowCount),
  )
}


export type IdsGatewayLookup = {
  idsTabTitle: string
  workbooks: EffectivePathsLinkedWorkbook[]
  relicsWorkbook: EffectivePathsLinkedWorkbook | null
  themesWorkbook: EffectivePathsLinkedWorkbook | null
  cardsWorkbook: EffectivePathsLinkedWorkbook | null
  workshopWorkbook: EffectivePathsLinkedWorkbook | null
}

function pickIdsGatewayTab(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties | null {
  const ordered = orderedIdsMasterTabs(sheets, sheetGid)
  return (
    ordered.find((tab) => /^ids$/i.test(tab.title.trim())) ??
    ordered.find((tab) => !/^home page$/i.test(tab.title.trim())) ??
    ordered[0] ??
    null
  )
}

export async function readIdsGatewayLookup(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<IdsGatewayLookup> {
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(options.masterSpreadsheetId)}?fields=sheets.properties`,
  )
  if (metaRes.status === 401 || metaRes.status === 403) {
    throw new GoogleSheetsApiError('sheets_auth_failed', metaRes.status)
  }
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  if (sheets.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'ids_master_empty')
  }

  const idsTab = pickIdsGatewayTab(sheets, options.sheetGid)
  if (!idsTab) {
    throw new GoogleSheetsApiError('sheet_not_found', 404, 'ids_master_tab_not_found')
  }

  const grid = await readTabGrid(options.accessToken, options.masterSpreadsheetId, idsTab.title)
  const workbooks = parseIdsMasterWorkbooks(grid)
  const relicsFromRow = lookupRelicsWorkbookOnIdsGrid(grid)
  const relicsWorkbook =
    relicsFromRow && filterKnownIdsWorkbooks([relicsFromRow])[0]
      ? relicsFromRow
      : findRelicsWorkbook(workbooks)
  const themesFromRow = lookupThemesWorkbookOnIdsGrid(grid)
  const themesWorkbook =
    themesFromRow && filterKnownIdsWorkbooks([themesFromRow])[0]
      ? themesFromRow
      : findThemesWorkbook(workbooks)
  const cardsFromRow = lookupCardsWorkbookOnIdsGrid(grid)
  const cardsWorkbook =
    cardsFromRow && filterKnownIdsWorkbooks([cardsFromRow])[0]
      ? cardsFromRow
      : findCardsWorkbook(workbooks)
  const workshopFromRow = lookupWorkshopWorkbookOnIdsGrid(grid)
  const workshopWorkbook =
    workshopFromRow && filterKnownIdsWorkbooks([workshopFromRow])[0]
      ? workshopFromRow
      : findWorkshopWorkbook(workbooks)

  if (
    workbooks.length === 0 &&
    !relicsWorkbook &&
    !themesWorkbook &&
    !cardsWorkbook &&
    !workshopWorkbook
  ) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'ids_master_empty')
  }

  return {
    idsTabTitle: idsTab.title,
    workbooks,
    relicsWorkbook,
    themesWorkbook,
    cardsWorkbook,
    workshopWorkbook,
  }
}

export async function readIdsMasterWorkbooks(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<EffectivePathsLinkedWorkbook[]> {
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(options.masterSpreadsheetId)}?fields=sheets.properties`,
  )
  if (metaRes.status === 401 || metaRes.status === 403) {
    throw new GoogleSheetsApiError('sheets_auth_failed', metaRes.status)
  }
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  if (sheets.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'ids_master_empty')
  }

  for (const tab of orderedIdsMasterTabs(sheets, options.sheetGid)) {
    const grid = await readTabGrid(options.accessToken, options.masterSpreadsheetId, tab.title)
    const workbooks = parseIdsMasterWorkbooks(grid)
    if (workbooks.length > 0) return workbooks
  }

  throw new GoogleSheetsApiError('sheets_api_error', 400, 'ids_master_empty')
}

export async function resolveRelicsWorkbookId(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<string> {
  const gateway = await readIdsGatewayLookup(options)
  if (!gateway.relicsWorkbook) {
    throw new GoogleSheetsApiError('sheets_api_error', 404, 'relic_workbook_not_found')
  }
  return gateway.relicsWorkbook.spreadsheetId
}

export async function resolveThemesWorkbookId(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<string> {
  const gateway = await readIdsGatewayLookup(options)
  if (!gateway.themesWorkbook) {
    throw new GoogleSheetsApiError('sheets_api_error', 404, 'themes_workbook_not_found')
  }
  return gateway.themesWorkbook.spreadsheetId
}

export async function resolveCardsWorkbookId(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<string> {
  const gateway = await readIdsGatewayLookup(options)
  if (!gateway.cardsWorkbook) {
    throw new GoogleSheetsApiError('sheets_api_error', 404, 'cards_workbook_not_found')
  }
  return gateway.cardsWorkbook.spreadsheetId
}

export async function resolveWorkshopWorkbookId(options: {
  accessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<string> {
  const gateway = await readIdsGatewayLookup(options)
  if (!gateway.workshopWorkbook) {
    throw new GoogleSheetsApiError('sheets_api_error', 404, 'workshop_workbook_not_found')
  }
  return gateway.workshopWorkbook.spreadsheetId
}
