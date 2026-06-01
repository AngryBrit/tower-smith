/**
 * Utility **Free Upgrades +**: **100** levels, +0.01x per level to x2.00.
 */

import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL = 100 as const

const MARGINAL_COINS: readonly number[] = [
  5e9, 6.05e9, 22.25e9, 95.56e9, 299.27e9, 739.39e9, 1.56e12, 2.92e12,
  5.05e12, 8.18e12, 12.59e12, 18.61e12, 26.59e12, 36.92e12, 50.02e12, 66.38e12,
  86.48e12, 221.77e12, 420.49e12, 699.78e12, 1080e12, 1580e12, 2230e12, 3060e12,
  4100e12, 5390e12, 6960e12, 8870e12, 11150e12, 13870e12, 17070e12, 25000e12,
  35290e12, 48450e12, 65030e12, 85650e12, 111040e12, 141990e12, 179400e12, 224250e12,
  277660e12, 340830e12, 415110e12, 501970e12, 603030e12, 720030e12, 854910e12, 1010e15,
  1190e15, 1390e15, 1620e15, 2160000e12, 2820e15, 3620e15, 4590e15, 5740e15,
  7100e15, 8720000e12, 10600e15, 12810e15, 15370e15, 18330000e12, 21740e15, 25660e15,
  30130e15, 35230000e12, 41020e15, 47580e15, 54990e15, 63330e15, 72710000e12, 83210e15,
  94960e15, 108060e15, 122660e15, 138870e15, 156840e15, 176740e15, 198720e15, 222960e15,
  249650e15, 279000e15, 311200e15, 346500e15, 385130e15, 427340e15, 473410e15, 523630e15,
  578290000e12, 637720e15, 702260e15, 772260e15, 848100e15, 930190000e12, 1020000e15, 1110000000e12,
  1220000e15, 1330000e15, 1450000e15, 1580000e15,
]

export function workshopEnhanceFreeUpgradesMultiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceFreeUpgradesStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceFreeUpgradesMultiplier(completedLevels),
  )
}

export function workshopEnhanceFreeUpgradesNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
