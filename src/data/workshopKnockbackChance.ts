/**
 * Workshop **Knockback Chance**: wiki **Level** 1…80 (**Value** +1.00% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…80). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL = 80 as const

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  80, 113, 154, 205, 267, 342, 429, 530, 645, 775, 920, 1080, 1260, 1450, 1660, 1890, 2130, 2390, 2670, 2970,
  3290, 3620, 3970, 4350, 4740, 5150, 5590, 6040, 6510, 7000, 7520, 8050, 8610, 9190, 9790, 10_410, 11_050,
  11_720, 12_400, 13_110, 13_840, 14_600, 15_370, 16_170, 17_000, 17_840, 18_710, 19_610, 20_520, 21_460, 23_100,
  24_120, 25_160, 26_230, 27_320, 28_440, 29_590, 30_750, 31_950, 33_170, 34_420, 35_690, 36_990, 38_310, 39_670,
  41_040, 42_450, 43_880, 45_340, 46_820, 48_340, 49_870, 51_440, 53_030, 54_660, 59_120, 60_880, 62_670, 64_490,
  66_330,
]

/** Knockback chance % (percent points) after `completedLevels` workshop purchases. */
export function workshopKnockbackChanceStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Knockback Chance', completedLevels)!
}

export function workshopKnockbackChanceStatDisplay(completedLevels: number): string {
  const pct = workshopKnockbackChanceStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopKnockbackChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Knockback Chance', completedLevels)
}
