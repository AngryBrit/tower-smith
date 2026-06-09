/**
 * Workshop **Free Defense Upgrade**: wiki **Level** 1…99 (**Value** +0.50% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL = 99 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…98); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  75, 118, 171, 236, 314, 407, 515, 639, 781, 941, 1120, 1320, 1530, 1770, 2030, 2300, 2600, 2920, 3270, 3630,
  4020, 4430, 4870, 5330, 5810, 6320, 6850, 7410, 8000, 8600, 9240, 9900, 10_590, 11_300, 12_040, 12_810, 13_610,
  14_430, 15_280, 16_160, 17_070, 18_000, 18_960, 19_960, 20_980, 22_030, 23_110, 24_220, 25_360, 26_530, 28_560,
  29_830, 31_130, 32_460, 33_820, 35_210, 36_640, 38_100, 39_590, 41_110, 42_670, 44_250, 45_880, 47_530, 49_220,
  50_940, 52_700, 54_490, 56_310, 58_170, 60_060, 61_990, 63_950, 65_940, 67_970, 73_540, 75_750, 77_990, 80_270,
  82_590, 84_940, 87_330, 89_760, 92_230, 94_740, 97_280, 99_860, 102_480, 105_140, 107_840, 110_570, 113_350,
  116_160, 119_020, 121_910, 124_840, 127_810, 130_820, 133_870,
]

/** Free defense upgrade chance (percent points, e.g. 0.5 for +0.50%) after `completedLevels` purchases. */
export function workshopFreeDefenseUpgradeStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Free Defense Upgrade', completedLevels)!
}

export function workshopFreeDefenseUpgradeStatDisplay(completedLevels: number): string {
  const pct = workshopFreeDefenseUpgradeStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopFreeDefenseUpgradeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Defense Upgrade', completedLevels)
}
