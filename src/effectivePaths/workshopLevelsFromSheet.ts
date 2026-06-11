import type {
  EffectivePathsWorkshopSheetRow,
  WorkshopEnhanceSheetLayout,
  WorkshopSheetLayout,
} from './workshopSheetLayout'
import { workshopEnhanceIdFromSheetName, workshopUpgradeIdFromSheetName } from './workshopSheetNames'

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

/** Read Workshop Master Sheet level cells into TowerSmith workshop level keys. */
export function workshopLevelsFromSheetRows(
  workshopRows: readonly EffectivePathsWorkshopSheetRow[],
  enhanceRows: readonly EffectivePathsWorkshopSheetRow[],
  grid: readonly (readonly unknown[])[],
  layout: WorkshopSheetLayout,
  enhanceLayout: WorkshopEnhanceSheetLayout | null,
): Record<string, number> {
  const out: Record<string, number> = {}

  for (const row of workshopRows) {
    const upgradeId = workshopUpgradeIdFromSheetName(row.name)
    if (!upgradeId) continue
    const level = parseSheetLevelCell(grid[row.rowIndex - 1]?.[layout.levelCol])
    if (level == null) continue
    out[upgradeId] = level
  }

  if (enhanceLayout) {
    for (const row of enhanceRows) {
      const enhanceId = workshopEnhanceIdFromSheetName(row.name)
      if (!enhanceId) continue
      const level = parseSheetLevelCell(grid[row.rowIndex - 1]?.[enhanceLayout.levelCol])
      if (level == null) continue
      out[enhanceId] = level
    }
  }

  return out
}
