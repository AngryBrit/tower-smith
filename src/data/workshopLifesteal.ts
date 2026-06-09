/**
 * Workshop **Lifesteal**: wiki **Level** 1…80 (**Value** and marginal **Cost** per row; values are not a simple linear ramp).
 * `completedLevels` = finished purchases (0…80). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LIFESTEAL_MAX_LEVEL = 80 as const

/** Wiki **Value** (% with two decimals) after exactly `level` purchases (`level` = 1…80). */
const WIKI_STAT_PERCENT_AT_LEVEL: readonly number[] = [
  0.1, 0.2, 0.29, 0.39, 0.48, 0.57, 0.67, 0.75, 0.84, 0.93, 1.02, 1.1, 1.18, 1.26, 1.34, 1.42, 1.5, 1.58, 1.65, 1.73, 1.8,
  1.87, 1.94, 2.01, 2.08, 2.15, 2.22, 2.28, 2.35, 2.41, 2.47, 2.53, 2.59, 2.65, 2.71, 2.77, 2.82, 2.88, 2.93, 2.99, 3.04,
  3.09, 3.14, 3.19, 3.24, 3.29, 3.33, 3.38, 3.43, 3.47, 3.51, 3.56, 3.6, 3.64, 3.68, 3.72, 3.76, 3.8, 3.83, 3.87, 3.91,
  3.94, 3.98, 4.01, 4.04, 4.08, 4.11, 4.14, 4.17, 4.2, 4.23, 4.26, 4.28, 4.31, 4.34, 4.36, 4.39, 4.41, 4.44, 4.46,
]

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…79); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  60, 86, 119, 162, 215, 279, 356, 445, 547, 663, 793, 937, 1100, 1270, 1460, 1670, 1890, 2130, 2380, 2660, 2950, 3250,
  3580, 3920, 4280, 4660, 5060, 5470, 5910, 6360, 6840, 7330, 7840, 8380, 8930, 9500, 10_100, 10_710, 11_350, 12_000,
  12_680, 13_370, 14_090, 14_830, 15_590, 16_380, 17_180, 18_010, 18_860, 19_730, 21_240, 22_180, 23_150, 24_140, 25_150,
  26_190, 27_250, 28_330, 29_440, 30_570, 31_730, 32_900, 34_110, 35_340, 36_590, 37_870, 39_170, 40_500, 41_850, 43_230,
  44_630, 46_060, 47_510, 48_990, 50_500, 54_630, 56_260, 57_920, 59_610, 61_320,
]

/** Lifesteal % (percent points, e.g. 0.1 for +0.10%) after `completedLevels` workshop purchases. */
export function workshopLifestealStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Lifesteal', completedLevels)!
}

export function workshopLifestealStatDisplay(completedLevels: number): string {
  const pct = workshopLifestealStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopLifestealNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Lifesteal', completedLevels)
}
