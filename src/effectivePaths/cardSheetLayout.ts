import {
  isCardEquipSlotsSheetName,
  workshopCardIdFromSheetName,
} from './cardSheetNames'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type CardSheetLayout = {
  /** 0-based column index for card name cells (B). */
  nameCol: number
  /** 0-based column index for star level cells (C). */
  levelCol: number
  /** 0-based column index for mastery checkboxes (D). */
  masteryCol: number
  /** Inclusive 0-based first data row. */
  startRow: number
  /** Exclusive 0-based end row. */
  endRow: number
}

export type EffectivePathsCardSheetRow = {
  /** 1-based row index in the Google Sheet. */
  rowIndex: number
  name: string
  kind: 'card' | 'equip_slots'
}

export const CARD_SHEET_GRID_ROWS = 60

/** Single-column fetches for Cards v3.x Master Sheet (B=name, C=level, D=mastery). */
export const CARD_SHEET_FETCH_RANGES = ['B1:B60', 'C1:C60', 'D1:D60'] as const

const SINGLE_COLUMN_BLOCKS: readonly { suffix: string; col: number }[] = [
  { suffix: '!B1:B', col: 1 },
  { suffix: '!C1:C', col: 2 },
  { suffix: '!D1:D', col: 3 },
]

type CardSheetValueRange = {
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

/** Clip card fetch ranges to a tab's grid size. */
export function cardSheetFetchRangesForGrid(
  rowCount: number,
  columnCount: number,
): readonly string[] {
  const maxRow = Math.max(1, Math.min(rowCount, CARD_SHEET_GRID_ROWS))
  const out: string[] = []
  for (const slice of CARD_SHEET_FETCH_RANGES) {
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
export function buildCardSheetGridFromColumnRanges(
  valueRanges: readonly CardSheetValueRange[],
): string[][] {
  const grid: string[][] = Array.from({ length: CARD_SHEET_GRID_ROWS }, () =>
    Array(8).fill(''),
  )

  const placeColumn = (values: readonly (readonly unknown[])[], col: number) => {
    for (let row = 0; row < values.length && row < CARD_SHEET_GRID_ROWS; row++) {
      grid[row]![col] = cellValueToString(values[row]?.[0])
    }
  }

  for (const block of valueRanges) {
    const range = block.range ?? ''
    const values = block.values ?? []
    const hit = SINGLE_COLUMN_BLOCKS.find((entry) => range.includes(entry.suffix))
    if (hit) placeColumn(values, hit.col)
  }

  return grid
}

function isLikelyCardDataRowName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return workshopCardIdFromSheetName(trimmed) != null || isCardEquipSlotsSheetName(trimmed)
}

function findCardBlockStartRow(rows: readonly (readonly unknown[])[]): number | null {
  const limit = Math.min(rows.length, CARD_SHEET_GRID_ROWS)
  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    const name = cellAt(rows, rowIndex, 1)
    if (isLikelyCardDataRowName(name)) return rowIndex
  }
  return null
}

/** Detect Cards v3.x Master Sheet layout (B=name, C=level, D=mastery). */
export function detectCardSheetLayout(
  rows: readonly (readonly unknown[])[],
): CardSheetLayout | null {
  const startRow = findCardBlockStartRow(rows)
  if (startRow == null) return null

  let mappedNames = 0
  let endRow = startRow
  for (let row = startRow; row < rows.length && row < CARD_SHEET_GRID_ROWS; row++) {
    const name = cellAt(rows, row, 1)
    if (!isLikelyCardDataRowName(name)) continue
    if (workshopCardIdFromSheetName(name)) mappedNames++
    endRow = row + 1
  }

  if (mappedNames < 2 || endRow <= startRow) return null

  return {
    nameCol: 1,
    levelCol: 2,
    masteryCol: 3,
    startRow,
    endRow,
  }
}

export function parseCardSheetRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: CardSheetLayout,
): EffectivePathsCardSheetRow[] {
  const out: EffectivePathsCardSheetRow[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!isLikelyCardDataRowName(name)) continue
    out.push({
      rowIndex: i + 1,
      name,
      kind: isCardEquipSlotsSheetName(name) ? 'equip_slots' : 'card',
    })
  }
  return out
}

export function unmappedCardNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: CardSheetLayout,
): string[] {
  const out: string[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!name || isCardEquipSlotsSheetName(name)) continue
    if (workshopCardIdFromSheetName(name)) continue
    const level = cellAt(rows, i, layout.levelCol)
    const mastery = cellAt(rows, i, layout.masteryCol)
    if (!level && !mastery) continue
    out.push(name)
  }
  return out
}

export { columnIndexToA1Letter }
