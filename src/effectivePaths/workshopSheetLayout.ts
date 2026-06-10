import { workshopEnhanceIdFromSheetName, workshopUpgradeIdFromSheetName } from './workshopSheetNames'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type WorkshopSheetLayout = {
  /** 0-based column index for unlocked checkboxes (B). */
  unlockedCol: number
  /** 0-based column index for upgrade name cells (C). */
  nameCol: number
  /** 0-based column index for level cells (D). */
  levelCol: number
  /** Inclusive 0-based first data row. */
  startRow: number
  /** Exclusive 0-based end row. */
  endRow: number
}

export type EffectivePathsWorkshopSheetRow = {
  /** 1-based row index in the Google Sheet. */
  rowIndex: number
  name: string
}

export type WorkshopEnhanceSheetLayout = {
  /** 0-based column index for enhancement name cells (P). */
  nameCol: number
  /** 0-based column index for enhancement level cells (R). */
  levelCol: number
  /** Inclusive 0-based first data row. */
  startRow: number
  /** Exclusive 0-based end row. */
  endRow: number
}

export const WORKSHOP_SHEET_GRID_ROWS = 70
export const WORKSHOP_SHEET_GRID_COLUMNS = 24

/** 0-based column index for Workshop Enhancements name (P). */
export const WORKSHOP_ENHANCE_NAME_COL = 15
/** 0-based column index for Workshop Enhancements level (R). */
export const WORKSHOP_ENHANCE_LEVEL_COL = 17

/** Single-column fetches for Workshop v3.x Master Sheet. */
export const WORKSHOP_SHEET_FETCH_RANGES = [
  'B1:B70',
  'C1:C70',
  'D1:D70',
  'P1:P70',
  'R1:R70',
] as const

const SINGLE_COLUMN_BLOCKS: readonly { suffix: string; col: number }[] = [
  { suffix: '!B1:B', col: 1 },
  { suffix: '!C1:C', col: 2 },
  { suffix: '!D1:D', col: 3 },
  { suffix: '!P1:P', col: WORKSHOP_ENHANCE_NAME_COL },
  { suffix: '!R1:R', col: WORKSHOP_ENHANCE_LEVEL_COL },
]

type WorkshopSheetValueRange = {
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

/** Clip workshop fetch ranges to a tab's grid size. */
export function workshopSheetFetchRangesForGrid(
  rowCount: number,
  columnCount: number,
): readonly string[] {
  const maxRow = Math.max(1, Math.min(rowCount, WORKSHOP_SHEET_GRID_ROWS))
  const out: string[] = []
  for (const slice of WORKSHOP_SHEET_FETCH_RANGES) {
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
export function buildWorkshopSheetGridFromColumnRanges(
  valueRanges: readonly WorkshopSheetValueRange[],
): string[][] {
  const grid: string[][] = Array.from({ length: WORKSHOP_SHEET_GRID_ROWS }, () =>
    Array(WORKSHOP_SHEET_GRID_COLUMNS).fill(''),
  )

  const placeColumn = (values: readonly (readonly unknown[])[], col: number) => {
    for (let row = 0; row < values.length && row < WORKSHOP_SHEET_GRID_ROWS; row++) {
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

function isLikelyWorkshopDataRowName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return workshopUpgradeIdFromSheetName(trimmed) != null
}

function findWorkshopBlockStartRow(rows: readonly (readonly unknown[])[]): number | null {
  const limit = Math.min(rows.length, WORKSHOP_SHEET_GRID_ROWS)
  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    const name = cellAt(rows, rowIndex, 2)
    if (isLikelyWorkshopDataRowName(name)) return rowIndex
  }
  return null
}

/** Detect Workshop v3.x Master Sheet layout (B=unlocked, C=name, D=level). */
export function detectWorkshopSheetLayout(
  rows: readonly (readonly unknown[])[],
): WorkshopSheetLayout | null {
  const startRow = findWorkshopBlockStartRow(rows)
  if (startRow == null) return null

  let mappedNames = 0
  let endRow = startRow
  for (let row = startRow; row < rows.length && row < WORKSHOP_SHEET_GRID_ROWS; row++) {
    const name = cellAt(rows, row, 2)
    if (!isLikelyWorkshopDataRowName(name)) continue
    if (workshopUpgradeIdFromSheetName(name)) mappedNames++
    endRow = row + 1
  }

  if (mappedNames < 2 || endRow <= startRow) return null

  return {
    unlockedCol: 1,
    nameCol: 2,
    levelCol: 3,
    startRow,
    endRow,
  }
}

export function parseWorkshopSheetRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopSheetLayout,
): EffectivePathsWorkshopSheetRow[] {
  const out: EffectivePathsWorkshopSheetRow[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!isLikelyWorkshopDataRowName(name)) continue
    out.push({
      rowIndex: i + 1,
      name,
    })
  }
  return out
}

export function unmappedWorkshopNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopSheetLayout,
): string[] {
  const out: string[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!name) continue
    if (workshopUpgradeIdFromSheetName(name)) continue
    const unlocked = cellAt(rows, i, layout.unlockedCol)
    const level = cellAt(rows, i, layout.levelCol)
    if (!unlocked && !level) continue
    out.push(name)
  }
  return out
}

function isLikelyWorkshopEnhanceDataRowName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return workshopEnhanceIdFromSheetName(trimmed) != null
}

function findWorkshopEnhanceBlockStartRow(rows: readonly (readonly unknown[])[]): number | null {
  const limit = Math.min(rows.length, WORKSHOP_SHEET_GRID_ROWS)
  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    const name = cellAt(rows, rowIndex, WORKSHOP_ENHANCE_NAME_COL)
    if (isLikelyWorkshopEnhanceDataRowName(name)) return rowIndex
  }
  return null
}

/** Detect Workshop v3.x Enhancements block (P=name, R=level). */
export function detectWorkshopEnhanceSheetLayout(
  rows: readonly (readonly unknown[])[],
): WorkshopEnhanceSheetLayout | null {
  const startRow = findWorkshopEnhanceBlockStartRow(rows)
  if (startRow == null) return null

  let mappedNames = 0
  let endRow = startRow
  for (let row = startRow; row < rows.length && row < WORKSHOP_SHEET_GRID_ROWS; row++) {
    const name = cellAt(rows, row, WORKSHOP_ENHANCE_NAME_COL)
    if (!isLikelyWorkshopEnhanceDataRowName(name)) continue
    if (workshopEnhanceIdFromSheetName(name)) mappedNames++
    endRow = row + 1
  }

  if (mappedNames < 2 || endRow <= startRow) return null

  return {
    nameCol: WORKSHOP_ENHANCE_NAME_COL,
    levelCol: WORKSHOP_ENHANCE_LEVEL_COL,
    startRow,
    endRow,
  }
}

export function parseWorkshopEnhanceSheetRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopEnhanceSheetLayout,
): EffectivePathsWorkshopSheetRow[] {
  const out: EffectivePathsWorkshopSheetRow[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!isLikelyWorkshopEnhanceDataRowName(name)) continue
    out.push({
      rowIndex: i + 1,
      name,
    })
  }
  return out
}

export function unmappedWorkshopEnhanceNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopEnhanceSheetLayout,
): string[] {
  const out: string[] = []
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!name) continue
    if (workshopEnhanceIdFromSheetName(name)) continue
    const level = cellAt(rows, i, layout.levelCol)
    if (!level) continue
    out.push(name)
  }
  return out
}

export { columnIndexToA1Letter }
