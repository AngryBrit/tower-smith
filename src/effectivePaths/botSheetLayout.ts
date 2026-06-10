import type { WorkshopBotId } from '../data/workshopBotsData'
import {
  botEpLevelKeyFromAttribute,
  botIdForSheetRow,
  botIdFromSheetName,
  botLabNameFromSheetName,
  isBotEpIgnoredAttribute,
  isBotEpV31HeaderRow,
  isBotSheetStatusLabel,
} from './botSheetNames'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type BotSheetLayout = {
  botNameCol: number
  attributeCol: number
  farmingLevelCol: number
  farmingSyncCol: number
  labNameCol: number
  labLevelCol: number
  startRow: number
  endRow: number
}

export type EffectivePathsBotStatRow = {
  rowIndex: number
  botId: WorkshopBotId
  attribute: string
  levelKey: string
}

export type EffectivePathsBotHeaderRow = {
  rowIndex: number
  botId: WorkshopBotId
}

export type EffectivePathsBotLabRow = {
  rowIndex: number
  name: string
}

export const BOT_SHEET_GRID_ROWS = 35
export const BOT_SHEET_GRID_COLUMNS = 26
/** 0-based index of column B (block fetch starts here). */
export const BOT_BLOCK_START_COL = 1

/** 0-based column index for bot title fallback (B). */
export const BOT_TITLE_COL = 1
/** 0-based column index for bot unlocked checkbox / status (C). */
export const BOT_NAME_COL = 2
/** 0-based column index for attribute label (E on Bots v3.1). */
export const BOT_ATTRIBUTE_COL = 4
/** 0-based fallback when attributes are in D (older layouts). */
export const BOT_ATTRIBUTE_FALLBACK_COL = 3
/** 0-based column index for Farming preset level (G). */
export const BOT_FARMING_LEVEL_COL = 6
/** 0-based column index for Farming preset Sync checkbox (H). */
export const BOT_FARMING_SYNC_COL = 7
/** 0-based column index for OTHERS laboratory name (T). */
export const BOT_LAB_NAME_COL = 19
/** 0-based column index for OTHERS laboratory level (X on Bots v3.1). */
export const BOT_LAB_LEVEL_COL = 23

export const BOT_SHEET_FETCH_RANGES = [
  'B1:B35',
  'C1:C35',
  'D1:D35',
  'E1:E35',
  'G1:G35',
  'T1:T35',
  'X1:X35',
] as const

const SINGLE_COLUMN_BLOCKS: readonly { suffix: string; col: number }[] = [
  { suffix: '!B1:B', col: BOT_TITLE_COL },
  { suffix: '!C1:C', col: BOT_NAME_COL },
  { suffix: '!D1:D', col: BOT_ATTRIBUTE_FALLBACK_COL },
  { suffix: '!E1:E', col: BOT_ATTRIBUTE_COL },
  { suffix: '!G1:G', col: BOT_FARMING_LEVEL_COL },
  { suffix: '!T1:T', col: BOT_LAB_NAME_COL },
  { suffix: '!X1:X', col: BOT_LAB_LEVEL_COL },
]

type BotSheetValueRange = {
  range?: string
  values?: readonly (readonly unknown[])[]
}

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

function cellAt(rows: readonly (readonly unknown[])[], row: number, col: number): string {
  return cellValueToString(rows[row]?.[col])
}

/** Read attribute from E (preferred) or D; skip Locked/Unlocked in D. */
function readBotAttributeAtRow(
  rows: readonly (readonly unknown[])[],
  rowIndex0: number,
  primaryCol: number = BOT_ATTRIBUTE_COL,
): string {
  const cols =
    primaryCol === BOT_ATTRIBUTE_COL
      ? [BOT_ATTRIBUTE_COL, BOT_ATTRIBUTE_FALLBACK_COL]
      : [primaryCol, primaryCol === BOT_ATTRIBUTE_FALLBACK_COL ? BOT_ATTRIBUTE_COL : primaryCol]
  for (const col of cols) {
    const value = cellAt(rows, rowIndex0, col)
    if (!value || isBotSheetStatusLabel(value)) continue
    return value
  }
  return ''
}

function scoreBotAttributeColumn(rows: readonly (readonly unknown[])[], col: number): number {
  let score = 0
  const limit = Math.min(rows.length, 28)
  for (let i = 3; i < limit; i++) {
    const botId = botIdForSheetRow(i + 1)
    if (!botId) continue
    const attribute = cellAt(rows, i, col)
    if (!attribute || isBotSheetStatusLabel(attribute)) continue
    if (botEpLevelKeyFromAttribute(botId, attribute)) score++
  }
  return score
}

function detectBotAttributeCol(rows: readonly (readonly unknown[])[]): number {
  const scoreE = scoreBotAttributeColumn(rows, BOT_ATTRIBUTE_COL)
  const scoreD = scoreBotAttributeColumn(rows, BOT_ATTRIBUTE_FALLBACK_COL)
  return scoreE >= scoreD ? BOT_ATTRIBUTE_COL : BOT_ATTRIBUTE_FALLBACK_COL
}

function a1ColumnToIndex0(letters: string): number {
  let index = 0
  for (const ch of letters) {
    index = index * 26 + (ch.charCodeAt(0) - 65 + 1)
  }
  return index - 1
}

/** Clip bot fetch ranges to a tab's grid size. */
export function botSheetFetchRangesForGrid(
  rowCount: number,
  columnCount: number,
): readonly string[] {
  const maxRow = Math.max(1, Math.min(rowCount, BOT_SHEET_GRID_ROWS))
  const out: string[] = []
  for (const slice of BOT_SHEET_FETCH_RANGES) {
    const match = slice.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
    if (!match) continue
    const [, startCol, startRowText, endCol, endRowText] = match
    if (a1ColumnToIndex0(startCol!) >= columnCount || a1ColumnToIndex0(endCol!) >= columnCount) {
      continue
    }
    const startRow = Number(startRowText)
    const endRow = Math.min(Number(endRowText), maxRow)
    if (endRow < startRow) continue
    out.push(`${startCol}${startRow}:${endCol}${endRow}`)
  }
  return out
}

function parseRangeStartRow1(range: string | undefined): number {
  const match = range?.match(/![A-Z]+(\d+)/i)
  const startRow1 = match ? Number(match[1]) : 1
  return Number.isFinite(startRow1) && startRow1 > 0 ? startRow1 : 1
}

/** Clip Bots v3.x block fetch (B:X) to a tab's grid size. */
export function botSheetBlockFetchRangeForGrid(
  rowCount: number,
  columnCount: number,
): string | null {
  const maxRow = Math.max(4, Math.min(rowCount, BOT_SHEET_GRID_ROWS))
  const endCol0 = Math.min(columnCount - 1, BOT_SHEET_GRID_COLUMNS - 1)
  if (endCol0 < 6) return null
  return `B1:${columnIndexToA1Letter(endCol0)}${maxRow}`
}

/** Merge a B:X API block into an A-aligned grid (handles sparse leading rows). */
export function buildBotSheetGridFromBlockRange(
  range: string | undefined,
  values: readonly (readonly unknown[])[],
  maxRow: number = BOT_SHEET_GRID_ROWS,
): string[][] {
  const grid: string[][] = Array.from({ length: maxRow }, () =>
    Array(BOT_SHEET_GRID_COLUMNS).fill(''),
  )
  const rowOffset = parseRangeStartRow1(range) - 1

  for (let r = 0; r < values.length; r++) {
    const row = values[r] ?? []
    const gridRow = r + rowOffset
    if (gridRow < 0 || gridRow >= maxRow) continue
    for (let c = 0; c < row.length; c++) {
      const gridCol = BOT_BLOCK_START_COL + c
      if (gridCol >= BOT_SHEET_GRID_COLUMNS) continue
      grid[gridRow]![gridCol] = cellValueToString(row[c])
    }
  }

  return grid
}

/** Merge per-column API ranges into a single A-aligned grid. */
export function buildBotSheetGridFromColumnRanges(
  valueRanges: readonly BotSheetValueRange[],
): string[][] {
  const grid: string[][] = Array.from({ length: BOT_SHEET_GRID_ROWS }, () =>
    Array(BOT_SHEET_GRID_COLUMNS).fill(''),
  )

  const placeColumn = (
    values: readonly (readonly unknown[])[],
    col: number,
    rowOffset: number,
  ) => {
    for (let row = 0; row < values.length && row + rowOffset < BOT_SHEET_GRID_ROWS; row++) {
      grid[row + rowOffset]![col] = cellValueToString(values[row]?.[0])
    }
  }

  for (const block of valueRanges) {
    const range = block.range ?? ''
    const values = block.values ?? []
    const match = range.match(/!([A-Z]+)(\d+):/i)
    const hit = match
      ? SINGLE_COLUMN_BLOCKS.find(
          (entry) => entry.suffix.startsWith(`!${match[1]!.toUpperCase()}`),
        )
      : SINGLE_COLUMN_BLOCKS.find((entry) => range.includes(entry.suffix))
    if (!hit) continue
    const startRow1 = match ? Number(match[2]) : parseRangeStartRow1(range)
    const rowOffset = Number.isFinite(startRow1) && startRow1 > 0 ? startRow1 - 1 : 0
    placeColumn(values, hit.col, rowOffset)
  }

  return grid
}

/** Bots v3.1 fixed layout when header detection is ambiguous. */
export function defaultBotSheetLayoutV31(): BotSheetLayout {
  return {
    botNameCol: BOT_NAME_COL,
    attributeCol: BOT_ATTRIBUTE_COL,
    farmingLevelCol: BOT_FARMING_LEVEL_COL,
    farmingSyncCol: BOT_FARMING_SYNC_COL,
    labNameCol: BOT_LAB_NAME_COL,
    labLevelCol: BOT_LAB_LEVEL_COL,
    startRow: 2,
    endRow: 28,
  }
}

export function gridHasBotSheetMarkers(rows: readonly (readonly unknown[])[]): boolean {
  const limit = Math.min(rows.length, 28)
  for (let i = 3; i < limit; i++) {
    if (botLabNameFromSheetName(cellAt(rows, i, BOT_LAB_NAME_COL))) return true
    const botId = botIdForSheetRow(i + 1)
    const attribute = readBotAttributeAtRow(rows, i)
    if (botId && attribute) return true
  }
  return false
}

/** Detect layout or fall back to Bots v3.1 band rows. */
export function resolveBotSheetLayout(rows: readonly (readonly unknown[])[]): BotSheetLayout | null {
  return detectBotSheetLayout(rows) ?? (gridHasBotSheetMarkers(rows) ? defaultBotSheetLayoutV31() : null)
}

function resolveBotIdForRow(
  rows: readonly (readonly unknown[])[],
  rowIndex0: number,
  layout: BotSheetLayout,
): WorkshopBotId | null {
  const rowIndex1 = rowIndex0 + 1
  return (
    botIdFromSheetName(cellAt(rows, rowIndex0, BOT_TITLE_COL)) ??
    botIdFromSheetName(cellAt(rows, rowIndex0, layout.botNameCol)) ??
    botIdForSheetRow(rowIndex1)
  )
}

function parseBotBlockRows(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): {
  statRows: EffectivePathsBotStatRow[]
  headerRows: EffectivePathsBotHeaderRow[]
} {
  const statRows: EffectivePathsBotStatRow[] = []
  const headerRows: EffectivePathsBotHeaderRow[] = []
  const headerRowsSeen = new Set<number>()

  for (let i = layout.startRow; i < layout.endRow; i++) {
    const rowIndex1 = i + 1
    const botId = resolveBotIdForRow(rows, i, layout)
    if (!botId) continue

    const botFromName =
      botIdFromSheetName(cellAt(rows, i, BOT_TITLE_COL)) ??
      botIdFromSheetName(cellAt(rows, i, layout.botNameCol))
    if ((botFromName || isBotEpV31HeaderRow(rowIndex1)) && !headerRowsSeen.has(rowIndex1)) {
      headerRows.push({ rowIndex: rowIndex1, botId: botFromName ?? botId })
      headerRowsSeen.add(rowIndex1)
    }

    const attribute = readBotAttributeAtRow(rows, i, layout.attributeCol)
    if (!attribute) continue
    const levelKey = botEpLevelKeyFromAttribute(botId, attribute)
    if (!levelKey) continue
    statRows.push({
      rowIndex: rowIndex1,
      botId,
      attribute,
      levelKey,
    })
  }

  return { statRows, headerRows }
}

function parseBotLabRows(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): EffectivePathsBotLabRow[] {
  const out: EffectivePathsBotLabRow[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.labNameCol)
    if (!botLabNameFromSheetName(name)) continue
    out.push({ rowIndex: i + 1, name })
  }
  return out
}

/** Detect Bots v3.x Master Sheet BOTS + OTHERS laboratory blocks. */
export function detectBotSheetLayout(rows: readonly (readonly unknown[])[]): BotSheetLayout | null {
  let mappedStats = 0
  let startRow = BOT_SHEET_GRID_ROWS
  let endRow = 0

  for (let i = 0; i < rows.length && i < BOT_SHEET_GRID_ROWS; i++) {
    const botId = resolveBotIdForRow(rows, i, {
      botNameCol: BOT_NAME_COL,
      attributeCol: BOT_ATTRIBUTE_COL,
      farmingLevelCol: BOT_FARMING_LEVEL_COL,
      farmingSyncCol: BOT_FARMING_SYNC_COL,
      labNameCol: BOT_LAB_NAME_COL,
      labLevelCol: BOT_LAB_LEVEL_COL,
      startRow: 0,
      endRow: BOT_SHEET_GRID_ROWS,
    })

    const attribute = readBotAttributeAtRow(rows, i, detectBotAttributeCol(rows))
    if (attribute && botId && botEpLevelKeyFromAttribute(botId, attribute)) {
      mappedStats++
      startRow = Math.min(startRow, i)
      endRow = Math.max(endRow, i + 1)
    }

    const labName = cellAt(rows, i, BOT_LAB_NAME_COL)
    if (botLabNameFromSheetName(labName)) {
      startRow = Math.min(startRow, i)
      endRow = Math.max(endRow, i + 1)
    }
  }

  if (mappedStats < 1 || endRow <= startRow) return null

  const attributeCol = detectBotAttributeCol(rows)

  return {
    botNameCol: BOT_NAME_COL,
    attributeCol,
    farmingLevelCol: BOT_FARMING_LEVEL_COL,
    farmingSyncCol: BOT_FARMING_SYNC_COL,
    labNameCol: BOT_LAB_NAME_COL,
    labLevelCol: BOT_LAB_LEVEL_COL,
    startRow,
    endRow,
  }
}

export function parseBotStatRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): EffectivePathsBotStatRow[] {
  return parseBotBlockRows(rows, layout).statRows
}

export function parseBotHeaderRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): EffectivePathsBotHeaderRow[] {
  return parseBotBlockRows(rows, layout).headerRows
}

export function parseBotLabRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): EffectivePathsBotLabRow[] {
  return parseBotLabRows(rows, layout)
}

export function unmappedBotNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: BotSheetLayout,
): string[] {
  const out: string[] = []

  for (let i = layout.startRow; i < layout.endRow; i++) {
    const botId = resolveBotIdForRow(rows, i, layout)
    if (!botId) continue

    const attribute = readBotAttributeAtRow(rows, i, layout.attributeCol)
    if (
      attribute &&
      !isBotSheetStatusLabel(attribute) &&
      !isBotEpIgnoredAttribute(botId, attribute) &&
      !botEpLevelKeyFromAttribute(botId, attribute)
    ) {
      out.push(`${EP_BOT_LABEL(botId)} — ${attribute}`)
    }

    const labName = cellAt(rows, i, layout.labNameCol)
    if (labName && !botLabNameFromSheetName(labName)) {
      const level = cellAt(rows, i, layout.labLevelCol)
      if (level) out.push(labName)
    }
  }

  return out
}

function EP_BOT_LABEL(botId: WorkshopBotId): string {
  const labels: Record<WorkshopBotId, string> = {
    flame: 'Flame Bot',
    thunder: 'Thunder Bot',
    golden: 'Golden Bot',
    amplify: 'Amplify Bot',
    botBot: 'Bot Bot',
  }
  return labels[botId]
}

export { columnIndexToA1Letter }
