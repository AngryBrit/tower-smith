/**
 * Enhancement unlock gates (wiki cumulative spend on category enhancements).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER,
  workshopEnhanceDefenseNextMarginalCoins,
  WORKSHOP_ENHANCE_HEALTH_REGEN_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_DEFENSE_ABSOLUTE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_WALL_HEALTH_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ORB_SIZE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  type WorkshopEnhanceDefenseUpgradeKey,
} from './workshopEnhanceDefense'
import {
  WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER,
  workshopEnhanceUtilityNextMarginalCoins,
  WORKSHOP_ENHANCE_COIN_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_CELLS_KILL_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_FREE_UPGRADES_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_RECOVERY_PACKAGE_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  type WorkshopEnhanceUtilityUpgradeKey,
} from './workshopEnhanceUtility'
import {
  WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER,
  workshopEnhanceAttackNextMarginalCoins,
  WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_DAMAGE_PER_METER_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_SUPER_CRIT_MULT_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ATTACK_SPEED_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  type WorkshopEnhanceAttackUpgradeKey,
} from './workshopEnhanceAttack'

function sumMarginalSteps(
  nextAt: (completed: number) => number | undefined,
  fromLevel: number,
  toExclusive: number,
): number {
  let s = 0
  for (let L = fromLevel; L < toExclusive; L += 1) {
    const c = nextAt(L)
    if (c != null) s += c
  }
  return s
}

/** Wiki unlock gates use list **Coins** column totals, not coins paid after lab discount. */
function defenseNextAt(key: WorkshopEnhanceDefenseUpgradeKey): (completed: number) => number | undefined {
  return (L) => workshopEnhanceDefenseNextMarginalCoins(key, L)
}

function utilityNextAt(key: WorkshopEnhanceUtilityUpgradeKey): (completed: number) => number | undefined {
  return (L) => workshopEnhanceUtilityNextMarginalCoins(key, L)
}

function attackNextAt(key: WorkshopEnhanceAttackUpgradeKey): (completed: number) => number | undefined {
  return (L) => workshopEnhanceAttackNextMarginalCoins(key, L)
}

const DEFENSE_UNLOCK_REQUIRED: Record<WorkshopEnhanceDefenseUpgradeKey, number> = {
  enhanceHealthLevel: 0,
  enhanceHealthRegenLevel: WORKSHOP_ENHANCE_HEALTH_REGEN_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  enhanceDefenseAbsoluteLevel: WORKSHOP_ENHANCE_DEFENSE_ABSOLUTE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  enhanceLandMineDamageLevel: WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  enhanceWallHealthLevel: WORKSHOP_ENHANCE_WALL_HEALTH_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  enhanceOrbSizeLevel: WORKSHOP_ENHANCE_ORB_SIZE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
}

const UTILITY_UNLOCK_REQUIRED: Record<WorkshopEnhanceUtilityUpgradeKey, number> = {
  enhanceCashBonusLevel: 0,
  enhanceCoinBonusLevel: WORKSHOP_ENHANCE_COIN_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  enhanceCellsKillBonusLevel: WORKSHOP_ENHANCE_CELLS_KILL_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  enhanceFreeUpgradesLevel: WORKSHOP_ENHANCE_FREE_UPGRADES_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  enhanceRecoveryPackageLevel: WORKSHOP_ENHANCE_RECOVERY_PACKAGE_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  enhanceEnemyLevelSkipLevel: WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
}

const ATTACK_UNLOCK_REQUIRED: Record<WorkshopEnhanceAttackUpgradeKey, number> = {
  enhanceDamageLevel: 0,
  enhanceRendArmorLevel: WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS,
  enhanceCritFactorLevel: WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  enhanceDamagePerMeterLevel: WORKSHOP_ENHANCE_DAMAGE_PER_METER_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  enhanceSuperCritMultLevel: WORKSHOP_ENHANCE_SUPER_CRIT_MULT_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  enhanceAttackSpeedLevel: WORKSHOP_ENHANCE_ATTACK_SPEED_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
}

/**
 * Rend Armor enhancements count once in {@link workshopEnhanceAttackCategorySpentCoins} and an extra
 * **~31.6%** of rend spend toward later attack unlock gates (damage-enhancement route). Calibrated
 * to in-game **Attack Speed** unlock progress at **40/40/40/40** on the four tier-400 attack rows
 * (~**57.91T** spent, **442.09T** remaining on the **500T** gate).
 */
export const WORKSHOP_REND_ARMOR_ATTACK_UNLOCK_EXTRA_FRACTION = 0.3156624235836399 as const

function workshopEnhanceRendArmorSpentCoins(ws: WorkshopPersistedV1): number {
  const level = ws.enhanceRendArmorLevel
  return sumMarginalSteps(attackNextAt('enhanceRendArmorLevel'), 0, Math.max(0, level))
}

export function workshopEnhanceDefenseUnlockRequiredCoins(
  key: WorkshopEnhanceDefenseUpgradeKey,
): number {
  return DEFENSE_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceUtilityUnlockRequiredCoins(
  key: WorkshopEnhanceUtilityUpgradeKey,
): number {
  return UTILITY_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceAttackUnlockRequiredCoins(
  key: WorkshopEnhanceAttackUpgradeKey,
): number {
  return ATTACK_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceAttackCategorySpentCoins(ws: WorkshopPersistedV1): number {
  let total = 0
  for (const key of WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER) {
    const level = ws[key]
    total += sumMarginalSteps(attackNextAt(key), 0, Math.max(0, level))
  }
  return total
}

export function workshopEnhanceAttackDamageEnhanceSpentCoins(ws: WorkshopPersistedV1): number {
  const level = ws.enhanceDamageLevel
  return sumMarginalSteps(attackNextAt('enhanceDamageLevel'), 0, Math.max(0, level))
}

/** Spend counted toward unlocking this attack enhancement (wiki damage-only vs category). */
export function workshopEnhanceAttackUnlockSpentCoins(
  key: WorkshopEnhanceAttackUpgradeKey,
  ws: WorkshopPersistedV1,
): number {
  if (key === 'enhanceRendArmorLevel') {
    return workshopEnhanceAttackDamageEnhanceSpentCoins(ws)
  }
  const category = workshopEnhanceAttackCategorySpentCoins(ws)
  const rendExtra =
    workshopEnhanceRendArmorSpentCoins(ws) * WORKSHOP_REND_ARMOR_ATTACK_UNLOCK_EXTRA_FRACTION
  return category + rendExtra
}

export function workshopEnhanceDefenseCategorySpentCoins(ws: WorkshopPersistedV1): number {
  let total = 0
  for (const key of WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER) {
    const level = ws[key]
    total += sumMarginalSteps(defenseNextAt(key), 0, Math.max(0, level))
  }
  return total
}

export function workshopEnhanceUtilityCategorySpentCoins(ws: WorkshopPersistedV1): number {
  let total = 0
  for (const key of WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER) {
    const level = ws[key]
    total += sumMarginalSteps(utilityNextAt(key), 0, Math.max(0, level))
  }
  return total
}

export function workshopEnhanceDefenseIsUnlocked(
  key: WorkshopEnhanceDefenseUpgradeKey,
  categorySpentCoins: number,
  labEnhancementsUnlocked = true,
): boolean {
  if (!labEnhancementsUnlocked) return false
  return categorySpentCoins >= DEFENSE_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceUtilityIsUnlocked(
  key: WorkshopEnhanceUtilityUpgradeKey,
  categorySpentCoins: number,
  labEnhancementsUnlocked = true,
): boolean {
  if (!labEnhancementsUnlocked) return false
  return categorySpentCoins >= UTILITY_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceAttackIsUnlocked(
  key: WorkshopEnhanceAttackUpgradeKey,
  unlockSpentCoins: number,
  labEnhancementsUnlocked = true,
): boolean {
  if (!labEnhancementsUnlocked) return false
  return unlockSpentCoins >= ATTACK_UNLOCK_REQUIRED[key]
}

export function workshopEnhanceDefenseUnlockRemainingCoins(
  key: WorkshopEnhanceDefenseUpgradeKey,
  categorySpentCoins: number,
): number {
  return Math.max(0, DEFENSE_UNLOCK_REQUIRED[key] - categorySpentCoins)
}

export function workshopEnhanceUtilityUnlockRemainingCoins(
  key: WorkshopEnhanceUtilityUpgradeKey,
  categorySpentCoins: number,
): number {
  return Math.max(0, UTILITY_UNLOCK_REQUIRED[key] - categorySpentCoins)
}

export function workshopEnhanceAttackUnlockRemainingCoins(
  key: WorkshopEnhanceAttackUpgradeKey,
  unlockSpentCoins: number,
): number {
  return Math.max(0, ATTACK_UNLOCK_REQUIRED[key] - unlockSpentCoins)
}
