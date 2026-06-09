/**
 * Workshop **Enemy Attack Level Skip** — stat curve shared with health skip; coins from GOD table.
 */

import { workshopToolkitMarginalCoins } from '../workshopCosts'

export {
  WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL as WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyAttackLevelSkipStatDisplay,
  workshopEnemyAttackLevelSkipStatPercent,
} from './workshopEnemyLevelSkipShared'

export function workshopEnemyAttackLevelSkipNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins('Enemy Attack Level Skip', completedLevels)
}
