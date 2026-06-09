/**
 * Workshop **Defense %**: wiki **Level** 1…99 (**Value** +0.50% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL = 99 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…98); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  50, 76, 109, 151, 203, 266, 340, 426, 525, 636, 760, 898, 1050, 1220, 1400, 1590, 1800, 2030, 2270,
  2520, 2790, 3080, 3390, 3710, 4040, 4400, 4770, 5160, 5560, 5990, 6430, 6890, 7360, 7860, 8370, 8900,
  9450, 10_020, 10_600, 11_210, 11_830, 12_480, 13_140, 13_820, 14_530, 15_250, 15_990, 16_750, 17_530,
  18_330, 19_720, 20_590, 21_480, 22_380, 23_310, 24_260, 25_240, 26_230, 27_240, 28_280, 29_340, 30_420,
  31_520, 32_640, 33_790, 34_950, 36_140, 37_360, 38_590, 39_850, 41_130, 42_430, 43_750, 45_100, 46_470,
  50_260, 51_740, 53_260, 54_790, 56_350, 57_930, 59_540, 61_180, 62_840, 64_520, 66_230, 67_960, 69_720,
  71_500, 73_310, 75_140, 77_000, 78_890, 80_800, 82_730, 84_690, 86_680, 88_690, 90_730,
]

/** Total Defense % bonus after `completedLevels` purchases (percent points, e.g. 0.5 for +0.50%). */
export function workshopDefensePercentStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Defense Percent', completedLevels)!
}

export function workshopDefensePercentStatDisplay(completedLevels: number): string {
  const pct = workshopDefensePercentStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopDefensePercentNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Defense Percent', completedLevels)
}
