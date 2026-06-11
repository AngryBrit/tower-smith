import { ULTIMATE_PLUS_LEVEL_LOCKED } from '../data/workshopUltimatePlus'
import type { WorkshopUltimateWeaponId } from '../data/workshopUltimateData'
import { WORKSHOP_ULTIMATE_WEAPON_ORDER } from '../data/workshopUltimateData'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import { farmingDropdownLevelFromLabel, parseSheetBoolCell } from './epSheetCellParsing'
import {
  isUwEpPlusLevelKey,
  UW_EP_V31_LEVEL_KEY_ORDER,
  UW_EP_V31_LEVEL_START_ROWS,
  UW_EP_V31_UNLOCKED_ROWS,
} from './uwEpSheetNames'

const UW_FARMING_LEVEL_COL = 6
/** Input tab: D=unlocked. Some layouts place the checkbox in C instead. */
const UW_UNLOCKED_COLS = [3, 2] as const

function uwUnlockedFromGridRow(
  grid: readonly (readonly unknown[])[],
  row0: number,
): boolean {
  for (const col of UW_UNLOCKED_COLS) {
    const raw = grid[row0]?.[col]
    if (raw == null || String(raw).trim() === '') continue
    return parseSheetBoolCell(raw)
  }
  return false
}

/** Read UWs workbook sync state from Master Sheet grid. */
export function uwsEpStateFromSheetGrid(
  grid: readonly (readonly unknown[])[],
): UwsEpSyncState {
  const levels: Record<string, number> = {}
  const ownedByWeaponId = {} as Record<WorkshopUltimateWeaponId, boolean>

  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const unlockedRow = UW_EP_V31_UNLOCKED_ROWS[weaponId]
    ownedByWeaponId[weaponId] = uwUnlockedFromGridRow(grid, unlockedRow - 1)

    const startRow = UW_EP_V31_LEVEL_START_ROWS[weaponId]
    const levelKeys = UW_EP_V31_LEVEL_KEY_ORDER[weaponId]
    levelKeys.forEach((levelKey, index) => {
      const label = String(grid[startRow - 1 + index]?.[UW_FARMING_LEVEL_COL] ?? '')
      const plusLocked = isUwEpPlusLevelKey(levelKey) ? ULTIMATE_PLUS_LEVEL_LOCKED : 0
      const level = farmingDropdownLevelFromLabel(label, { plusLockedValue: plusLocked })
      if (level == null) return
      levels[levelKey] = level
    })
  }

  return { levels, ownedByWeaponId }
}
