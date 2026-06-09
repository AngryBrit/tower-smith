/**
 * Workshop **Land Mine Chance**: wiki **Level** 1…50 (**Value** +0.60% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…50). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL = 50 as const

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  500, 755, 1050, 1410, 1910, 2590, 3500, 4710, 6260, 8240, 10_690, 13_680, 17_280, 21_550, 26_560, 32_380,
  39_090, 46_740, 55_420, 65_190, 76_140, 88_320, 101_830, 116_730, 133_100, 151_010, 170_550, 191_800, 214_820,
  239_710, 266_540, 295_390, 326_350, 359_490, 394_900, 432_660, 472_850, 515_560, 560_870, 608_870, 659_630,
  713_260, 769_820, 829_420, 892_120, 958_040, 1_030_000, 1_100_000, 1_180_000, 1_260_000,
]

/** Land mine chance % (percent points) after `completedLevels` workshop purchases. */
export function workshopLandMineChanceStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Chance', completedLevels)!
}

export function workshopLandMineChanceStatDisplay(completedLevels: number): string {
  const pct = workshopLandMineChanceStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopLandMineChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Chance', completedLevels)
}
