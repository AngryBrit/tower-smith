import type { EffectivePathsRelicSheetRow } from './buildRelicUnlockedUpdates'
import type { RelicSheetLayout } from './relicSheetLayout'
import { parseSheetBoolCell } from './epSheetCellParsing'
import { workshopRelicIdFromSheetName } from './relicSheetNames'

/** Read owned relic ids from Relics Master Sheet Unlocked column. */
export function relicOwnedIdsFromSheetRows(
  relicRows: readonly EffectivePathsRelicSheetRow[],
  grid: readonly (readonly unknown[])[],
  layout: RelicSheetLayout,
): string[] {
  const out: string[] = []
  for (const row of relicRows) {
    const id = workshopRelicIdFromSheetName(row.name)
    if (!id) continue
    const unlocked = parseSheetBoolCell(grid[row.rowIndex - 1]?.[layout.unlockedCol])
    if (unlocked) out.push(id)
  }
  return out
}
