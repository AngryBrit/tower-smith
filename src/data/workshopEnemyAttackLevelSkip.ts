/**
 * Workshop **Enemy Attack Level Skip** — stat curve shared with health skip; coins from GOD table.
 */

import { workshopToolkitMarginalCoins } from '../workshopCosts'
import { workshopEnhanceEnemyLevelSkipMultiplier } from './workshopEnhanceEnemyLevelSkip'

export {
  WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL as WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyAttackLevelSkipStatDisplay,
  workshopEnemyAttackLevelSkipStatPercent,
} from './workshopEnemyLevelSkipShared'

/**
 * **Enemy Level Skip +** enhancement multiplier on both level-skip workshop cards.
 *
 * Verified against `Main::GetOutOfRoundHealthLevelSkipChance` (libil2cpp.so): the getter computes
 * `(workshop + lab + module + techTree + relic) × enemyLevelSkipEnhancement` (Main+0x3A0) and clamps
 * to 100%. The attack getter is the analog with `relics.enemyAttackSkip`. One shared enhancement
 * scales both cards.
 */
export function workshopDisplayedEnemyLevelSkipEnhancementMultiplier(
  enhanceEnemyLevelSkipLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceEnemyLevelSkipLevel <= 0) return 1
  const level = Math.max(0, Math.trunc(enhanceEnemyLevelSkipLevel))
  if (level <= 0) return 1
  const mult = workshopEnhanceEnemyLevelSkipMultiplier(level)
  return mult > 1 + 1e-9 ? mult : 1
}

export function workshopEnemyAttackLevelSkipNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins('Enemy Attack Level Skip', completedLevels)
}
