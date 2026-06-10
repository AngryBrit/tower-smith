import { workshopRelicIdFromSheetName } from './relicSheetNames'
import type { EffectivePathsRelicSheetRow } from './buildRelicUnlockedUpdates'

export type RelicSheetLayout = {
  /** 0-based column index in the fetched row (A = 0). */
  nameCol: number
  unlockedCol: number
  /** 0-based index into the values array; export rowIndex is startRow + 1-based sheet row. */
  startRow: number
}

export function columnIndexToA1Letter(colIndex: number): string {
  let index = colIndex
  let label = ''
  while (index >= 0) {
    label = String.fromCharCode((index % 26) + 65) + label
    index = Math.floor(index / 26) - 1
  }
  return label
}

/** Pad each row to a fixed width so column indices match A1 range columns. */
export function padSheetRowsToWidth(
  rows: readonly (readonly unknown[])[],
  width: number,
): string[][] {
  return rows.map((row) => {
    const padded: string[] = []
    for (let col = 0; col < width; col++) {
      padded.push(cellValueToString(row[col]))
    }
    return padded
  })
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

function isHeaderLikeNameCell(value: string): boolean {
  const lower = value.trim().toLowerCase()
  return (
    lower.startsWith('rarity') ||
    /^relic(\s*name)?$/i.test(lower) ||
    lower === 'name' ||
    lower === 'order'
  )
}

function isLikelyDataRowName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || isHeaderLikeNameCell(trimmed)) return false
  return workshopRelicIdFromSheetName(trimmed) != null
}

function scoreNameColumn(rows: readonly (readonly unknown[])[], col: number, startRow: number): number {
  let score = 0
  const end = Math.min(rows.length, startRow + 320)
  for (let row = startRow; row < end; row++) {
    if (workshopRelicIdFromSheetName(cellAt(rows, row, col))) score++
  }
  return score
}

function scoreUnlockedColumn(
  rows: readonly (readonly unknown[])[],
  col: number,
  startRow: number,
): number {
  let score = 0
  const end = Math.min(rows.length, startRow + 320)
  for (let row = startRow; row < end; row++) {
    const upper = cellAt(rows, row, col).toUpperCase()
    if (upper === 'TRUE' || upper === 'FALSE') score++
  }
  return score
}

/** Detect relic name + Unlocked columns on an Effective Paths Relics tab (rows A:Z). */
function isUnlockedHeaderCell(cell: string): boolean {
  const lower = cell.trim().toLowerCase()
  return lower === 'unlocked' || lower === 'owned'
}

export function detectRelicSheetLayout(
  rows: readonly (readonly unknown[])[],
): RelicSheetLayout | null {
  if (rows.length === 0) return null

  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 30); rowIndex++) {
    const row = rows[rowIndex] ?? []
    let nameCol = -1
    let unlockedCol = -1
    for (let col = 0; col < row.length; col++) {
      const cell = row[col]?.trim().toLowerCase() ?? ''
      if (/^relic(\s*name)?$/.test(cell) || cell === 'name') nameCol = col
      if (isUnlockedHeaderCell(cell)) unlockedCol = col
    }
    if (nameCol >= 0 && unlockedCol >= 0) {
      return { nameCol, unlockedCol, startRow: rowIndex + 1 }
    }
    if (row[0]?.trim().toLowerCase().startsWith('rarity')) {
      return { nameCol: 2, unlockedCol: 5, startRow: rowIndex + 1 }
    }
  }

  let startRow = 0
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 40); rowIndex++) {
    if (scoreNameColumn(rows, 2, rowIndex) >= 3) {
      startRow = rowIndex
      break
    }
  }

  const maxCols = Math.max(...rows.slice(0, 50).map((row) => row.length), 0)
  let bestNameCol = 2
  let bestNameScore = 0
  let bestUnlockedCol = 5
  let bestUnlockedScore = 0

  for (let col = 0; col < maxCols; col++) {
    const nameScore = scoreNameColumn(rows, col, startRow)
    const unlockedScore = scoreUnlockedColumn(rows, col, startRow)
    if (nameScore > bestNameScore) {
      bestNameScore = nameScore
      bestNameCol = col
    }
    if (unlockedScore > bestUnlockedScore) {
      bestUnlockedScore = unlockedScore
      bestUnlockedCol = col
    }
  }

  if (bestNameScore < 2) return null
  if (bestUnlockedScore < 1 && bestUnlockedCol === 5) {
    // Standard Effective Paths layout: Unlocked in F even when cells are blank.
    return { nameCol: bestNameCol, unlockedCol: bestUnlockedCol, startRow }
  }
  if (bestUnlockedScore < 2) return null
  return { nameCol: bestNameCol, unlockedCol: bestUnlockedCol, startRow }
}

export function parseRelicRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: RelicSheetLayout,
): EffectivePathsRelicSheetRow[] {
  const out: EffectivePathsRelicSheetRow[] = []
  for (let i = layout.startRow; i < rows.length; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!isLikelyDataRowName(name)) continue
    out.push({ rowIndex: i + 1, name })
  }
  return out
}

export function unmappedRelicNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: RelicSheetLayout,
): string[] {
  const out: string[] = []
  for (let i = layout.startRow; i < rows.length; i++) {
    const name = cellAt(rows, i, layout.nameCol)
    if (!name || isHeaderLikeNameCell(name)) continue
    if (workshopRelicIdFromSheetName(name)) continue
    const rarity = cellAt(rows, i, 0)
    if (!rarity && !cellAt(rows, i, layout.unlockedCol)) continue
    out.push(name)
  }
  return out
}
