import { columnIndexToA1Letter } from './relicSheetLayout'
import { labSheetItemRefFromName, type LabSheetItemRef } from './labSheetNames'

export type LabSheetBlockLayout = {
  /** 0-based column index for lab name cells. */
  nameCol: number
  /** 0-based column index for level cells. */
  levelCol: number
  /** Inclusive 0-based first data row. */
  startRow: number
  /** Exclusive 0-based end row. */
  endRow: number
}

export type EffectivePathsLabSheetRow = {
  /** 1-based Google Sheet row index. */
  rowIndex: number
  name: string
  levelCol: number
  itemRef: LabSheetItemRef
}

export const LAB_SHEET_GRID_ROWS = 120
export const LAB_SHEET_GRID_COLUMNS = 72

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

function cellAt(rows: readonly (readonly unknown[])[], row: number, col: number): string {
  return cellValueToString(rows[row]?.[col])
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase()
}

function isTotalsRow(name: string): boolean {
  return /^\d+\s*\/\s*\d+$/.test(name.trim())
}

function isSkippableName(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed) return true
  const lower = normalizeHeader(trimmed)
  if (lower === 'labs' || lower === 'level' || lower === 'target' || lower === 'max') return true
  if (isTotalsRow(trimmed)) return true
  if (/^others\b/i.test(trimmed)) return true
  if (/^relic\b/i.test(trimmed)) return true
  if (/^vault\b/i.test(trimmed)) return true
  if (/^card name\b/i.test(trimmed)) return true
  return false
}

/** Clip fetch range to tab grid (Laboratory Master Sheet is wide). */
export function labSheetBlockFetchRangeForGrid(rowCount: number, columnCount: number): string | null {
  const maxRow = Math.max(1, Math.min(rowCount, LAB_SHEET_GRID_ROWS))
  const maxCol = Math.max(1, Math.min(columnCount, LAB_SHEET_GRID_COLUMNS))
  const endCol = columnIndexToA1Letter(maxCol - 1)
  return `A1:${endCol}${maxRow}`
}

/** Merge a rectangular API block into a fixed-size grid. */
export function buildLabSheetGridFromBlockRange(
  range: string | undefined,
  values: readonly (readonly unknown[])[],
  maxRow: number,
): string[][] {
  const grid: string[][] = Array.from({ length: maxRow }, () =>
    Array(LAB_SHEET_GRID_COLUMNS).fill(''),
  )
  const startMatch = range?.match(/!([A-Z]+)(\d+)/i)
  const startCol = startMatch ? columnIndexToA1LetterInverse(startMatch[1]!) : 0
  const startRow = startMatch ? Number.parseInt(startMatch[2]!, 10) - 1 : 0

  for (let r = 0; r < values.length; r++) {
    const row = values[r] ?? []
    for (let c = 0; c < row.length; c++) {
      const gr = startRow + r
      const gc = startCol + c
      if (gr < maxRow && gc < LAB_SHEET_GRID_COLUMNS) {
        grid[gr]![gc] = cellValueToString(row[c])
      }
    }
  }
  return grid
}

function columnIndexToA1LetterInverse(letters: string): number {
  let index = 0
  for (const ch of letters.toUpperCase()) {
    index = index * 26 + (ch.charCodeAt(0) - 64)
  }
  return index - 1
}

/** Find every Labs | Level block on the Master Sheet. */
export function detectLabSheetBlocks(
  rows: readonly (readonly unknown[])[],
): LabSheetBlockLayout[] {
  const blocks: LabSheetBlockLayout[] = []
  const scanRows = Math.min(rows.length, 40)
  const scanCols = LAB_SHEET_GRID_COLUMNS - 3

  for (let row = 0; row < scanRows; row++) {
    for (let col = 0; col < scanCols; col++) {
      if (normalizeHeader(cellAt(rows, row, col)) !== 'labs') continue
      const levelHeader = normalizeHeader(cellAt(rows, row, col + 1))
      const targetHeader = normalizeHeader(cellAt(rows, row, col + 2))
      if (levelHeader !== 'level') continue
      if (targetHeader !== 'target' && targetHeader !== 'max') continue

      const startRow = row + 1
      let endRow = startRow
      let emptyStreak = 0
      for (let r = startRow; r < rows.length && r < LAB_SHEET_GRID_ROWS; r++) {
        const name = cellAt(rows, r, col)
        if (!name.trim()) {
          emptyStreak++
          if (emptyStreak >= 2) break
          continue
        }
        emptyStreak = 0
        if (isTotalsRow(name)) break
        endRow = r + 1
      }

      if (endRow > startRow) {
        blocks.push({ nameCol: col, levelCol: col + 1, startRow, endRow })
      }
    }
  }

  return blocks
}

export function parseLabSheetRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  blocks: readonly LabSheetBlockLayout[],
  nameIndex: ReadonlyMap<string, LabSheetItemRef>,
): EffectivePathsLabSheetRow[] {
  const out: EffectivePathsLabSheetRow[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    for (let r = block.startRow; r < block.endRow; r++) {
      const name = cellAt(rows, r, block.nameCol)
      if (isSkippableName(name)) continue
      const itemRef = labSheetItemRefFromName(name, nameIndex)
      if (!itemRef) continue
      const dedupeKey = `${itemRef.sectionIndex}-${itemRef.itemIndex}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)
      out.push({
        rowIndex: r + 1,
        name: itemRef.canonicalName,
        levelCol: block.levelCol,
        itemRef,
      })
    }
  }

  return out
}

export function unmappedLabNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  blocks: readonly LabSheetBlockLayout[],
  nameIndex: ReadonlyMap<string, LabSheetItemRef>,
): string[] {
  const out: string[] = []
  for (const block of blocks) {
    for (let r = block.startRow; r < block.endRow; r++) {
      const name = cellAt(rows, r, block.nameCol)
      if (isSkippableName(name)) continue
      if (labSheetItemRefFromName(name, nameIndex)) continue
      const level = cellAt(rows, r, block.levelCol)
      if (!level && !name.trim()) continue
      out.push(name.trim())
    }
  }
  return out
}
