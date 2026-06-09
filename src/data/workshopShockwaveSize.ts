/**
 * Workshop **Shockwave Size**: wiki **Level** 1…35 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…35). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL = 35 as const

/** Wiki **Value** (multiplier) after exactly `level` purchases (`level` = 1…35). */
const WIKI_VALUE_AT_LEVEL: readonly number[] = [
  0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6,
  1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  250, 314, 397, 512, 667, 874, 1140, 1470, 1880, 2370, 2960, 3630, 4410, 5310, 6310, 7440, 8700, 10_090, 11_620,
  13_300, 15_130, 17_110, 19_260, 21_580, 24_070, 26_740, 29_590, 32_630, 35_860, 39_290, 42_930, 46_770, 50_830,
  55_100, 59_600,
]

/** Multiplier **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopShockwaveSizeStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Shockwave Size', completedLevels)!
}

/** Two-decimal multiplier string for the workshop card (no `x` prefix). */
export function workshopShockwaveSizeStatDisplay(completedLevels: number): string {
  const v = workshopShockwaveSizeStatMultiplier(completedLevels)
  return v.toFixed(2)
}

export function workshopShockwaveSizeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Shockwave Size', completedLevels)
}
