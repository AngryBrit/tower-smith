import {
  WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER,
  ULTIMATE_PLUS_LEVEL_LOCKED,
  workshopUltimatePlusLevelsFromPersisted,
  type WorkshopUltimatePlusLevelKey,
} from '../data/workshopUltimatePlus'
import {
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateWeaponIsOwned,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimate'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export type UwsEpSyncState = {
  levels: Record<string, number>
  ownedByWeaponId: Record<WorkshopUltimateWeaponId, boolean>
}

/** Ultimate weapon upgrade + Plus levels and owned flags from workshop state. */
export function uwsEpStateFromPersisted(ws: WorkshopPersistedV1): UwsEpSyncState {
  const levels: Record<string, number> = {}

  for (const key of WORKSHOP_ULTIMATE_UPGRADE_ORDER) {
    levels[key] = Math.max(0, Math.round(ws[key] ?? 0))
  }

  const plusLevels = workshopUltimatePlusLevelsFromPersisted(ws as Record<string, unknown>)
  for (const key of WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER) {
    const raw = plusLevels[key] ?? ULTIMATE_PLUS_LEVEL_LOCKED
    levels[key] = raw < 0 ? ULTIMATE_PLUS_LEVEL_LOCKED : Math.max(0, Math.round(raw))
  }

  const ownedByWeaponId = {} as Record<WorkshopUltimateWeaponId, boolean>
  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    ownedByWeaponId[weaponId] = workshopUltimateWeaponIsOwned(ws, weaponId)
  }

  return { levels, ownedByWeaponId }
}

export function uwsEpUpgradeLevel(
  state: UwsEpSyncState,
  key: WorkshopUltimateUpgradeKey,
): number {
  return Math.max(0, Math.round(state.levels[key] ?? 0))
}

export function uwsEpPlusLevel(
  state: UwsEpSyncState,
  key: WorkshopUltimatePlusLevelKey,
): number {
  const raw = state.levels[key] ?? ULTIMATE_PLUS_LEVEL_LOCKED
  return raw < 0 ? ULTIMATE_PLUS_LEVEL_LOCKED : Math.max(0, Math.round(raw))
}
