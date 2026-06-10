import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import type { EffectivePathsWorkshopSheetRow } from './workshopSheetLayout'
import { columnIndexToA1Letter } from './workshopSheetLayout'
import { workshopUpgradeIdFromSheetName } from './workshopSheetNames'
import { workshopUpgradeUnlockedForEp } from './workshopEpUnlock'

export type WorkshopSheetBatchUpdate = {
  range: string
  values: string[][]
}

/** Build per-row updates for unlocked (B) and level (D) on Workshop v3.x Master Sheet. */
export function buildWorkshopSheetUpdates(
  sheetTitle: string,
  workshopRows: readonly EffectivePathsWorkshopSheetRow[],
  workshopLevels: Readonly<Record<string, number>>,
): WorkshopSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const unlockedCol = columnIndexToA1Letter(1)
  const levelCol = columnIndexToA1Letter(3)
  const out: WorkshopSheetBatchUpdate[] = []

  for (const row of workshopRows) {
    const upgradeId = workshopUpgradeIdFromSheetName(row.name)
    if (!upgradeId) continue
    const level = Math.max(0, Math.round(workshopLevels[upgradeId] ?? 0))
    out.push({
      range: `${quoted}!${unlockedCol}${row.rowIndex}`,
      values: [[workshopUpgradeUnlockedForEp(upgradeId, level) ? 'TRUE' : 'FALSE']],
    })
    out.push({
      range: `${quoted}!${levelCol}${row.rowIndex}`,
      values: [[level]],
    })
  }

  return out
}
