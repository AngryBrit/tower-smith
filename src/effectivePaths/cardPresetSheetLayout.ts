import { workshopCardIdFromSheetName } from './cardSheetNames'
import { columnIndexToA1Letter } from './relicSheetLayout'

/** Cards v3.0.4 Card Preset tab: card dropdowns in D, H, L, P, T (rows 5–32); M/Q/U are data. */
export const CARD_PRESET_SHEET_GRID_ROWS = 50
export const CARD_PRESET_SLOT_COUNT = 28
/** 0-based row index for slot 1 (Google Sheet row 5). */
export const CARD_PRESET_SLOT_START_ROW_0 = 4
/** 0-based row index after slot 28 (Google Sheet row 32 inclusive). */
export const CARD_PRESET_SLOT_END_ROW_EXCLUSIVE_0 = 32
/** 0-based column indices for preset card-name dropdowns (D, H, L, P, T). */
export const CARD_PRESET_NAME_COLUMNS_0 = [3, 7, 11, 15, 19] as const
/** 0-based column indices for preset titles on row 4 (D, H, M, Q, U). */
export const CARD_PRESET_TITLE_COLUMNS_0 = [3, 7, 12, 16, 20] as const
/** 0-based row index for preset titles (Google Sheet row 4). */
export const CARD_PRESET_HEADER_ROW_0 = 3

export type CardPresetSheetLayout = {
  presetNameCols: readonly number[]
  slotStartRow: number
  slotCount: number
}

export type EffectivePathsCardPresetSlot = {
  presetIndex: number
  slotIndex: number
  /** 1-based row in the Google Sheet. */
  rowIndex: number
  /** 0-based column for the card-name cell. */
  nameCol: number
}

export const CARD_PRESET_FETCH_RANGES = [
  'D4:D4',
  'H4:H4',
  'M4:M4',
  'Q4:Q4',
  'U4:U4',
  'D5:D32',
  'H5:H32',
  'L5:L32',
  'P5:P32',
  'T5:T32',
  'M5:M32',
  'Q5:Q32',
  'U5:U32',
] as const

const SINGLE_COLUMN_BLOCKS: readonly { colLetters: string; col: number }[] = [
  { colLetters: 'D', col: 3 },
  { colLetters: 'H', col: 7 },
  { colLetters: 'L', col: 11 },
  { colLetters: 'M', col: 12 },
  { colLetters: 'P', col: 15 },
  { colLetters: 'Q', col: 16 },
  { colLetters: 'T', col: 19 },
  { colLetters: 'U', col: 20 },
]

type CardPresetValueRange = {
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

function a1ColumnToIndex0(letters: string): number {
  let index = 0
  for (const ch of letters) {
    index = index * 26 + (ch.charCodeAt(0) - 65 + 1)
  }
  return index - 1
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase()
}

function isPresetHeaderMarker(value: string): boolean {
  const key = normalizeHeader(value)
  if (!key) return false
  return (
    key === 'farming' ||
    key === 'tourney' ||
    key === 'tournament' ||
    /^preset\s*[345]$/i.test(key)
  )
}

/** Clip preset fetch ranges to a tab's grid size. */
export function cardPresetSheetFetchRangesForGrid(
  rowCount: number,
  columnCount: number,
): readonly string[] {
  const maxRow = Math.max(1, Math.min(rowCount, CARD_PRESET_SHEET_GRID_ROWS))
  const out: string[] = []
  for (const slice of CARD_PRESET_FETCH_RANGES) {
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

/** Merge per-column API ranges into a single A-aligned grid. */
export function buildCardPresetSheetGridFromColumnRanges(
  valueRanges: readonly CardPresetValueRange[],
): string[][] {
  const grid: string[][] = Array.from({ length: CARD_PRESET_SHEET_GRID_ROWS }, () =>
    Array(24).fill(''),
  )

  const placeColumn = (
    values: readonly (readonly unknown[])[],
    col: number,
    rowOffset: number,
  ) => {
    for (let row = 0; row < values.length && row + rowOffset < CARD_PRESET_SHEET_GRID_ROWS; row++) {
      grid[row + rowOffset]![col] = cellValueToString(values[row]?.[0])
    }
  }

  for (const block of valueRanges) {
    const range = block.range ?? ''
    const values = block.values ?? []
    const match = range.match(/!([A-Z]+)(\d+):/i)
    if (!match) continue
    const colHit = SINGLE_COLUMN_BLOCKS.find(
      (entry) => entry.colLetters.toUpperCase() === match[1]!.toUpperCase(),
    )
    if (!colHit) continue
    const startRow = Number(match[2])
    if (!Number.isFinite(startRow) || startRow < 1) continue
    placeColumn(values, colHit.col, startRow - 1)
  }

  return grid
}

export function defaultCardPresetSheetLayout(): CardPresetSheetLayout {
  return {
    presetNameCols: [...CARD_PRESET_NAME_COLUMNS_0],
    slotStartRow: CARD_PRESET_SLOT_START_ROW_0,
    slotCount: CARD_PRESET_SLOT_COUNT,
  }
}

function countPresetHeaderMarkers(rows: readonly (readonly unknown[])[]): number {
  const cols = new Set<number>()
  for (let headerRow = 1; headerRow <= CARD_PRESET_HEADER_ROW_0 + 1; headerRow++) {
    for (const col of CARD_PRESET_TITLE_COLUMNS_0) {
      if (isPresetHeaderMarker(cellAt(rows, headerRow, col))) {
        cols.add(col)
      }
    }
  }
  return cols.size
}

function countPresetColumnsWithCardNames(
  rows: readonly (readonly unknown[])[],
  cols: readonly number[],
): number {
  let colsWithCards = 0
  for (const col of cols) {
    for (let row = CARD_PRESET_SLOT_START_ROW_0; row < CARD_PRESET_SLOT_END_ROW_EXCLUSIVE_0; row++) {
      if (workshopCardIdFromSheetName(cellAt(rows, row, col))) {
        colsWithCards++
        break
      }
    }
  }
  return colsWithCards
}

/** Detect Cards v3.x Card Preset tab layout. */
export function detectCardPresetSheetLayout(
  rows: readonly (readonly unknown[])[],
): CardPresetSheetLayout | null {
  if (countPresetHeaderMarkers(rows) >= 1) return defaultCardPresetSheetLayout()
  if (countPresetColumnsWithCardNames(rows, CARD_PRESET_NAME_COLUMNS_0) >= 1) {
    return defaultCardPresetSheetLayout()
  }
  if (countPresetColumnsWithCardNames(rows, CARD_PRESET_TITLE_COLUMNS_0) >= 1) {
    return defaultCardPresetSheetLayout()
  }
  return null
}

/** True when the tab title is the Cards v3.x preset input sheet. */
export function isCardPresetSheetTitle(title: string): boolean {
  return /card\s*preset/i.test(title.trim())
}

export function parseCardPresetSlotsWithLayout(
  layout: CardPresetSheetLayout,
): EffectivePathsCardPresetSlot[] {
  const out: EffectivePathsCardPresetSlot[] = []
  for (let presetIndex = 0; presetIndex < layout.presetNameCols.length; presetIndex++) {
    const nameCol = layout.presetNameCols[presetIndex]!
    for (let slotIndex = 0; slotIndex < layout.slotCount; slotIndex++) {
      const row = layout.slotStartRow + slotIndex
      out.push({
        presetIndex,
        slotIndex,
        rowIndex: row + 1,
        nameCol,
      })
    }
  }
  return out
}

export { columnIndexToA1Letter }
