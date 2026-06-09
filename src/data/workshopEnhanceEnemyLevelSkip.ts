/**
 * Utility **Enemy Level Skip +**: **60** levels, +0.01x per level to x1.60.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL = 60 as const

export function workshopEnhanceEnemyLevelSkipMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Enemy Level Skip +', completedLevels)!
}

export function workshopEnhanceEnemyLevelSkipStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceEnemyLevelSkipMultiplier(completedLevels),
  )
}

export function workshopEnhanceEnemyLevelSkipNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Enemy Level Skip +', completedLevels)
}
