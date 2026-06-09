/**
 * Workshop **Enemy Health Level Skip** — stat curve shared with attack skip; coins from GOD table.
 */

import { workshopToolkitMarginalCoins } from '../workshopCosts'

export {
  WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL as WORKSHOP_ENEMY_HEALTH_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyHealthLevelSkipStatDisplay,
  workshopEnemyHealthLevelSkipStatPercent,
} from './workshopEnemyLevelSkipShared'

export function workshopEnemyHealthLevelSkipNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins('Enemy Health Level Skip', completedLevels)
}
