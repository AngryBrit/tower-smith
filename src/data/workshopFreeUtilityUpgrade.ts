/**
 * Workshop **Free Utility Upgrade**: wiki **Level** 1…99 (**Value** +0.50% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL = 99 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…98); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  100, 143, 196, 261, 339, 432, 540, 664, 806, 966, 1140, 1340, 1560, 1790, 2050, 2330, 2630, 2950, 3290, 3660,
  4050, 4460, 4890, 5350, 5840, 6350, 6880, 7440, 8020, 8630, 9260, 9930, 10_610, 11_330, 12_070, 12_840, 13_630,
  14_450, 15_300, 16_180, 17_090, 18_020, 18_990, 19_980, 21_000, 22_050, 23_140, 24_250, 25_380, 26_550, 28_590,
  29_850, 31_150, 32_480, 33_840, 35_240, 36_660, 38_120, 39_610, 41_140, 42_690, 44_280, 45_900, 47_560, 49_250,
  50_970, 52_720, 54_510, 56_340, 58_190, 60_090, 62_010, 63_970, 65_970, 68_000, 73_570, 75_770, 78_020, 80_230,
  82_510, 84_970, 87_360, 89_790, 92_260, 94_760, 97_280, 99_890, 102_510, 105_170, 107_860, 110_600, 113_380,
  116_190, 119_040, 121_940, 124_870, 127_840, 130_850, 133_900,
]

/** Free utility upgrade chance (percent points, e.g. 0.5 for +0.50%) after `completedLevels` purchases. */
export function workshopFreeUtilityUpgradeStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Free Utility Upgrade', completedLevels)!
}

export function workshopFreeUtilityUpgradeStatDisplay(completedLevels: number): string {
  const pct = workshopFreeUtilityUpgradeStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopFreeUtilityUpgradeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Utility Upgrade', completedLevels)
}
