import type { EffectivePathsThemeSheetRow } from './buildThemeOwnedUpdates'
import { parseSheetBoolCell } from './epSheetCellParsing'
import { gameThemeIdFromSheetName } from './themeSheetNames'

/** Read owned theme ids from Themes & Songs Master Sheet owned columns. */
export function themeOwnedIdsFromSheetRows(
  themeRows: readonly EffectivePathsThemeSheetRow[],
  grid: readonly (readonly unknown[])[],
): string[] {
  const out: string[] = []
  for (const row of themeRows) {
    const id = gameThemeIdFromSheetName(row.name, row.section)
    if (!id) continue
    const owned = parseSheetBoolCell(grid[row.rowIndex - 1]?.[row.ownedCol])
    if (owned) out.push(id)
  }
  return out
}
