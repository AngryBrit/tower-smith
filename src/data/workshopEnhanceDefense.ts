/**
 * Workshop **Defense Enhancements** (Enhance tab, Defense category).
 */

import {
  WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES,
  workshopToolkitMarginalCoins,
} from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400StatDisplay,
} from './workshopEnhanceTier400Ladder'
import {
  WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL,
  workshopEnhanceOrbSizeStatDisplay,
} from './workshopEnhanceOrbSize'

export { WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL } from './workshopEnhanceTier400Ladder'
export { WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL } from './workshopEnhanceOrbSize'

/**
 * Wiki: **Health Regen** unlocks after **50B** coins spent on defense enhancements
 * (cumulative across all defense enhancement purchases).
 */
export const WORKSHOP_ENHANCE_HEALTH_REGEN_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS =
  50_000_000_000 as const

/**
 * Wiki: **Defense Absolute** unlocks after **500B** coins spent on defense enhancements.
 */
export const WORKSHOP_ENHANCE_DEFENSE_ABSOLUTE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS =
  500_000_000_000 as const

/**
 * Wiki: **Land Mine Damage** unlocks after **5T** coins spent on defense enhancements.
 */
export const WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS =
  5_000_000_000_000 as const

/** Wiki: **+0.06×** per level → **×25.00** at L400 (tier-400 **Coins** ladder). */
export const WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_INCREMENT_PER_LEVEL = 0.06 as const

/**
 * Wiki: **Wall Health** unlocks after **50T** coins spent on defense enhancements.
 */
export const WORKSHOP_ENHANCE_WALL_HEALTH_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS =
  50_000_000_000_000 as const

/**
 * Wiki: **Orb Size** unlocks after **500T** coins spent on defense enhancements.
 */
export const WORKSHOP_ENHANCE_ORB_SIZE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS =
  500_000_000_000_000 as const

export type WorkshopEnhanceDefenseUpgradeKey =
  | 'enhanceHealthLevel'
  | 'enhanceHealthRegenLevel'
  | 'enhanceDefenseAbsoluteLevel'
  | 'enhanceLandMineDamageLevel'
  | 'enhanceWallHealthLevel'
  | 'enhanceOrbSizeLevel'

export const WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER: readonly WorkshopEnhanceDefenseUpgradeKey[] =
  [
    'enhanceHealthLevel',
    'enhanceHealthRegenLevel',
    'enhanceDefenseAbsoluteLevel',
    'enhanceLandMineDamageLevel',
    'enhanceWallHealthLevel',
    'enhanceOrbSizeLevel',
  ]

function tierMaxForKey(key: WorkshopEnhanceDefenseUpgradeKey): number {
  if (key === 'enhanceOrbSizeLevel') return WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL
  return WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL
}

export function workshopEnhanceDefenseMaxLevel(key: WorkshopEnhanceDefenseUpgradeKey): number {
  return tierMaxForKey(key)
}

export function workshopEnhanceDefenseClampLevel(
  key: WorkshopEnhanceDefenseUpgradeKey,
  n: number,
): number {
  const max = workshopEnhanceDefenseMaxLevel(key)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(max, Math.trunc(n)))
}

export function workshopEnhanceDefenseStatDisplay(
  key: WorkshopEnhanceDefenseUpgradeKey,
  completedLevels: number,
): string {
  if (key === 'enhanceOrbSizeLevel') {
    return workshopEnhanceOrbSizeStatDisplay(completedLevels)
  }
  return workshopEnhanceTier400StatDisplay(
    completedLevels,
    WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES[key],
  )
}

export function workshopEnhanceDefenseNextMarginalCoins(
  key: WorkshopEnhanceDefenseUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins(
    WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES[key],
    completedLevels,
  )
}
