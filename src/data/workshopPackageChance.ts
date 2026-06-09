/**
 * Workshop **Package Chance**: wiki **Level** 1…60 (**Value** +0.40% per level, marginal **Cost** per row).
 * Base **6%** at level 0 → **30%** at level 60.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL = 60 as const

export const WORKSHOP_PACKAGE_CHANCE_BASE_PERCENT = 6 as const

export const WORKSHOP_PACKAGE_CHANCE_PERCENT_PER_LEVEL = 0.4 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…59); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  1000, 1060, 1160, 1450, 2090, 3330, 5470, 8830, 13_830, 20_900, 30_520, 43_240, 59_630, 80_310, 105_940, 137_240,
  174_950, 219_850, 272_790, 334_630, 406_270, 488_670, 582_820, 689_730, 810_480, 946_160, 1_098_160, 1_270_000,
  1_450_000, 1_660_000, 1_890_000, 2_140_000, 2_410_000, 2_710_000, 3_040_000, 3_390_000, 3_780_000, 4_190_000,
  4_640_000, 5_120_000, 5_630_000, 6_190_000, 6_780_000, 7_420_000, 8_090_000, 8_810_000, 9_580_000, 10_400_000,
  11_260_000, 12_180_000, 13_550_000, 14_600_000, 15_720_000, 16_900_000, 18_150_000, 19_460_000, 20_830_000, 22_280_000,
  23_810_000, 25_400_000,
]

/** Package spawn chance % after `completedLevels` workshop purchases (exact **6 + 0.40 × level**). */
export function workshopPackageChanceStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Package Chance', completedLevels)!
}

export function workshopPackageChanceStatDisplay(completedLevels: number): string {
  const pct = workshopPackageChanceStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopPackageChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Package Chance', completedLevels)
}
