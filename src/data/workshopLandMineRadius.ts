/**
 * Workshop **Land Mine Radius**: wiki **Level** 1…50 (**Value** and marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…50). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL = 50 as const

/** Wiki **Value** (radius) after exactly `level` purchases (`level` = 1…50). */
const WIKI_VALUE_AT_LEVEL: readonly number[] = [
  0.52, 0.54, 0.56, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88,
  0.9, 0.92, 0.94, 0.96, 0.98, 1.0, 1.02, 1.04, 1.06, 1.08, 1.1, 1.12, 1.14, 1.16, 1.18, 1.2, 1.22, 1.24, 1.26,
  1.28, 1.3, 1.32, 1.34, 1.36, 1.38, 1.4, 1.42, 1.44, 1.46, 1.48, 1.5,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  500, 805, 1150, 1600, 2200, 3050, 4220, 5800, 7870, 10_530, 13_880, 18_010, 23_040, 29_060, 36_190, 44_455,
  54_230, 65_370, 78_080, 92_480, 108_690, 126_840, 147_060, 169_470, 194_210, 221_410, 251_190, 283_710, 319_090,
  357_470, 399_000, 443_810, 492_050, 543_860, 599_390, 6_590_000, 7_220_000, 7_900_000, 86_160_000, 93_800_000,
  101_900_000, 110_470_000, 1_200_000_000, 1_290_000_000, 1_390_000_000, 1_500_000_000, 16_110_000_000,
  17_280_000_000, 18_520_000_000, 19_820_000_000,
]

/** Blast radius **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopLandMineRadiusStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Radius', completedLevels)!
}

/** Two-decimal radius string for the workshop card (no `+` prefix). */
export function workshopLandMineRadiusStatDisplay(completedLevels: number): string {
  const v = workshopLandMineRadiusStatValue(completedLevels)
  return v.toFixed(2)
}

export function workshopLandMineRadiusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Radius', completedLevels)
}
