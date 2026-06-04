/**
 * Workshop **Utility Enhancements** (Enhance tab, Utility category).
 */

import {
  WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL,
  workshopEnhanceEnemyLevelSkipNextMarginalCoins,
  workshopEnhanceEnemyLevelSkipStatDisplay,
} from './workshopEnhanceEnemyLevelSkip'
import {
  WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL,
  workshopEnhanceFreeUpgradesNextMarginalCoins,
  workshopEnhanceFreeUpgradesStatDisplay,
} from './workshopEnhanceFreeUpgrades'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400NextMarginalCoins,
  workshopEnhanceTier400StatDisplay,
} from './workshopEnhanceTier400Ladder'
import {
  WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL,
  workshopEnhanceUtilityTier200NextMarginalCoins,
  workshopEnhanceUtilityTier200StatDisplay,
} from './workshopEnhanceUtilityTier200'

export { WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL } from './workshopEnhanceTier400Ladder'
export { WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL } from './workshopEnhanceUtilityTier200'
export { WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL } from './workshopEnhanceFreeUpgrades'
export { WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL } from './workshopEnhanceEnemyLevelSkip'

/**
 * Wiki **Recovery Package +** (Packages): **300** levels → **×4.00** on max recovery package and recovery amount.
 */
export const WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL = 300 as const

/**
 * Wiki: **Coin Bonus +** unlocks after **50B** utility-enhancement spend.
 * Affects tier bonus and coins/kill (overall benefit is squared in-game; only × multiplier modeled here).
 */
export const WORKSHOP_ENHANCE_COIN_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS = 50_000_000_000 as const

/**
 * Wiki: **Cells/Kill Bonus** unlocks after **500B** utility-enhancement spend.
 * Shares the **Coin Bonus +** per-level coin ladder (`workshopEnhanceUtilityTier200.ts`).
 */
export const WORKSHOP_ENHANCE_CELLS_KILL_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS =
  500_000_000_000 as const

/**
 * Wiki: **Free Upgrades +** unlocks after **5T** utility-enhancement spend.
 * Applies to all free upgrade workshop stats (attack/defense/utility free-upgrade cards).
 */
export const WORKSHOP_ENHANCE_FREE_UPGRADES_UNLOCK_UTILITY_ENHANCE_SPENT_COINS =
  5_000_000_000_000 as const

/**
 * Wiki: **Packages** unlocks after **50T** utility-enhancement spend (Recovery Package + card).
 */
export const WORKSHOP_ENHANCE_RECOVERY_PACKAGE_UNLOCK_UTILITY_ENHANCE_SPENT_COINS =
  50_000_000_000_000 as const

/**
 * Wiki / UI: **Enemy Level Skip +** unlocks after **500T** utility-enhancement spend.
 * Buffs enemy health and enemy damage level skip multipliers (× display only).
 */
export const WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS =
  500_000_000_000_000 as const

/**
 * In-game unlock when list-price utility spend reaches cash bonus **L62** (~496T);
 * the workshop still labels the gate **500T**.
 */
export const WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS_IN_GAME =
  496_000_000_000_000 as const

/**
 * Wiki: **Cash Bonus** unlocks free after **Workshop Enhancement Labs** (no utility-enhancement
 * spend gate). Also buffs cash/wave, interest %, and max interest +1% per level (not modeled here).
 */

export type WorkshopEnhanceUtilityUpgradeKey =
  | 'enhanceCashBonusLevel'
  | 'enhanceCoinBonusLevel'
  | 'enhanceCellsKillBonusLevel'
  | 'enhanceFreeUpgradesLevel'
  | 'enhanceRecoveryPackageLevel'
  | 'enhanceEnemyLevelSkipLevel'

export const WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER: readonly WorkshopEnhanceUtilityUpgradeKey[] =
  [
    'enhanceCashBonusLevel',
    'enhanceCoinBonusLevel',
    'enhanceCellsKillBonusLevel',
    'enhanceFreeUpgradesLevel',
    'enhanceRecoveryPackageLevel',
    'enhanceEnemyLevelSkipLevel',
  ]

function tierMaxForKey(key: WorkshopEnhanceUtilityUpgradeKey): number {
  switch (key) {
    case 'enhanceCoinBonusLevel':
    case 'enhanceCellsKillBonusLevel':
      return WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL
    case 'enhanceFreeUpgradesLevel':
      return WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL
    case 'enhanceRecoveryPackageLevel':
      return WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL
    case 'enhanceEnemyLevelSkipLevel':
      return WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL
    default:
      return WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL
  }
}

export function workshopEnhanceUtilityMaxLevel(key: WorkshopEnhanceUtilityUpgradeKey): number {
  return tierMaxForKey(key)
}

export function workshopEnhanceUtilityClampLevel(
  key: WorkshopEnhanceUtilityUpgradeKey,
  n: number,
): number {
  const max = workshopEnhanceUtilityMaxLevel(key)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(max, Math.trunc(n)))
}

export function workshopEnhanceUtilityStatDisplay(
  key: WorkshopEnhanceUtilityUpgradeKey,
  completedLevels: number,
): string {
  switch (key) {
    case 'enhanceCoinBonusLevel':
    case 'enhanceCellsKillBonusLevel':
      return workshopEnhanceUtilityTier200StatDisplay(completedLevels)
    case 'enhanceFreeUpgradesLevel':
      return workshopEnhanceFreeUpgradesStatDisplay(completedLevels)
    case 'enhanceRecoveryPackageLevel':
      return workshopEnhanceTier400StatDisplay(
        completedLevels,
        WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL,
      )
    case 'enhanceEnemyLevelSkipLevel':
      return workshopEnhanceEnemyLevelSkipStatDisplay(completedLevels)
    default:
      return workshopEnhanceTier400StatDisplay(completedLevels, tierMaxForKey(key))
  }
}

export function workshopEnhanceUtilityNextMarginalCoins(
  key: WorkshopEnhanceUtilityUpgradeKey,
  completedLevels: number,
): number | undefined {
  switch (key) {
    case 'enhanceCoinBonusLevel':
    case 'enhanceCellsKillBonusLevel':
      return workshopEnhanceUtilityTier200NextMarginalCoins(completedLevels)
    case 'enhanceFreeUpgradesLevel':
      return workshopEnhanceFreeUpgradesNextMarginalCoins(completedLevels)
    case 'enhanceRecoveryPackageLevel':
      return workshopEnhanceTier400NextMarginalCoins(
        completedLevels,
        WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL,
      )
    case 'enhanceEnemyLevelSkipLevel':
      return workshopEnhanceEnemyLevelSkipNextMarginalCoins(completedLevels)
    default:
      return workshopEnhanceTier400NextMarginalCoins(completedLevels, tierMaxForKey(key))
  }
}
