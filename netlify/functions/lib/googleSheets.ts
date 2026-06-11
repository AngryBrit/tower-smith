import {
  buildRelicUnlockedUpdates,
  quoteSheetTitleForRange,
} from '../../../src/effectivePaths/buildRelicUnlockedUpdates'
import { buildCardPresetSheetUpdates } from '../../../src/effectivePaths/buildCardPresetSheetUpdates'
import { buildCardSheetUpdates } from '../../../src/effectivePaths/buildCardSheetUpdates'
import {
  buildBotFarmingLevelCellUpdates,
  buildBotSheetUpdates,
  type BotFarmingLevelCellUpdate,
} from '../../../src/effectivePaths/buildBotSheetUpdates'
import {
  buildUwFarmingLevelCellUpdates,
  buildUwSheetUpdates,
  type UwFarmingLevelCellUpdate,
} from '../../../src/effectivePaths/buildUwSheetUpdates'
import {
  buildModuleSheetUpdates,
  countModulesEpEquippedSlots,
  countModulesEpEquippedSubstats,
} from '../../../src/effectivePaths/buildModuleSheetUpdates'
import { resolveModuleEpInventoryLayout } from '../../../src/effectivePaths/moduleEpInventoryLayoutFromSheet'
import type { ModulesEpSyncState } from '../../../src/effectivePaths/modulesEpStateFromPersisted'
import type { UwsEpSyncState } from '../../../src/effectivePaths/uwsEpStateFromPersisted'
import {
  UW_EP_V31_LEVEL_FIRST_ROW,
  UW_EP_V31_LEVEL_LAST_ROW,
} from '../../../src/effectivePaths/uwEpSheetNames'
import {
  BOT_EP_V31_FARMING_LEVEL_FIRST_ROW,
  BOT_EP_V31_FARMING_LEVEL_LAST_ROW,
} from '../../../src/effectivePaths/botSheetNames'
import { buildLabSheetUpdates } from '../../../src/effectivePaths/buildLabSheetUpdates'
import {
  buildWorkshopEnhanceSheetUpdates,
  buildWorkshopSheetUpdates,
} from '../../../src/effectivePaths/buildWorkshopSheetUpdates'
import type { BotsEpSyncState } from '../../../src/effectivePaths/botsEpStateFromPersisted'
import {
  BOT_FARMING_LEVEL_COL,
  BOT_SHEET_GRID_ROWS,
  buildBotSheetGridFromBlockRange,
  botSheetBlockFetchRangeForGrid,
  parseBotHeaderRowsWithLayout,
  parseBotLabRowsWithLayout,
  parseBotStatRowsWithLayout,
  resolveBotSheetLayout,
  unmappedBotNamesWithLayout,
} from '../../../src/effectivePaths/botSheetLayout'
import {
  buildCardPresetSheetGridFromColumnRanges,
  cardPresetSheetFetchRangesForGrid,
  defaultCardPresetSheetLayout,
  detectCardPresetSheetLayout,
  isCardPresetSheetTitle,
  parseCardPresetSlotsWithLayout,
} from '../../../src/effectivePaths/cardPresetSheetLayout'
import { buildThemeOwnedUpdates } from '../../../src/effectivePaths/buildThemeOwnedUpdates'
import {
  effectivePathsCardPresetDropdownLabels,
  effectivePathsCardSheetLabelsFromCardRows,
  effectivePathsCardSheetLabelsFromPresetGrid,
  mergeEffectivePathsCardSheetLabels,
} from '../../../src/effectivePaths/cardSheetNames'
import {
  buildCardSheetGridFromColumnRanges,
  cardSheetFetchRangesForGrid,
  detectCardSheetLayout,
  parseCardSheetRowsWithLayout,
  unmappedCardNamesWithLayout,
} from '../../../src/effectivePaths/cardSheetLayout'
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
  isCardPresetInputTabCandidate,
  isCardPresetTabExcluded,
  pickEffectivePathsCardPresetTab,
} from '../../../src/effectivePaths/pickCardPresetTab'
import {
  isCardsInputTabCandidate,
  pickEffectivePathsCardsTab,
} from '../../../src/effectivePaths/pickCardsTab'
import {
  buildWorkshopSheetGridFromColumnRanges,
  detectWorkshopEnhanceSheetLayout,
  detectWorkshopSheetLayout,
  parseWorkshopEnhanceSheetRowsWithLayout,
  parseWorkshopSheetRowsWithLayout,
  unmappedWorkshopEnhanceNamesWithLayout,
  unmappedWorkshopNamesWithLayout,
  workshopSheetFetchRangesForGrid,
} from '../../../src/effectivePaths/workshopSheetLayout'
import {
  buildLabSheetGridFromBlockRange,
  detectLabSheetBlocks,
  labSheetBlockFetchRangeForGrid,
  LAB_SHEET_GRID_ROWS,
  parseLabSheetRowsWithLayout,
  unmappedLabNamesWithLayout,
} from '../../../src/effectivePaths/labSheetLayout'
import { labsLevelOverridesFromSheetRows } from '../../../src/effectivePaths/labsLevelOverridesFromSheet'
import { workshopLevelsFromSheetRows } from '../../../src/effectivePaths/workshopLevelsFromSheet'
import { sanitizeLevelOverrides } from '../../../src/labLevelOverridesSanitize'
import { buildLabSheetNameIndex } from '../../../src/effectivePaths/labSheetNames'
import {
  isLaboratoryInputTabCandidate,
  pickEffectivePathsLaboratoryTab,
} from '../../../src/effectivePaths/pickLaboratoryTab'
import {
  isBotsInputTabCandidate,
  pickEffectivePathsBotsTab,
} from '../../../src/effectivePaths/pickBotsTab'
import {
  isModulesInputTabCandidate,
  pickEffectivePathsModulesTab,
} from '../../../src/effectivePaths/pickModulesTab'
import {
  isUwsInputTabCandidate,
  pickEffectivePathsUwsTab,
} from '../../../src/effectivePaths/pickUwsTab'
import {
  isWorkshopInputTabCandidate,
  pickEffectivePathsWorkshopTab,
} from '../../../src/effectivePaths/pickWorkshopTab'
import {
  isThemesInputTabCandidate,
  pickEffectivePathsThemesTab,
} from '../../../src/effectivePaths/pickThemesTab'
import {
  resolveBotsWorkbookId,
  resolveCardsWorkbookId,
  resolveLaboratoryWorkbookId,
  resolveUwsWorkbookId,
  resolveModulesWorkbookId,
  resolveRelicsWorkbookId,
  resolveThemesWorkbookId,
  resolveWorkshopWorkbookId,
} from './idsMasterSheets'
import { loadBundledResearchData } from './researchData'
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

export type ExportCardsToSheetResult = {
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  cardsWorkbookId: string
  presetSheetTitle: string | null
  presetMatchedRows: number
  presetUpdatedCells: number
}

export type ExportWorkshopToSheetResult = {
  updatedCells: number
  matchedRows: number
  enhanceMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  workshopWorkbookId: string
}

export type ExportBotsToSheetResult = {
  updatedCells: number
  matchedRows: number
  labMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  botsWorkbookId: string
}

export function orderedRelicsWorkbookTabs(
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

export async function readRelicTabGrid(
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

export function orderedThemesWorkbookTabs(
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

export async function readThemeTabGrid(
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

export function orderedCardsWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isCardsInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsCardsTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isCardsInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

export async function readCardTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? 60
  const columnCount = tab.gridProperties?.columnCount ?? 8
  const slices = cardSheetFetchRangesForGrid(rowCount, columnCount)
  if (slices.length === 0) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const rangeParams = slices
    .map((slice) => `ranges=${encodeURIComponent(`${quoted}!${slice}`)}`)
    .join('&')
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangeParams}&valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'cards_workbook')
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
  return buildCardSheetGridFromColumnRanges(valueRanges)
}

function orderedWorkshopWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isWorkshopInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsWorkshopTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isWorkshopInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

async function readWorkshopTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? 70
  const columnCount = tab.gridProperties?.columnCount ?? 24
  const slices = workshopSheetFetchRangesForGrid(rowCount, columnCount)
  if (slices.length === 0) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const rangeParams = slices
    .map((slice) => `ranges=${encodeURIComponent(`${quoted}!${slice}`)}`)
    .join('&')
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangeParams}&valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'workshop_workbook')
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
  return buildWorkshopSheetGridFromColumnRanges(valueRanges)
}

function buildCardPresetBatchForWorkbook(
  accessToken: string,
  cardsWorkbookId: string,
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
  cardPresetLoadouts: readonly (readonly string[])[],
  masterSheetLabels: ReadonlyMap<string, string>,
): Promise<{
  batch: ReturnType<typeof buildCardPresetSheetUpdates>
  presetSlots: number
  presetSheetTitle: string | null
}> {
  return (async () => {
    let presetSlots: ReturnType<typeof parseCardPresetSlotsWithLayout> = []
    let presetLayout: ReturnType<typeof detectCardPresetSheetLayout> = null
    let presetSheetTitle: string | null = null
    let presetGrid: string[][] | null = null

    for (const tab of orderedCardPresetWorkbookTabs(sheets, sheetGid)) {
      const grid = await readCardPresetTabGrid(accessToken, cardsWorkbookId, tab)
      if (!grid) continue
      const tabLayout =
        detectCardPresetSheetLayout(grid) ??
        (isCardPresetSheetTitle(tab.title) ? defaultCardPresetSheetLayout() : null)
      if (!tabLayout) continue
      const tabSlots = parseCardPresetSlotsWithLayout(tabLayout)
      if (tabSlots.length > presetSlots.length) {
        presetSlots = tabSlots
        presetLayout = tabLayout
        presetSheetTitle = tab.title
        presetGrid = grid
      }
    }

    if (!presetLayout || presetSlots.length === 0 || !presetSheetTitle) {
      return { batch: [], presetSlots: 0, presetSheetTitle: null }
    }

    const sheetLabels = mergeEffectivePathsCardSheetLabels(
      masterSheetLabels,
      effectivePathsCardPresetDropdownLabels(),
      presetGrid ? effectivePathsCardSheetLabelsFromPresetGrid(presetGrid) : new Map(),
    )

    return {
      batch: buildCardPresetSheetUpdates(
        presetSheetTitle,
        presetSlots,
        cardPresetLoadouts,
        sheetLabels,
      ),
      presetSlots: presetSlots.length,
      presetSheetTitle,
    }
  })()
}

export async function exportCardsToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  cardStars: Readonly<Record<string, number>>
  cardMasteryUnlockedIds: readonly string[]
  cardEquipSlots: number
  cardPresetLoadouts: readonly (readonly string[])[]
}): Promise<ExportCardsToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let cardsWorkbookId = overrideId
  if (!cardsWorkbookId && options.masterSpreadsheetId) {
    cardsWorkbookId = await resolveCardsWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!cardsWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(cardsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'cards_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

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

  const mastery = new Set(options.cardMasteryUnlockedIds)
  const cardBatch = buildCardSheetUpdates(
    sheetTitle,
    cardRows,
    options.cardStars,
    mastery,
    options.cardEquipSlots,
  )
  if (cardBatch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_card_rows')
  }

  const masterSheetLabels = effectivePathsCardSheetLabelsFromCardRows(
    rawRows,
    cardRows,
    layout.nameCol,
  )
  const presetWork = await buildCardPresetBatchForWorkbook(
    options.accessToken,
    cardsWorkbookId,
    sheets,
    null,
    options.cardPresetLoadouts,
    masterSheetLabels,
  )
  const batch = [...cardBatch, ...presetWork.batch]

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(cardsWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'cards_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }
  const presetUpdatedCells = presetWork.batch.length

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows: cardRows.length,
    unmappedSheetNames: unmappedCardNamesWithLayout(rawRows, layout),
    sheetTitle,
    cardsWorkbookId,
    presetSheetTitle: presetWork.presetSheetTitle,
    presetMatchedRows: presetWork.presetSlots,
    presetUpdatedCells,
  }
}

type WorkshopMasterSheetData = {
  workshopRows: ReturnType<typeof parseWorkshopSheetRowsWithLayout>
  layout: NonNullable<ReturnType<typeof detectWorkshopSheetLayout>>
  enhanceRows: ReturnType<typeof parseWorkshopEnhanceSheetRowsWithLayout>
  enhanceLayout: ReturnType<typeof detectWorkshopEnhanceSheetLayout>
  rawRows: string[][]
  sheetTitle: string
}

async function loadWorkshopMasterSheet(options: {
  accessToken: string
  workshopWorkbookId: string
  sheetGid?: number | null
}): Promise<WorkshopMasterSheetData | null> {
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(options.workshopWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'workshop_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []

  let workshopRows: ReturnType<typeof parseWorkshopSheetRowsWithLayout> = []
  let layout: ReturnType<typeof detectWorkshopSheetLayout> = null
  let enhanceRows: ReturnType<typeof parseWorkshopEnhanceSheetRowsWithLayout> = []
  let enhanceLayout: ReturnType<typeof detectWorkshopEnhanceSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''

  for (const tab of orderedWorkshopWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readWorkshopTabGrid(options.accessToken, options.workshopWorkbookId, tab)
    if (!grid) continue
    const tabLayout = detectWorkshopSheetLayout(grid)
    if (!tabLayout) continue
    const tabRows = parseWorkshopSheetRowsWithLayout(grid, tabLayout)
    if (tabRows.length > workshopRows.length) {
      workshopRows = tabRows
      layout = tabLayout
      rawRows = grid
      sheetTitle = tab.title
      const tabEnhanceLayout = detectWorkshopEnhanceSheetLayout(grid)
      enhanceLayout = tabEnhanceLayout
      enhanceRows = tabEnhanceLayout
        ? parseWorkshopEnhanceSheetRowsWithLayout(grid, tabEnhanceLayout)
        : []
    }
  }

  if (!layout || workshopRows.length === 0 || !sheetTitle) return null

  return { workshopRows, layout, enhanceRows, enhanceLayout, rawRows, sheetTitle }
}

export type ImportWorkshopFromSheetResult = {
  workshopLevels: Record<string, number>
  matchedRows: number
  enhanceMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  workshopWorkbookId: string
}

export async function importWorkshopFromGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
}): Promise<ImportWorkshopFromSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let workshopWorkbookId = overrideId
  if (!workshopWorkbookId && options.masterSpreadsheetId) {
    workshopWorkbookId = await resolveWorkshopWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!workshopWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const loaded = await loadWorkshopMasterSheet({
    accessToken: options.accessToken,
    workshopWorkbookId,
    sheetGid: options.sheetGid ?? null,
  })
  if (!loaded) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_workshop_rows')
  }

  const workshopLevels = workshopLevelsFromSheetRows(
    loaded.workshopRows,
    loaded.enhanceRows,
    loaded.rawRows,
    loaded.layout,
    loaded.enhanceLayout,
  )

  return {
    workshopLevels,
    matchedRows: loaded.workshopRows.length,
    enhanceMatchedRows: loaded.enhanceRows.length,
    unmappedSheetNames: [
      ...unmappedWorkshopNamesWithLayout(loaded.rawRows, loaded.layout),
      ...(loaded.enhanceLayout
        ? unmappedWorkshopEnhanceNamesWithLayout(loaded.rawRows, loaded.enhanceLayout)
        : []),
    ],
    sheetTitle: loaded.sheetTitle,
    workshopWorkbookId,
  }
}

export async function exportWorkshopToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  workshopLevels: Readonly<Record<string, number>>
}): Promise<ExportWorkshopToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let workshopWorkbookId = overrideId
  if (!workshopWorkbookId && options.masterSpreadsheetId) {
    workshopWorkbookId = await resolveWorkshopWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!workshopWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const loaded = await loadWorkshopMasterSheet({
    accessToken: options.accessToken,
    workshopWorkbookId,
    sheetGid: options.sheetGid ?? null,
  })
  if (!loaded) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_workshop_rows')
  }

  const { workshopRows, layout, enhanceRows, enhanceLayout, rawRows, sheetTitle } = loaded

  const batch = [
    ...buildWorkshopSheetUpdates(sheetTitle, workshopRows, options.workshopLevels),
    ...(enhanceLayout
      ? buildWorkshopEnhanceSheetUpdates(
          sheetTitle,
          enhanceRows,
          options.workshopLevels,
          enhanceLayout,
        )
      : []),
  ]
  if (batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_workshop_rows')
  }

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(workshopWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'workshop_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }

  const unmappedSheetNames = [
    ...unmappedWorkshopNamesWithLayout(rawRows, layout),
    ...(enhanceLayout ? unmappedWorkshopEnhanceNamesWithLayout(rawRows, enhanceLayout) : []),
  ]

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows: workshopRows.length,
    enhanceMatchedRows: enhanceRows.length,
    unmappedSheetNames,
    sheetTitle,
    workshopWorkbookId,
  }
}

export function orderedBotsWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isBotsInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsBotsTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isBotsInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

export async function readBotsTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? BOT_SHEET_GRID_ROWS
  const columnCount = tab.gridProperties?.columnCount ?? 26
  const block = botSheetBlockFetchRangeForGrid(rowCount, columnCount)
  if (!block) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const range = encodeURIComponent(`${quoted}!${block}`)
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'bots_workbook')
  if (!valuesRes.ok) {
    const body = await valuesRes.text()
    if (/exceeds grid limits/i.test(body)) return null
    throw new GoogleSheetsApiError('sheets_api_error', valuesRes.status, body)
  }
  const valuesBody = (await valuesRes.json()) as { range?: string; values?: unknown[][] }
  const maxRow = Math.max(4, Math.min(rowCount, BOT_SHEET_GRID_ROWS))
  return buildBotSheetGridFromBlockRange(valuesBody.range, valuesBody.values ?? [], maxRow)
}

async function clearBotFarmingLevelColumn(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<void> {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const range = encodeURIComponent(
    `${quoted}!G${BOT_EP_V31_FARMING_LEVEL_FIRST_ROW}:G${BOT_EP_V31_FARMING_LEVEL_LAST_ROW}`,
  )
  const clearRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values/${range}:clear`,
    { method: 'POST' },
  )
  throwIfSheetsAccessDenied(clearRes.status, 'bots_workbook')
  if (!clearRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', clearRes.status, await clearRes.text())
  }
}

/** Write exact dropdown labels (values API cannot match EP list entries). */
async function applyBotFarmingLevelCells(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  cells: readonly BotFarmingLevelCellUpdate[],
): Promise<number> {
  if (cells.length === 0) return 0

  const requests = cells.map(({ rowIndex, label }) => ({
    updateCells: {
      range: {
        sheetId,
        startRowIndex: rowIndex - 1,
        endRowIndex: rowIndex,
        startColumnIndex: BOT_FARMING_LEVEL_COL,
        endColumnIndex: BOT_FARMING_LEVEL_COL + 1,
      },
      rows: [
        {
          values: [
            {
              userEnteredValue: { stringValue: label },
            },
          ],
        },
      ],
      fields: 'userEnteredValue',
    },
  }))

  const updateRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'bots_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  return cells.length
}

export async function exportBotsToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  botsEpState: BotsEpSyncState
}): Promise<ExportBotsToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let botsWorkbookId = overrideId
  if (!botsWorkbookId && options.masterSpreadsheetId) {
    botsWorkbookId = await resolveBotsWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!botsWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(botsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'bots_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []

  let statRows: ReturnType<typeof parseBotStatRowsWithLayout> = []
  let headerRows: ReturnType<typeof parseBotHeaderRowsWithLayout> = []
  let labRows: ReturnType<typeof parseBotLabRowsWithLayout> = []
  let layout: ReturnType<typeof detectBotSheetLayout> = null
  let rawRows: string[][] = []
  let sheetTitle = ''
  let sheetId: number | null = null

  for (const tab of orderedBotsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readBotsTabGrid(options.accessToken, botsWorkbookId, tab)
    if (!grid) continue
    const tabLayout = resolveBotSheetLayout(grid)
    if (!tabLayout) continue
    const tabStatRows = parseBotStatRowsWithLayout(grid, tabLayout)
    if (tabStatRows.length > statRows.length) {
      statRows = tabStatRows
      headerRows = parseBotHeaderRowsWithLayout(grid, tabLayout)
      labRows = parseBotLabRowsWithLayout(grid, tabLayout)
      layout = tabLayout
      rawRows = grid
      sheetTitle = tab.title
      sheetId = tab.sheetId ?? null
    }
  }

  if (!layout || statRows.length === 0 || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_bot_rows')
  }

  const farmingCells = buildBotFarmingLevelCellUpdates(statRows, options.botsEpState)
  const batch = buildBotSheetUpdates(
    sheetTitle,
    statRows,
    headerRows,
    labRows,
    options.botsEpState,
    layout,
  )
  if (farmingCells.length === 0 && batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_bot_rows')
  }

  await clearBotFarmingLevelColumn(options.accessToken, botsWorkbookId, sheetTitle)

  let updatedCells = 0
  let valueBatch = batch

  if (sheetId != null) {
    updatedCells += await applyBotFarmingLevelCells(
      options.accessToken,
      botsWorkbookId,
      sheetId,
      farmingCells,
    )
  } else if (farmingCells.length > 0) {
    const quoted = quoteSheetTitleForRange(sheetTitle)
    valueBatch = [
      ...batch,
      ...farmingCells.map(({ rowIndex, label }) => ({
        range: `${quoted}!G${rowIndex}`,
        values: [[label]] as (string | number | boolean)[][],
      })),
    ]
  }

  if (valueBatch.length > 0) {
    const updateRes = await sheetsFetch(
      options.accessToken,
      `/${encodeURIComponent(botsWorkbookId)}/values:batchUpdate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueBatch.map(({ range, values }) => ({ range, values })),
        }),
      },
    )
    throwIfSheetsAccessDenied(updateRes.status, 'bots_workbook')
    if (!updateRes.ok) {
      throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
    }
    const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }
    updatedCells += updateBody.totalUpdatedCells ?? valueBatch.length
  }

  return {
    updatedCells,
    matchedRows: statRows.length,
    labMatchedRows: labRows.length,
    unmappedSheetNames: unmappedBotNamesWithLayout(rawRows, layout),
    sheetTitle,
    botsWorkbookId,
  }
}

export function orderedCardPresetWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const out: SheetProperties[] = []

  const push = (tab: SheetProperties) => {
    if (isCardPresetTabExcluded(tab.title)) return
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }

  if (sheetGid != null) {
    const byGid = sheets.find((sheet) => sheet.properties.sheetId === sheetGid)
    if (byGid) push(byGid.properties)
  }

  const preferred = pickEffectivePathsCardPresetTab(sheets, null)
  if (preferred) push(preferred)

  for (const sheet of sheets) {
    const tab = sheet.properties
    if (isCardPresetInputTabCandidate(tab.title, tab.gridProperties)) push(tab)
  }

  for (const sheet of sheets) {
    const tab = sheet.properties
    if (/card\s*preset/i.test(tab.title)) push(tab)
  }

  return out
}

export async function readCardPresetTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? 50
  const columnCount = tab.gridProperties?.columnCount ?? 24
  const slices = cardPresetSheetFetchRangesForGrid(rowCount, columnCount)
  if (slices.length === 0) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const rangeParams = slices
    .map((slice) => `ranges=${encodeURIComponent(`${quoted}!${slice}`)}`)
    .join('&')
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangeParams}&valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'cards_workbook')
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
  return buildCardPresetSheetGridFromColumnRanges(valueRanges)
}

export type ExportLabsToSheetResult = {
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  laboratoryWorkbookId: string
}

function orderedLaboratoryWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isLaboratoryInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsLaboratoryTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isLaboratoryInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

async function readLaboratoryTabGrid(
  accessToken: string,
  spreadsheetId: string,
  tab: SheetProperties,
): Promise<string[][] | null> {
  const rowCount = tab.gridProperties?.rowCount ?? LAB_SHEET_GRID_ROWS
  const columnCount = tab.gridProperties?.columnCount ?? 72
  const block = labSheetBlockFetchRangeForGrid(rowCount, columnCount)
  if (!block) return null

  const quoted = quoteSheetTitleForRange(tab.title)
  const range = encodeURIComponent(`${quoted}!${block}`)
  const valuesRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`,
  )
  throwIfSheetsAccessDenied(valuesRes.status, 'laboratory_workbook')
  if (!valuesRes.ok) {
    const body = await valuesRes.text()
    if (/exceeds grid limits/i.test(body)) return null
    throw new GoogleSheetsApiError('sheets_api_error', valuesRes.status, body)
  }
  const valuesBody = (await valuesRes.json()) as { range?: string; values?: unknown[][] }
  const maxRow = Math.max(1, Math.min(rowCount, LAB_SHEET_GRID_ROWS))
  return buildLabSheetGridFromBlockRange(valuesBody.range, valuesBody.values ?? [], maxRow)
}

type LaboratoryMasterSheetData = {
  labRows: ReturnType<typeof parseLabSheetRowsWithLayout>
  blocks: ReturnType<typeof detectLabSheetBlocks>
  rawRows: string[][]
  sheetTitle: string
  nameIndex: ReturnType<typeof buildLabSheetNameIndex>
}

async function loadLaboratoryMasterSheet(options: {
  accessToken: string
  laboratoryWorkbookId: string
  sheetGid?: number | null
}): Promise<LaboratoryMasterSheetData | null> {
  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(options.laboratoryWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'laboratory_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []
  const research = loadBundledResearchData()
  const nameIndex = buildLabSheetNameIndex(research)

  let labRows: ReturnType<typeof parseLabSheetRowsWithLayout> = []
  let blocks: ReturnType<typeof detectLabSheetBlocks> = []
  let rawRows: string[][] = []
  let sheetTitle = ''

  for (const tab of orderedLaboratoryWorkbookTabs(sheets, options.sheetGid ?? null)) {
    const grid = await readLaboratoryTabGrid(
      options.accessToken,
      options.laboratoryWorkbookId,
      tab,
    )
    if (!grid) continue
    const tabBlocks = detectLabSheetBlocks(grid)
    if (tabBlocks.length === 0) continue
    const tabRows = parseLabSheetRowsWithLayout(grid, tabBlocks, nameIndex)
    if (tabRows.length > labRows.length) {
      labRows = tabRows
      blocks = tabBlocks
      rawRows = grid
      sheetTitle = tab.title
    }
  }

  if (labRows.length === 0 || !sheetTitle) return null

  return { labRows, blocks, rawRows, sheetTitle, nameIndex }
}

export type ImportLabsFromSheetResult = {
  labLevelOverrides: Record<string, number>
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  laboratoryWorkbookId: string
}

export async function importLabsFromGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
}): Promise<ImportLabsFromSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let laboratoryWorkbookId = overrideId
  if (!laboratoryWorkbookId && options.masterSpreadsheetId) {
    laboratoryWorkbookId = await resolveLaboratoryWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!laboratoryWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const loaded = await loadLaboratoryMasterSheet({
    accessToken: options.accessToken,
    laboratoryWorkbookId,
    sheetGid: options.sheetGid ?? null,
  })
  if (!loaded) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_lab_rows')
  }

  const research = loadBundledResearchData()
  const rawOverrides = labsLevelOverridesFromSheetRows(loaded.labRows, loaded.rawRows)
  const labLevelOverrides = sanitizeLevelOverrides(research, rawOverrides)

  return {
    labLevelOverrides,
    matchedRows: loaded.labRows.length,
    unmappedSheetNames: unmappedLabNamesWithLayout(
      loaded.rawRows,
      loaded.blocks,
      loaded.nameIndex,
    ),
    sheetTitle: loaded.sheetTitle,
    laboratoryWorkbookId,
  }
}

export async function exportLabsToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  labLevelOverrides: Readonly<Record<string, number>>
}): Promise<ExportLabsToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let laboratoryWorkbookId = overrideId
  if (!laboratoryWorkbookId && options.masterSpreadsheetId) {
    laboratoryWorkbookId = await resolveLaboratoryWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!laboratoryWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const loaded = await loadLaboratoryMasterSheet({
    accessToken: options.accessToken,
    laboratoryWorkbookId,
    sheetGid: options.sheetGid ?? null,
  })
  if (!loaded) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_lab_rows')
  }

  const { labRows, blocks, rawRows, sheetTitle, nameIndex } = loaded
  const research = loadBundledResearchData()

  const batch = buildLabSheetUpdates(sheetTitle, labRows, research, options.labLevelOverrides)
  if (batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_lab_rows')
  }

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(laboratoryWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'laboratory_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows: labRows.length,
    unmappedSheetNames: unmappedLabNamesWithLayout(rawRows, blocks, nameIndex),
    sheetTitle,
    laboratoryWorkbookId,
  }
}

export const UW_EP_V31_LEVEL_COL = 6
export const UW_EP_V31_UNLOCKED_COL = 3

export type ExportUwsToSheetResult = {
  updatedCells: number
  matchedRows: number
  sheetTitle: string
  uwsWorkbookId: string
}

export function orderedUwsWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isUwsInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsUwsTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isUwsInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

async function clearUwLevelColumn(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<void> {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const range = encodeURIComponent(
    `${quoted}!G${UW_EP_V31_LEVEL_FIRST_ROW}:G${UW_EP_V31_LEVEL_LAST_ROW}`,
  )
  const clearRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}/values/${range}:clear`,
    { method: 'POST' },
  )
  throwIfSheetsAccessDenied(clearRes.status, 'uws_workbook')
  if (!clearRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', clearRes.status, await clearRes.text())
  }
}

async function applyUwLevelCells(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  cells: readonly UwFarmingLevelCellUpdate[],
): Promise<number> {
  if (cells.length === 0) return 0

  const requests = cells.map(({ rowIndex, label }) => ({
    updateCells: {
      range: {
        sheetId,
        startRowIndex: rowIndex - 1,
        endRowIndex: rowIndex,
        startColumnIndex: UW_EP_V31_LEVEL_COL,
        endColumnIndex: UW_EP_V31_LEVEL_COL + 1,
      },
      rows: [
        {
          values: [{ userEnteredValue: { stringValue: label } }],
        },
      ],
      fields: 'userEnteredValue',
    },
  }))

  const updateRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'uws_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }

  return cells.length
}

export async function exportUwsToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  uwsEpState: UwsEpSyncState
}): Promise<ExportUwsToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let uwsWorkbookId = overrideId
  if (!uwsWorkbookId && options.masterSpreadsheetId) {
    uwsWorkbookId = await resolveUwsWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!uwsWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(uwsWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'uws_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

  const meta = (await metaRes.json()) as SpreadsheetMetadata
  const sheets = meta.sheets ?? []

  let sheetTitle = ''
  let sheetId: number | null = null
  for (const tab of orderedUwsWorkbookTabs(sheets, options.sheetGid ?? null)) {
    if (isUwsInputTabCandidate(tab.title, tab.gridProperties)) {
      sheetTitle = tab.title
      sheetId = tab.sheetId ?? null
      break
    }
  }

  if (!sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'uws_tab_not_found')
  }

  const farmingCells = buildUwFarmingLevelCellUpdates(options.uwsEpState)
  const batch = buildUwSheetUpdates(sheetTitle, options.uwsEpState)
  if (farmingCells.length === 0 && batch.length === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_uws_rows')
  }

  await clearUwLevelColumn(options.accessToken, uwsWorkbookId, sheetTitle)

  let updatedCells = 0
  let valueBatch = batch

  if (sheetId != null) {
    updatedCells += await applyUwLevelCells(
      options.accessToken,
      uwsWorkbookId,
      sheetId,
      farmingCells,
    )
  } else if (farmingCells.length > 0) {
    const quoted = quoteSheetTitleForRange(sheetTitle)
    valueBatch = [
      ...batch,
      ...farmingCells.map(({ rowIndex, label }) => ({
        range: `${quoted}!G${rowIndex}`,
        values: [[label]] as (string | number | boolean)[][],
      })),
    ]
  }

  if (valueBatch.length > 0) {
    const updateRes = await sheetsFetch(
      options.accessToken,
      `/${encodeURIComponent(uwsWorkbookId)}/values:batchUpdate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueBatch,
        }),
      },
    )
    throwIfSheetsAccessDenied(updateRes.status, 'uws_workbook')
    if (!updateRes.ok) {
      throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
    }
    const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }
    updatedCells += updateBody.totalUpdatedCells ?? valueBatch.length
  }

  return {
    updatedCells,
    matchedRows: farmingCells.length,
    sheetTitle,
    uwsWorkbookId,
  }
}

export type ExportModulesToSheetResult = {
  updatedCells: number
  matchedRows: number
  matchedSubstats: number
  sheetTitle: string
  modulesWorkbookId: string
}

export function orderedModulesWorkbookTabs(
  sheets: readonly { properties: SheetProperties }[],
  sheetGid: number | null,
): SheetProperties[] {
  const candidates = sheets
    .map((sheet) => sheet.properties)
    .filter((tab) => isModulesInputTabCandidate(tab.title, tab.gridProperties))

  if (sheetGid != null) {
    const byGid = candidates.find((tab) => tab.sheetId === sheetGid)
    if (byGid) {
      return [byGid, ...candidates.filter((tab) => tab.sheetId !== byGid.sheetId)]
    }
  }

  const preferred = pickEffectivePathsModulesTab(sheets, null)
  const out: SheetProperties[] = []
  if (preferred && isModulesInputTabCandidate(preferred.title, preferred.gridProperties)) {
    out.push(preferred)
  }
  for (const tab of candidates) {
    if (!out.some((entry) => entry.sheetId === tab.sheetId)) out.push(tab)
  }
  return out
}

export async function exportModulesToGoogleSheet(options: {
  accessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
  modulesEpState: ModulesEpSyncState
}): Promise<ExportModulesToSheetResult> {
  const overrideId = options.spreadsheetId?.trim() ?? ''
  let modulesWorkbookId = overrideId
  if (!modulesWorkbookId && options.masterSpreadsheetId) {
    modulesWorkbookId = await resolveModulesWorkbookId({
      accessToken: options.accessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.masterSheetGid ?? null,
    })
  }
  if (!modulesWorkbookId) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'invalid_spreadsheet')
  }

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(modulesWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
  )
  throwIfSheetsAccessDenied(metaRes.status, 'modules_workbook')
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }

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
  const batch = buildModuleSheetUpdates(sheetTitle, options.modulesEpState, layout)
  const matchedRows = countModulesEpEquippedSlots(options.modulesEpState)
  const matchedSubstats = countModulesEpEquippedSubstats(options.modulesEpState)
  if (batch.length === 0 || matchedRows === 0) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_modules_rows')
  }

  const updateRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(modulesWorkbookId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batch,
      }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, 'modules_workbook')
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }
  const updateBody = (await updateRes.json()) as { totalUpdatedCells?: number }

  return {
    updatedCells: updateBody.totalUpdatedCells ?? batch.length,
    matchedRows,
    matchedSubstats,
    sheetTitle,
    modulesWorkbookId,
  }
}
