/**
 * Workshop **Attack Enhancements** (Enhance tab, Attack category).
 * See `workshopEnhanceAttackShared.ts` for the shared tier coin ladder.
 */

import {
  WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL,
  workshopEnhanceAttackTierNextMarginalCoins,
  workshopEnhanceAttackTierStatDisplay,
} from './workshopEnhanceAttackShared'

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

/** Marginal coins for attack-speed enhancement levels 1…75 (wiki **Coins** per row). */
const ENHANCE_ATTACK_SPEED_MARGINAL: readonly number[] = [
  5e9, 6.1e9, 23.58e9, 106.2e9, 343.19e9, 867.83e9, 1.86e12, 3.55e12, 6.21e12, 10.19e12,
  15.85e12, 23.66e12, 34.09e12, 47.71e12, 65.13e12, 87.02e12, 114.11e12, 294.4e12, 561.41e12,
  939.37e12, 1.46e15, 2.15e15, 3.04e15, 4.19e15, 5.64e15, 7.44e15, 9.64e15, 12.33e15,
  15.56e15, 19.42e15, 23.99e15, 35.24e15, 49.91e15, 68.73e15, 92.52e15, 122.22e15, 158.9e15,
  203.74e15, 258.1e15, 323.48e15, 401.53e15, 494.1e15, 603.24e15, 731.19e15, 880.41e15,
  1.05e18, 1.25e18, 1.48e18, 1.75e18, 2.05e18, 2.39e18, 3.2e18, 4.19e18, 5.39e18, 6.83e18,
  8.57e18, 10.62e18, 13.06e18, 15.92e18, 19.26e18, 23.15e18, 27.65e18, 32.85e18, 38.82e18,
  45.67e18, 53.48e18, 62.37e18, 72.45e18, 83.85e18, 96.72e18, 111.19e18, 127.44e18, 145.64e18,
  165.96e18, 188.63e18,
]

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
  const L = Math.min(
    Math.max(0, completedLevels),
    WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL,
  )
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceAttackSpeedStatDisplay(completedLevels: number): string {
  return `${workshopEnhanceAttackSpeedMultiplier(completedLevels).toFixed(2)}×`
}

function enhanceAttackSpeedNextMarginalCoins(completedLevels: number): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL) {
    return undefined
  }
  return ENHANCE_ATTACK_SPEED_MARGINAL[completedLevels]
}

export function workshopEnhanceAttackStatDisplay(
  key: WorkshopEnhanceAttackUpgradeKey,
  completedLevels: number,
): string {
  if (key === 'enhanceAttackSpeedLevel') {
    return workshopEnhanceAttackSpeedStatDisplay(completedLevels)
  }
  return workshopEnhanceAttackTierStatDisplay(completedLevels, tierMaxForKey(key))
}

export function workshopEnhanceAttackNextMarginalCoins(
  key: WorkshopEnhanceAttackUpgradeKey,
  completedLevels: number,
): number | undefined {
  if (key === 'enhanceAttackSpeedLevel') {
    return enhanceAttackSpeedNextMarginalCoins(completedLevels)
  }
  return workshopEnhanceAttackTierNextMarginalCoins(
    completedLevels,
    tierMaxForKey(key),
  )
}
