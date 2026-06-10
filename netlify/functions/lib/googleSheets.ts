import {
  buildRelicUnlockedUpdates,
  quoteSheetTitleForRange,
} from '../../../src/effectivePaths/buildRelicUnlockedUpdates'
import { buildCardPresetSheetUpdates } from '../../../src/effectivePaths/buildCardPresetSheetUpdates'
import { buildCardSheetUpdates } from '../../../src/effectivePaths/buildCardSheetUpdates'
import {
  buildWorkshopEnhanceSheetUpdates,
  buildWorkshopSheetUpdates,
} from '../../../src/effectivePaths/buildWorkshopSheetUpdates'
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
  isWorkshopInputTabCandidate,
  pickEffectivePathsWorkshopTab,
} from '../../../src/effectivePaths/pickWorkshopTab'
import {
  isThemesInputTabCandidate,
  pickEffectivePathsThemesTab,
} from '../../../src/effectivePaths/pickThemesTab'
import {
  resolveCardsWorkbookId,
  resolveRelicsWorkbookId,
  resolveThemesWorkbookId,
  resolveWorkshopWorkbookId,
} from './idsMasterSheets'
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

function orderedCardsWorkbookTabs(
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

async function readCardTabGrid(
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

  const metaRes = await sheetsFetch(
    options.accessToken,
    `/${encodeURIComponent(workshopWorkbookId)}?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))`,
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
    const grid = await readWorkshopTabGrid(options.accessToken, workshopWorkbookId, tab)
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

  if (!layout || workshopRows.length === 0 || !sheetTitle) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'no_workshop_rows')
  }

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

function orderedCardPresetWorkbookTabs(
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

async function readCardPresetTabGrid(
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
