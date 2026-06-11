import { workshopEnhanceIdFromSheetName } from './workshopSheetNames'
import type { WorkshopEpUpgradeKey } from './workshopSheetNames'
import {
  isWorkshopUnlockGateSheetLabel,
  normalizeWorkshopUpgradeSheetLabel,
  workshopUpgradeIdFromSheetLabel,
} from './workshopSheetUnlockGates'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type WorkshopSheetLayout = {
  /** 0-based column index for unlocked checkboxes (B). */
  unlockedCol: number
  /** 0-based column index for upgrade name cells (C). */
  nameCol: number
  /** 0-based column index for farming level cells (D). */
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
  /** Resolved when the sheet uses unlock-gate labels instead of canonical upgrade names. */
  upgradeId?: WorkshopEpUpgradeKey
}

export type WorkshopEnhanceSheetLayout = {
  /** 0-based column index for enhancement name cells (P). */
  nameCol: number
  /** 0-based column index for enhancement farming level cells (R, Preset 3). */
  levelCol: number
  /** Inclusive 0-based first data row. */
  startRow: number
  /** Exclusive 0-based end row. */
  endRow: number
}

export const WORKSHOP_SHEET_GRID_ROWS = 70
export const WORKSHOP_SHEET_GRID_COLUMNS = 24

/** 0-based column index for workshop upgrade max (N). Not synced — import/export uses D only. */
export const WORKSHOP_UPGRADE_MAX_COL = 13
/** 0-based column index for Workshop Enhancements name (P). */
export const WORKSHOP_ENHANCE_NAME_COL = 15
/** 0-based column index for Workshop Enhancements farming level (R). */
export const WORKSHOP_ENHANCE_LEVEL_COL = 17
/** 0-based column index for enhancement max on clean sheets (W). Not synced. */
export const WORKSHOP_ENHANCE_MAX_COL = 22

const WORKSHOP_UPGRADE_LAYOUT = {
  unlockedCol: 1,
  nameCol: 2,
  levelCol: 3,
} as const

const WORKSHOP_ENHANCE_LAYOUT = {
  nameCol: WORKSHOP_ENHANCE_NAME_COL,
  levelCol: WORKSHOP_ENHANCE_LEVEL_COL,
} as const

/** Single-column fetches for Workshop v3.x Master Sheet. */
export const WORKSHOP_SHEET_FETCH_RANGES = [
  'B1:B70',
  'C1:C70',
  'D1:D70',
  'N1:N70',
  'P1:P70',
  'R1:R70',
  'W1:W70',
] as const

const SINGLE_COLUMN_BLOCKS: readonly { suffix: string; col: number }[] = [
  { suffix: '!B1:B', col: 1 },
  { suffix: '!C1:C', col: 2 },
  { suffix: '!D1:D', col: 3 },
  { suffix: '!N1:N', col: WORKSHOP_UPGRADE_MAX_COL },
  { suffix: '!P1:P', col: WORKSHOP_ENHANCE_NAME_COL },
  { suffix: '!R1:R', col: WORKSHOP_ENHANCE_LEVEL_COL },
  { suffix: '!W1:W', col: WORKSHOP_ENHANCE_MAX_COL },
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

function parseWorkshopMaxLevelHint(rows: readonly (readonly unknown[])[], row: number): number | undefined {
  const text = cellAt(rows, row, WORKSHOP_UPGRADE_MAX_COL)
  if (!text) return undefined
  const n = Number(text)
  return Number.isFinite(n) ? Math.round(n) : undefined
}

function isWorkshopSectionBoundaryLabel(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return (
    /↓\s*workshop/i.test(trimmed) ||
    /↓\s*other/i.test(trimmed) ||
    /generator/i.test(trimmed) ||
    /^🔶\s*core$/i.test(trimmed)
  )
}

function resolveWorkshopUpgradeOnRow(
  rows: readonly (readonly unknown[])[],
  row: number,
  gateOccurrence: Map<string, number>,
): WorkshopEpUpgradeKey | null {
  const name = cellAt(rows, row, WORKSHOP_UPGRADE_LAYOUT.nameCol)
  if (!name || isWorkshopSectionBoundaryLabel(name)) return null

  const gateKey = normalizeWorkshopUpgradeSheetLabel(name).toLowerCase()
  const occurrence = gateOccurrence.get(gateKey) ?? 0
  const upgradeId = workshopUpgradeIdFromSheetLabel(name, {
    maxLevelHint: parseWorkshopMaxLevelHint(rows, row),
    occurrence: isWorkshopUnlockGateSheetLabel(name) ? occurrence : undefined,
  })
  if (upgradeId && isWorkshopUnlockGateSheetLabel(name)) {
    gateOccurrence.set(gateKey, occurrence + 1)
  }
  return upgradeId
}

function findWorkshopBlockStartRow(rows: readonly (readonly unknown[])[]): number | null {
  const gateOccurrence = new Map<string, number>()
  const limit = Math.min(rows.length, WORKSHOP_SHEET_GRID_ROWS)
  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    if (resolveWorkshopUpgradeOnRow(rows, rowIndex, gateOccurrence)) return rowIndex
  }
  return null
}

/** Detect Workshop v3.x Master Sheet layout (B=unlocked, C=name, D=farming level, N=max). */
export function detectWorkshopSheetLayout(
  rows: readonly (readonly unknown[])[],
): WorkshopSheetLayout | null {
  const startRow = findWorkshopBlockStartRow(rows)
  if (startRow == null) return null

  const gateOccurrence = new Map<string, number>()
  let mappedNames = 0
  let endRow = startRow
  for (let row = startRow; row < rows.length && row < WORKSHOP_SHEET_GRID_ROWS; row++) {
    const name = cellAt(rows, row, WORKSHOP_UPGRADE_LAYOUT.nameCol)
    if (!name.trim()) continue
    if (isWorkshopSectionBoundaryLabel(name)) continue

    const upgradeId = resolveWorkshopUpgradeOnRow(rows, row, gateOccurrence)
    if (!upgradeId) continue
    mappedNames++
    endRow = row + 1
  }

  if (mappedNames < 2 || endRow <= startRow) return null

  return {
    unlockedCol: WORKSHOP_UPGRADE_LAYOUT.unlockedCol,
    nameCol: WORKSHOP_UPGRADE_LAYOUT.nameCol,
    levelCol: WORKSHOP_UPGRADE_LAYOUT.levelCol,
    startRow,
    endRow,
  }
}

export function parseWorkshopSheetRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopSheetLayout,
): EffectivePathsWorkshopSheetRow[] {
  const out: EffectivePathsWorkshopSheetRow[] = []
  const gateOccurrence = new Map<string, number>()
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    const upgradeId = resolveWorkshopUpgradeOnRow(rows, i, gateOccurrence)
    if (!upgradeId) continue
    out.push({
      rowIndex: i + 1,
      name,
      upgradeId,
    })
  }
  return out
}

export function unmappedWorkshopNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: WorkshopSheetLayout,
): string[] {
  const out: string[] = []
  const gateOccurrence = new Map<string, number>()
  for (let i = layout.startRow; i < layout.endRow; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!name) continue
    if (resolveWorkshopUpgradeOnRow(rows, i, gateOccurrence)) continue
    if (isWorkshopUnlockGateSheetLabel(name)) continue
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
    const name = cellAt(rows, rowIndex, WORKSHOP_ENHANCE_LAYOUT.nameCol)
    if (isLikelyWorkshopEnhanceDataRowName(name)) return rowIndex
  }
  return null
}

/** Detect Workshop Enhancements block (P=name, R=farming level, W=max). */
export function detectWorkshopEnhanceSheetLayout(
  rows: readonly (readonly unknown[])[],
): WorkshopEnhanceSheetLayout | null {
  const startRow = findWorkshopEnhanceBlockStartRow(rows)
  if (startRow == null) return null

  let mappedNames = 0
  let endRow = startRow
  for (let row = startRow; row < rows.length && row < WORKSHOP_SHEET_GRID_ROWS; row++) {
    const name = cellAt(rows, row, WORKSHOP_ENHANCE_LAYOUT.nameCol)
    if (!isLikelyWorkshopEnhanceDataRowName(name)) continue
    if (workshopEnhanceIdFromSheetName(name)) mappedNames++
    endRow = row + 1
  }

  if (mappedNames < 2 || endRow <= startRow) return null

  return {
    nameCol: WORKSHOP_ENHANCE_LAYOUT.nameCol,
    levelCol: WORKSHOP_ENHANCE_LAYOUT.levelCol,
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
