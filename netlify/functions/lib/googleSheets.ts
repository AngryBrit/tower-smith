import {
  buildRelicUnlockedUpdates,
  quoteSheetTitleForRange,
} from '../../../src/effectivePaths/buildRelicUnlockedUpdates'
import { buildThemeOwnedUpdates } from '../../../src/effectivePaths/buildThemeOwnedUpdates'
import {
  detectRelicSheetLayout,
  padSheetRowsToWidth,
  parseRelicRowsWithLayout,
  unmappedRelicNamesWithLayout,
} from '../../../src/effectivePaths/relicSheetLayout'
import {
  buildThemeSheetGridFromBlockRanges,
  detectThemeSheetLayout,
  parseThemeRowsWithLayout,
  themeSheetFetchRangesForGrid,
  unmappedThemeNamesWithLayout,
} from '../../../src/effectivePaths/themeSheetLayout'
import { pickEffectivePathsRelicTab } from '../../../src/effectivePaths/pickRelicTab'
import {
  isThemesInputTabCandidate,
  pickEffectivePathsThemesTab,
} from '../../../src/effectivePaths/pickThemesTab'
import { resolveRelicsWorkbookId, resolveThemesWorkbookId } from './idsMasterSheets'
import {
  GoogleSheetsApiError,
  sheetsFetch,
  throwIfSheetsAccessDenied,
  type SheetProperties,
} from './googleSheetsClient'

export { GoogleSheetsApiError } from './googleSheetsClient'

type SpreadsheetMetadata = {
  sheets?: { properties: SheetProperties }[]
}

export type ExportRelicsToSheetResult = {
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  relicsWorkbookId: string
}

export type ExportThemesToSheetResult = {
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  themesWorkbookId: string
}

function orderedRelicsWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const preferred = pickEffectivePathsRelicTab(sheets, sheetGid)
  const out: SheetProperties[] = []
  if (preferred) out.push(preferred)
  for (const sheet of sheets) {
    if (!out.some((tab) => tab.sheetId === sheet.properties.sheetId)) {
      out.push(sheet.properties)
    }
  }
  return out
}

async function readRelicTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string,
): Promise<string[][]> {
  const quoted = quoteSheetTitleForRange(tabTitle)
  const range = encodeURIComponent(`${quoted}!A:Z`)
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'relic_workbook')
  if (!valuesRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', valuesRes.status, await valuesRes.text())
  }
  const valuesBody = (await valuesRes.json()) as { values?: unknown[][] }
  return padSheetRowsToWidth(valuesBody.values ?? [], 26)
}

export async function exportRelicsToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  relicOwnedIds: readonly string[]
}): Promise<ExportRelicsToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let relicsWorkbookId = overrideId
  if (!relicsWorkbookId && options.masterSpreadsheetId) {
    relicsWorkbookId = await resolveRelicsWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!relicsWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(relicsWorkbookId)}?fields=sheets.properties`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'relic_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []

  let relicRows: ReturnType<typeof parseRelicRowsWithLayout> = []
  let layout: ReturnType<typeof detectRelicSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''

  for (const tab of orderedRelicsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    rawRows = await readRelicTabGrid(options.accessToken, relicsWorkbookId, tab.title)
    layout = detectRelicSheetLayout(rawRows)
    if (!layout) continue
    relicRows = parseRelicRowsWithLayout(rawRows, layout)
    if (relicRows.length > 0) {
      sheetTitle = tab.title
      break
    }
  }

  if (!layout || relicRows.length === 0 || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_relic_rows')
  }

  const owned = new Set(options.relicOwnedIds)
  const batch = buildRelicUnlockedUpdates(
    sheetTitle,
    relicRows,
    owned,
    layout.unlockedCol,
  )
  if (batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_relic_rows')
  }

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(relicsWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'relic_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows: relicRows.length,
    unmappedSheetNames: unmappedRelicNamesWithLayout(rawRows, layout),
    sheetTitle,
    relicsWorkbookId,
  }
}

function orderedThemesWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isThemesInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsThemesTab(sheets, null)
  const out: SheetProperties[] = []
  if (
    preferred &&
    isThemesInputTabCandidate(preferred.title, preferred.gridProperties)
  ) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

async function readThemeTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? 120
  const columnCount = tab.gridProperties?.columnCount ?? 26
  const slices = themeSheetFetchRangesForGrid(rowCount, columnCount)
  if (slices.length === 0) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const rangeParams = slices
    .map((slice) => `ranges=${encodeURIComponent(`${quoted}!${slice}`)}`)
    .join('&')
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangeParams}&valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'themes_workbook')
  if (!valuesRes.ok) {
    const body = await valuesRes.text()
    if (/exceeds grid limits/i.test(body)) return null
    throw new GoogleSheetsApiError('sheets_api_error', valuesRes.status, body)
  }
  const valuesBody = (await valuesRes.json()) as {
    valueRanges?: { range?: string; values?: unknown[][] }[]
  }
  const apiRanges = valuesBody.valueRanges ?? []
  const valueRanges = slices.map((slice) => {
    const expected = `${quoted}!${slice}`
    const hit = apiRanges.find(
      (block) => block.range === expected || block.range?.endsWith(`!${slice}`),
    )
    return { range: expected, values: hit?.values ?? [] }
  })
  return buildThemeSheetGridFromBlockRanges(valueRanges)
}

export async function exportThemesToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  themeOwnedIds: readonly string[]
}): Promise<ExportThemesToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let themesWorkbookId = overrideId
  if (!themesWorkbookId && options.masterSpreadsheetId) {
    themesWorkbookId = await resolveThemesWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!themesWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(themesWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'themes_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []

  let themeRows: ReturnType<typeof parseThemeRowsWithLayout> = []
  let layout: ReturnType<typeof detectThemeSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''

  for (const tab of orderedThemesWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readThemeTabGrid(options.accessToken, themesWorkbookId, tab)
    if (!grid) continue
    const tabLayout = detectThemeSheetLayout(grid)
    if (!tabLayout) continue
    const tabRows = parseThemeRowsWithLayout(grid, tabLayout)
    if (tabRows.length > themeRows.length) {
      themeRows = tabRows
      layout = tabLayout
      rawRows = grid
      sheetTitle = tab.title
    }
  }

  if (!layout || themeRows.length === 0 || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_theme_rows')
  }

  const owned = new Set(options.themeOwnedIds)
  const batch = buildThemeOwnedUpdates(sheetTitle, themeRows, owned)
  if (batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_theme_rows')
  }

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(themesWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'themes_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows: themeRows.length,
    unmappedSheetNames: unmappedThemeNamesWithLayout(rawRows, layout),
    sheetTitle,
    themesWorkbookId,
  }
}
