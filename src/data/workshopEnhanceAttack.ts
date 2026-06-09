/**
 * Workshop **Attack Enhancements** (Enhance tab, Attack category).
 * See `workshopEnhanceAttackShared.ts` for the shared tier coin ladder.
 */

import { WORKSHOP_ENHANCE_ATTACK_GOD_NAMES, workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL,
  workshopEnhanceAttackTierStatDisplay,
} from './workshopEnhanceAttackShared'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export {
  WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL,
  WORKSHOP_ENHANCE_DAMAGE_MAX_LEVEL,
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
} from './workshopEnhanceAttackShared'

/**
 * Wiki: **Rend Armor** unlocks after **50B** coins spent on **damage** enhancements
 * (cumulative on Damage + only).
 */
export const WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS =
  50_000_000_000 as const

/**
 * Wiki: **Critical Factor** unlocks after **500B** coins spent on attack enhancements.
 */
export const WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS =
  500_000_000_000 as const

/**
 * Wiki: **Damage/Meter** unlocks after **5T** coins spent on attack enhancements.
 */
export const WORKSHOP_ENHANCE_DAMAGE_PER_METER_UNLOCK_ATTACK_ENHANCE_SPENT_COINS =
  5_000_000_000_000 as const

/**
 * Wiki: **Super Crit Mult** unlocks after **50T** coins spent on attack enhancements.
 */
export const WORKSHOP_ENHANCE_SUPER_CRIT_MULT_UNLOCK_ATTACK_ENHANCE_SPENT_COINS =
  50_000_000_000_000 as const

/**
 * Wiki: **Attack Speed** unlocks after **500T** coins spent on attack enhancements.
 */
export const WORKSHOP_ENHANCE_ATTACK_SPEED_UNLOCK_ATTACK_ENHANCE_SPENT_COINS =
  500_000_000_000_000 as const

/** Attack Speed enhancement — **75** levels → **×1.75** (`+0.01×` per level). */
export const WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL = 75 as const

export type WorkshopEnhanceAttackUpgradeKey =
  | 'enhanceDamageLevel'
  | 'enhanceRendArmorLevel'
  | 'enhanceCritFactorLevel'
  | 'enhanceDamagePerMeterLevel'
  | 'enhanceSuperCritMultLevel'
  | 'enhanceAttackSpeedLevel'

export const WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER: readonly WorkshopEnhanceAttackUpgradeKey[] =
  [
    'enhanceDamageLevel',
    'enhanceRendArmorLevel',
    'enhanceCritFactorLevel',
    'enhanceDamagePerMeterLevel',
    'enhanceSuperCritMultLevel',
    'enhanceAttackSpeedLevel',
  ]

function tierMaxForKey(_key: WorkshopEnhanceAttackUpgradeKey): number {
  return WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL
}

export function workshopEnhanceAttackMaxLevel(key: WorkshopEnhanceAttackUpgradeKey): number {
  if (key === 'enhanceAttackSpeedLevel') return WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL
  return tierMaxForKey(key)
}

export function workshopEnhanceAttackClampLevel(
  key: WorkshopEnhanceAttackUpgradeKey,
  n: number,
): number {
  const max = workshopEnhanceAttackMaxLevel(key)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(max, Math.trunc(n)))
}

export function workshopEnhanceAttackSpeedMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Attack Speed +', completedLevels)!
}

export function workshopEnhanceAttackSpeedStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceAttackSpeedMultiplier(completedLevels),
  )
}

export function workshopEnhanceAttackStatDisplay(
  key: WorkshopEnhanceAttackUpgradeKey,
  completedLevels: number,
): string {
  if (key === 'enhanceAttackSpeedLevel') {
    return workshopEnhanceAttackSpeedStatDisplay(completedLevels)
  }
  return workshopEnhanceAttackTierStatDisplay(
    completedLevels,
    WORKSHOP_ENHANCE_ATTACK_GOD_NAMES[key],
  )
}

export function workshopEnhanceAttackNextMarginalCoins(
  key: WorkshopEnhanceAttackUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins(
    WORKSHOP_ENHANCE_ATTACK_GOD_NAMES[key],
    completedLevels,
  )
}
