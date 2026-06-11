import type { EffectivePathsLabSheetRow } from './labSheetLayout'

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

function parseSheetLevelCell(raw: unknown): number | null {
  const text = cellValueToString(raw)
  if (!text) return 0
  const n = Number(text)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.round(n))
}

/** Read Laboratory Master Sheet Level column values into TowerSmith override keys. */
export function labsLevelOverridesFromSheetRows(
  labRows: readonly EffectivePathsLabSheetRow[],
  grid: readonly (readonly unknown[])[],
): Record<string, number> {
  const out: Record<string, number> = {}

  for (const row of labRows) {
    const level = parseSheetLevelCell(grid[row.rowIndex - 1]?.[row.levelCol])
    if (level == null) continue
    const { sectionIndex, itemIndex } = row.itemRef
    out[`${sectionIndex}-${itemIndex}`] = level
  }

  return out
}
