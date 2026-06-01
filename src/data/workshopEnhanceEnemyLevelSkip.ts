/**
 * Utility **Enemy Level Skip +**: **60** levels, +0.01x per level to x1.60.
 */

import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL = 60 as const

const MARGINAL_COINS: readonly number[] = [
  5e9, 15.5e9, 202.98e9, 1.13e12, 3.89e12, 10.14e12, 22.19e12, 43.05e12,
  76.44e12, 126.85e12, 199.54e12, 300.61e12, 437.01e12, 616.54e12, 847.92e12, 1140e12,
  1510e12, 3910e12, 7500e12, 12610e12, 19650e12, 29090e12, 41450e12, 57350e12,
  77470e12, 102600e12, 133590e12, 171410e12, 217130e12, 271920e12, 337060e12, 496770e12,
  705870e12, 975000e12, 1320e15, 1740e15, 2270e15, 2920e15, 3710e15, 4670e15,
  5810e15, 7160e15, 8770e15, 10650e15, 12850e15, 15420e15, 18390e15, 21810e15,
  25740e15, 30240e15, 35370000e12, 47380e15, 62140e15, 80120e15, 101840e15, 127880e15,
  158910e15, 195630e15, 238880e15, 289530000e12,
]

export function workshopEnhanceEnemyLevelSkipMultiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceEnemyLevelSkipStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceEnemyLevelSkipMultiplier(completedLevels),
  )
}

export function workshopEnhanceEnemyLevelSkipNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
