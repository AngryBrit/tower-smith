/**
 * Game `ultimateWeapon*` array indices (from Il2Cpp `DevPanelUltimateWeapons`).
 * {@link WORKSHOP_ULTIMATE_WEAPON_ORDER} matches this index order (0…8).
 * See `docs/game-workshop-index-map.csv` (category `ultimate_*`).
 */

import {
  WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON,
  WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER,
  WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY,
  type WorkshopUltimatePlusAbilityId,
} from '../data/workshopUltimatePlusData'
import {
  workshopUltimateActiveKey,
  workshopUltimateOwnedKey,
  workshopUltimateWeaponUpgradeKeys,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimate'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { DecodedPlayerSave } from './decodePlayerInfo'

/** Slots per ultimate weapon in `ultimateWeaponLevel[]`. */
export const GAME_ULTIMATE_UPGRADES_PER_WEAPON = 3 as const

/** Game save index for each ultimate weapon id. */
export const GAME_ULTIMATE_WEAPON_INDEX: Readonly<
  Record<WorkshopUltimateWeaponId, number>
> = {
  chainLightning: 0,
  smartMissiles: 1,
  deathWave: 2,
  chronoField: 3,
  innerLandMines: 4,
  goldenTower: 5,
  poisonSwamp: 6,
  blackHole: 7,
  spotlight: 8,
}

/** Plus ability index in `ultimateWeaponPlusLevel[]` (wiki unlock order). */
export function gameUltimatePlusIndex(
  abilityId: WorkshopUltimatePlusAbilityId,
): number {
  return WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER.indexOf(abilityId)
}

export function mapUltimateWeaponsFromSave(
  save: DecodedPlayerSave,
  ws: WorkshopPersistedV1,
): void {
  const { ultimateWeaponLevel, ultimateWeaponUnlocked, ultimateWeaponOn, ultimateWeaponPlusLevel } =
    save

  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const gi = GAME_ULTIMATE_WEAPON_INDEX[weaponId]
    if (ultimateWeaponUnlocked[gi] === true) {
      ws[workshopUltimateOwnedKey(weaponId)] = true as never
    }
    if (ultimateWeaponOn[gi] === true) {
      ws[workshopUltimateActiveKey(weaponId)] = true as never
    }

    const upgradeKeys = workshopUltimateWeaponUpgradeKeys(weaponId)
    const base = gi * GAME_ULTIMATE_UPGRADES_PER_WEAPON
    for (let u = 0; u < upgradeKeys.length; u++) {
      const key = upgradeKeys[u]!
      const level = ultimateWeaponLevel[base + u]
      if (typeof level === 'number' && Number.isFinite(level)) {
        ws[key] = Math.max(0, Math.trunc(level)) as never
      }
    }

    const plusId = WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON[weaponId]
    const pi = gameUltimatePlusIndex(plusId)
    if (pi >= 0) {
      const plusKey = WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY[plusId]
      const plusLevel = ultimateWeaponPlusLevel[pi]
      if (typeof plusLevel === 'number' && Number.isFinite(plusLevel)) {
        ws[plusKey] = Math.trunc(plusLevel) as never
      }
    }
  }
}
