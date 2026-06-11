import {
  WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON,
  WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY,
  type WorkshopUltimatePlusAbilityId,
  type WorkshopUltimatePlusLevelKey,
} from '../data/workshopUltimatePlusData'
import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimateData'

export type UwEpLevelKey = WorkshopUltimateUpgradeKey | WorkshopUltimatePlusLevelKey

/** UWs v3.1.2 Master Sheet — four level rows (column G) per weapon: 3 basic + 1 Plus. */
export const UW_EP_V31_STATS_PER_WEAPON = 4 as const

export const UW_EP_V31_LEVEL_FIRST_ROW = 2 as const
export const UW_EP_V31_LEVEL_LAST_ROW = 37 as const

/** First Google Sheet row (1-based) for column G level dropdowns per weapon. */
export const UW_EP_V31_LEVEL_START_ROWS: Record<WorkshopUltimateWeaponId, number> = {
  chainLightning: 2,
  smartMissiles: 6,
  deathWave: 10,
  chronoField: 14,
  innerLandMines: 18,
  goldenTower: 22,
  poisonSwamp: 26,
  blackHole: 30,
  spotlight: 34,
}

/** 0-based column index for UW unlocked checkboxes (column C). */
export const UW_EP_V31_UNLOCKED_COL = 2 as const

/** Rows between first G-level row and unlocked checkbox within each weapon block. */
export const UW_EP_V31_UNLOCK_ROW_OFFSET = 2 as const

/** UW unlocked checkbox rows (column C): C4, C8, C12, … C36. */
export const UW_EP_V31_UNLOCKED_ROWS: Record<WorkshopUltimateWeaponId, number> =
  Object.fromEntries(
    WORKSHOP_ULTIMATE_WEAPON_ORDER.map((weaponId) => [
      weaponId,
      UW_EP_V31_LEVEL_START_ROWS[weaponId] + UW_EP_V31_UNLOCK_ROW_OFFSET,
    ]),
  ) as Record<WorkshopUltimateWeaponId, number>

/** Basic + Plus level keys in Master Sheet row order (G start row + offset). */
export const UW_EP_V31_LEVEL_KEY_ORDER: Record<WorkshopUltimateWeaponId, readonly UwEpLevelKey[]> =
  Object.fromEntries(
    WORKSHOP_ULTIMATE_WEAPON_ORDER.map((weaponId) => {
      const basic = WORKSHOP_ULTIMATE_WEAPON_STATS[weaponId].map((row) => row.key)
      const plusAbility = WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON[weaponId]
      const plusKey = WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY[plusAbility]
      return [weaponId, [...basic, plusKey] as const]
    }),
  ) as unknown as Record<WorkshopUltimateWeaponId, readonly UwEpLevelKey[]>

const PLUS_LEVEL_KEYS = new Set<string>(
  Object.values(WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY),
)

export function isUwEpPlusLevelKey(levelKey: string): levelKey is WorkshopUltimatePlusLevelKey {
  return PLUS_LEVEL_KEYS.has(levelKey)
}

export function uwEpPlusAbilityForLevelKey(
  levelKey: WorkshopUltimatePlusLevelKey,
): WorkshopUltimatePlusAbilityId {
  for (const [abilityId, key] of Object.entries(WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY)) {
    if (key === levelKey) return abilityId as WorkshopUltimatePlusAbilityId
  }
  return 'chainLightningSmite'
}

/** 1-based row index for a level key on column G. */
export function uwEpRowIndexForLevelKey(levelKey: UwEpLevelKey): number | null {
  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const keys = UW_EP_V31_LEVEL_KEY_ORDER[weaponId]
    const offset = keys.indexOf(levelKey)
    if (offset >= 0) return UW_EP_V31_LEVEL_START_ROWS[weaponId] + offset
  }
  return null
}
