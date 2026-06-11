import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import type {
  EffectivePathsWorkshopSheetRow,
  WorkshopEnhanceSheetLayout,
  WorkshopSheetLayout,
} from './workshopSheetLayout'
import { columnIndexToA1Letter } from './workshopSheetLayout'
import { workshopEnhanceIdFromSheetName } from './workshopSheetNames'
import {
  workshopUpgradeUnlockedForEp,
  workshopUpgradeWritesUnlockColumn,
} from './workshopEpUnlock'

export type WorkshopSheetBatchUpdate = {
  range: string
  values: string[][]
}

/** Build per-row updates for unlocked and farming level on Workshop Master Sheet. */
export function buildWorkshopSheetUpdates(
  sheetTitle: string,
  workshopRows: readonly EffectivePathsWorkshopSheetRow[],
  workshopLevels: Readonly<Record<string, number>>,
  layout: WorkshopSheetLayout,
): WorkshopSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const unlockedCol = columnIndexToA1Letter(layout.unlockedCol)
  const levelCol = columnIndexToA1Letter(layout.levelCol)
  const out: WorkshopSheetBatchUpdate[] = []

  for (const row of workshopRows) {
    const upgradeId = row.upgradeId
    if (!upgradeId) continue
    const level = Math.max(0, Math.round(workshopLevels[upgradeId] ?? 0))
    if (workshopUpgradeWritesUnlockColumn(upgradeId)) {
      out.push({
        range: `${quoted}!${unlockedCol}${row.rowIndex}`,
        values: [[workshopUpgradeUnlockedForEp(upgradeId, level) ? 'TRUE' : 'FALSE']],
      })
    }
    out.push({
      range: `${quoted}!${levelCol}${row.rowIndex}`,
      values: [[String(level)]],
    })
  }

  return out
}

/** Build per-row updates for enhancement level (R) on Workshop v3.x Master Sheet. */
export function buildWorkshopEnhanceSheetUpdates(
  sheetTitle: string,
  enhanceRows: readonly EffectivePathsWorkshopSheetRow[],
  workshopLevels: Readonly<Record<string, number>>,
  layout: WorkshopEnhanceSheetLayout,
): WorkshopSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const levelCol = columnIndexToA1Letter(layout.levelCol)
  const out: WorkshopSheetBatchUpdate[] = []

  for (const row of enhanceRows) {
    const enhanceId = workshopEnhanceIdFromSheetName(row.name)
    if (!enhanceId) continue
    const level = Math.max(0, Math.round(workshopLevels[enhanceId] ?? 0))
    out.push({
      range: `${quoted}!${levelCol}${row.rowIndex}`,
      values: [[String(level)]],
    })
  }

  return out
}
