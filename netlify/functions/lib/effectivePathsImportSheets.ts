import { quoteSheetTitleForRange } from '../../../src/effectivePaths/buildRelicUnlockedUpdates'
import { botsEpStateFromSheetGrid } from '../../../src/effectivePaths/botsEpStateFromSheet'
import { cardStateFromSheetRows } from '../../../src/effectivePaths/cardStateFromSheet'
import {
  detectCardPresetSheetLayout,
  parseCardPresetSlotsWithLayout,
} from '../../../src/effectivePaths/cardPresetSheetLayout'
import {
  detectCardSheetLayout,
  parseCardSheetRowsWithLayout,
  unmappedCardNamesWithLayout,
} from '../../../src/effectivePaths/cardSheetLayout'
import {
  detectRelicSheetLayout,
  parseRelicRowsWithLayout,
  unmappedRelicNamesWithLayout,
} from '../../../src/effectivePaths/relicSheetLayout'
import { relicOwnedIdsFromSheetRows } from '../../../src/effectivePaths/relicOwnedIdsFromSheet'
import { unmappedThemeNamesWithLayout } from '../../../src/effectivePaths/themeSheetLayout'
import {
  parseThemesSheetTab,
  pickThemesSheetForSync,
  themeOwnedIdsFromParsedThemesTabs,
} from '../../../src/effectivePaths/resolveThemesSheetTab'
import { modulesEpStateFromSheetGrid } from '../../../src/effectivePaths/modulesEpStateFromSheet'
import { resolveModuleEpInventoryLayout } from '../../../src/effectivePaths/moduleEpInventoryLayoutFromSheet'
import { uwsEpStateFromSheetGrid } from '../../../src/effectivePaths/uwsEpStateFromSheet'
import {
  parseBotLabRowsWithLayout,
  resolveBotSheetLayout,
  unmappedBotNamesWithLayout,
} from '../../../src/effectivePaths/botSheetLayout'
import { isModulesInputTabCandidate } from '../../../src/effectivePaths/pickModulesTab'
import { isUwsInputTabCandidate } from '../../../src/effectivePaths/pickUwsTab'
import {
  UW_EP_V31_LEVEL_FIRST_ROW,
  UW_EP_V31_LEVEL_LAST_ROW,
} from '../../../src/effectivePaths/uwEpSheetNames'
import {
  resolveBotsWorkbookId,
  resolveCardsWorkbookId,
  resolveModulesWorkbookId,
  resolveRelicsWorkbookId,
  resolveThemesWorkbookId,
  resolveUwsWorkbookId,
} from './idsMasterSheets'
import {
  orderedBotsWorkbookTabs,
  orderedCardPresetWorkbookTabs,
  orderedCardsWorkbookTabs,
  orderedModulesWorkbookTabs,
  orderedRelicsWorkbookTabs,
  orderedThemesWorkbookTabs,
  orderedUwsWorkbookTabs,
  readBotsTabGrid,
  readCardPresetTabGrid,
  readCardTabGrid,
  readRelicTabGrid,
  readThemeTabGrid,
} from './googleSheets'
import {
  GoogleSheetsApiError,
  sheetsFetch,
  throwIfSheetsAccessDenied,
  type SheetProperties,
} from './googleSheetsClient'

type SpreadsheetMetadata = {
  sheets?: { properties: SheetProperties }[]
}

type WorkbookResolveOptions = {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
}

async function resolveWorkbookId(
  options: WorkbookResolveOptions,
  resolve: (opts: {
    accessToken: string
    masterSpreadsheetId: string
    sheetGid: number | null
  }) => Promise<string>,
): Promise<string> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  if (overrideId) return overrideId
  if (!options.masterSpreadsheetId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }
  return resolve({
    accessToken: options.accessToken,
    masterSpreadsheetId: options.masterSpreadsheetId,
    sheetGid: options.masterSheetGid ?? null,
  })
}

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

async function readUwsImportGrid(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<string[][]> {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const firstRow = UW_EP_V31_LEVEL_FIRST_ROW
  const lastRow = UW_EP_V31_LEVEL_LAST_ROW
  const rangeParams = [
    `${quoted}!C${firstRow}:C${lastRow}`,
    `${quoted}!D${firstRow}:D${lastRow}`,
    `${quoted}!G${firstRow}:G${lastRow}`,
  ]
    .map((range) => `ranges=${encodeURIComponent(range)}`)
    .join('&')
  const batchRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangeParams}&valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(batchRes.status, 'uws_workbook')
  if (!batchRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', batchRes.status, await batchRes.text())
  }
  const batchBody = (await batchRes.json()) as {
    valueRanges?: { range?: string; values?: unknown[][] }[]
  }
  const valueRanges = batchBody.valueRanges ?? []
  const cValues = valueRanges.find((entry) => /!C\d/i.test(entry.range ?? ''))?.values ?? []
  const dValues = valueRanges.find((entry) => /!D\d/i.test(entry.range ?? ''))?.values ?? []
  const gValues = valueRanges.find((entry) => /!G\d/i.test(entry.range ?? ''))?.values ?? []
  const rowCount = UW_EP_V31_LEVEL_LAST_ROW
  const grid: string[][] = Array.from({ length: rowCount }, () => Array(8).fill(''))
  for (let i = 0; i < cValues.length; i += 1) {
    grid[UW_EP_V31_LEVEL_FIRST_ROW - 1 + i]![2] = cellValueToString(cValues[i]?.[0])
  }
  for (let i = 0; i < dValues.length; i += 1) {
    grid[UW_EP_V31_LEVEL_FIRST_ROW - 1 + i]![3] = cellValueToString(dValues[i]?.[0])
  }
  for (let i = 0; i < gValues.length; i += 1) {
    grid[UW_EP_V31_LEVEL_FIRST_ROW - 1 + i]![6] = cellValueToString(gValues[i]?.[0])
  }
  return grid
}

export type ImportRelicsFromSheetResult = {
  relicOwnedIds: string[]
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  relicsWorkbookId: string
}

export async function importRelicsFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportRelicsFromSheetResult> {
  const relicsWorkbookId = await resolveWorkbookId(options, resolveRelicsWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(relicsWorkbookId)}?fields=sheets.properties`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'relic_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

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

  return {
    relicOwnedIds: relicOwnedIdsFromSheetRows(relicRows, rawRows, layout),
    matchedRows: relicRows.length,
    unmappedSheetNames: unmappedRelicNamesWithLayout(rawRows, layout),
    sheetTitle,
    relicsWorkbookId,
  }
}

export type ImportThemesFromSheetResult = {
  themeOwnedIds: string[]
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  themesWorkbookId: string
}

export async function importThemesFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportThemesFromSheetResult> {
  const themesWorkbookId = await resolveWorkbookId(options, resolveThemesWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(themesWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'themes_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  const parsedTabs = []
  const themeTabCandidates = orderedThemesWorkbookTabs(sheets, options.sheetGid ?? null)
  const maxThemeImportTabs = 2
  for (let index = 0; index < themeTabCandidates.length && index < maxThemeImportTabs; index += 1) {
    const tab = themeTabCandidates[index]!
    const grid = await readThemeTabGrid(options.accessToken, themesWorkbookId, tab)
    if (!grid) continue
    const parsed = parseThemesSheetTab(tab.title, grid)
    if (parsed) parsedTabs.push(parsed)
  }

  const primary = pickThemesSheetForSync(parsedTabs)
  if (!primary) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_theme_rows')
  }

  return {
    themeOwnedIds: themeOwnedIdsFromParsedThemesTabs(parsedTabs),
    matchedRows: primary.themeRows.length,
    unmappedSheetNames: unmappedThemeNamesWithLayout(primary.rawRows, primary.layout),
    sheetTitle: primary.sheetTitle,
    themesWorkbookId,
  }
}

export type ImportCardsFromSheetResult = {
  cardStars: Record<string, number>
  cardEquipSlots: number
  cardMasteryUnlockedIds: string[]
  cardPresetLoadouts: ReturnType<typeof cardStateFromSheetRows>['cardPresetLoadouts']
  matchedRows: number
  presetMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  presetSheetTitle: string | null
  cardsWorkbookId: string
}

export async function importCardsFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportCardsFromSheetResult> {
  const cardsWorkbookId = await resolveWorkbookId(options, resolveCardsWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(cardsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'cards_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  let cardRows: ReturnType<typeof parseCardSheetRowsWithLayout> = []
  let layout: ReturnType<typeof detectCardSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''

  for (const tab of orderedCardsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readCardTabGrid(options.accessToken, cardsWorkbookId, tab)
    if (!grid) continue
    const tabLayout = detectCardSheetLayout(grid)
    if (!tabLayout) continue
    const tabRows = parseCardSheetRowsWithLayout(grid, tabLayout)
    if (tabRows.length > cardRows.length) {
      cardRows = tabRows
      layout = tabLayout
      rawRows = grid
      sheetTitle = tab.title
    }
  }

  if (!layout || cardRows.length === 0 || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_card_rows')
  }

  let presetGrid: string[][] = []
  let presetSheetTitle: string | null = null
  let presetSlots: ReturnType<typeof parseCardPresetSlotsWithLayout> = []

  for (const tab of orderedCardPresetWorkbookTabs(sheets, null)) {
    const grid = await readCardPresetTabGrid(options.accessToken, cardsWorkbookId, tab)
    if (!grid) continue
    const presetLayout = detectCardPresetSheetLayout(grid)
    if (!presetLayout) continue
    presetGrid = grid
    presetSheetTitle = tab.title
    presetSlots = parseCardPresetSlotsWithLayout(presetLayout)
    break
  }

  const cardState = cardStateFromSheetRows(cardRows, rawRows, layout, presetSlots, presetGrid)
  let presetMatchedRows = 0
  for (const loadout of cardState.cardPresetLoadouts) {
    presetMatchedRows += loadout.length
  }

  return {
    ...cardState,
    matchedRows: cardRows.length,
    presetMatchedRows,
    unmappedSheetNames: unmappedCardNamesWithLayout(rawRows, layout),
    sheetTitle,
    presetSheetTitle,
    cardsWorkbookId,
  }
}

export type ImportBotsFromSheetResult = {
  botsEpState: ReturnType<typeof botsEpStateFromSheetGrid>
  matchedRows: number
  labMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  botsWorkbookId: string
}

export async function importBotsFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportBotsFromSheetResult> {
  const botsWorkbookId = await resolveWorkbookId(options, resolveBotsWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(botsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'bots_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  let layout: ReturnType<typeof resolveBotSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''
  let labRows: ReturnType<typeof parseBotLabRowsWithLayout> = []

  for (const tab of orderedBotsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readBotsTabGrid(options.accessToken, botsWorkbookId, tab)
    if (!grid) continue
    const tabLayout = resolveBotSheetLayout(grid)
    if (!tabLayout) continue
    const tabLabRows = parseBotLabRowsWithLayout(grid, tabLayout)
    if (tabLabRows.length >= labRows.length) {
      layout = tabLayout
      rawRows = grid
      sheetTitle = tab.title
      labRows = tabLabRows
    }
  }

  if (!layout || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_bot_rows')
  }

  const botsEpState = botsEpStateFromSheetGrid(rawRows, labRows, layout)

  return {
    botsEpState,
    matchedRows: Object.keys(botsEpState.levels).length,
    labMatchedRows: labRows.length,
    unmappedSheetNames: unmappedBotNamesWithLayout(rawRows, layout),
    sheetTitle,
    botsWorkbookId,
  }
}

export type ImportUwsFromSheetResult = {
  uwsEpState: ReturnType<typeof uwsEpStateFromSheetGrid>
  matchedRows: number
  sheetTitle: string
  uwsWorkbookId: string
}

export async function importUwsFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportUwsFromSheetResult> {
  const uwsWorkbookId = await resolveWorkbookId(options, resolveUwsWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(uwsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'uws_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  let sheetTitle = ''

  for (const tab of orderedUwsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    if (isUwsInputTabCandidate(tab.title, tab.gridProperties)) {
      sheetTitle = tab.title
      break
    }
  }

  if (!sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'uws_tab_not_found')
  }

  const rawRows = await readUwsImportGrid(options.accessToken, uwsWorkbookId, sheetTitle)
  const uwsEpState = uwsEpStateFromSheetGrid(rawRows)

  return {
    uwsEpState,
    matchedRows: Object.keys(uwsEpState.levels).length,
    sheetTitle,
    uwsWorkbookId,
  }
}

export type ImportModulesFromSheetResult = {
  modulesEpState: ReturnType<typeof modulesEpStateFromSheetGrid>
  matchedRows: number
  matchedSubstats: number
  sheetTitle: string
  modulesWorkbookId: string
}

export async function importModulesFromGoogleSheet(
  options: WorkbookResolveOptions & { sheetGid?: number | null },
): Promise<ImportModulesFromSheetResult> {
  const modulesWorkbookId = await resolveWorkbookId(options, resolveModulesWorkbookId)
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(modulesWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'modules_workbook')
  if (!metaRes.ok) throw new GoogleSheetsApiError('sheets_api_error', metaRes.status)

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  let sheetTitle = ''

  for (const tab of orderedModulesWorkbookTabs(sheets, options.sheetGid ?? null)) {
    if (isModulesInputTabCandidate(tab.title, tab.gridProperties)) {
      sheetTitle = tab.title
      break
    }
  }

  if (!sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'modules_tab_not_found')
  }

  const quotedTitle = quoteSheetTitleForRange(sheetTitle)
  const gridRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(modulesWorkbookId)}/values/${encodeURIComponent(`${quotedTitle}!A1:AS55`)}?valueRenderOption=FORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(gridRes.status, 'modules_workbook')
  if (!gridRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', gridRes.status, await gridRes.text())
  }
  const gridBody = (await gridRes.json()) as { values?: unknown[][] }
  const layout = resolveModuleEpInventoryLayout(gridBody.values ?? [])
  const modulesEpState = modulesEpStateFromSheetGrid(gridBody.values ?? [], layout)
  let matchedSubstats = 0
  for (const mod of modulesEpState.modules) {
    matchedSubstats += mod.substats.length
  }

  return {
    modulesEpState,
    matchedRows: modulesEpState.modules.length,
    matchedSubstats,
    sheetTitle,
    modulesWorkbookId,
  }
}
