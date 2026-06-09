/**
 * Workshop **Thorn Damage** (Garlic Thorns): wiki **Level** 1…99 (**Value** +1.00% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopPercentDisplay } from './workshopLabDisplayHelpers'
export const WORKSHOP_THORN_DAMAGE_MAX_LEVEL = 99 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…98); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  60, 85, 117, 157, 206, 264, 331, 409, 497, 596, 706, 828, 961, 1110, 1260, 1430, 1620, 1810, 2020, 2240,
  2470, 2720, 2980, 3260, 3540, 3850, 4160, 4490, 4840, 5200, 5570, 5960, 6360, 6780, 7220, 7660, 8130, 8610,
  9100, 9610, 10_140, 10_680, 11_240, 11_810, 12_400, 13_000, 13_620, 14_260, 14_920, 15_590, 16_760, 17_480,
  18_220, 18_980, 19_760, 20_550, 21_360, 22_190, 23_040, 23_900, 24_780, 25_680, 26_590, 27_530, 28_480, 29_450,
  30_440, 31_440, 32_470, 33_510, 34_570, 35_650, 36_750, 37_870, 39_000, 42_160, 43_390, 44_640, 45_920, 47_210,
  48_520, 49_850, 51_190, 52_570, 53_950, 55_370, 56_790, 58_250, 59_720, 61_210, 62_720, 64_250, 65_800, 67_380,
  68_970, 70_590, 72_220, 73_880, 75_550,
]

/** Thorn damage bonus % after `completedLevels` purchases (whole percent points, e.g. 1 for +1.00%). */
export function workshopThornDamageStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Thorns', completedLevels)!
}

export function workshopThornDamageStatDisplay(completedLevels: number): string {
  return formatWorkshopPercentDisplay(workshopThornDamageStatPercentPoints(completedLevels))
}

export function workshopThornDamageNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Thorns', completedLevels)
}
