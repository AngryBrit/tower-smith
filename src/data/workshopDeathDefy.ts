/**
 * Workshop **Death Defy**: wiki **Level** 1…75 (**Value** % chance, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…75). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_DEATH_DEFY_MAX_LEVEL = 75 as const

/** Wiki **Value** (chance %) after exactly `level` purchases (`level` = 1…75). */
const WIKI_PERCENT_AT_LEVEL: readonly number[] = [
  0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13,
  14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 22, 22, 22, 23, 23, 24, 24, 24,
  25, 25, 26, 26, 26, 27, 27, 28, 28, 28, 29, 29, 30, 30,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  1000, 1510, 2080, 2900, 4230, 6430, 9960, 15_370, 23_300, 34_470, 49_690, 69_860, 95_960, 129_050, 170_280, 220_880,
  282_170, 355_530, 442_440, 544_450, 663_200, 800_390, 957_830, 1_140_000, 1_340_000, 1_570_000, 1_830_000, 2_120_000,
  2_440_000, 2_790_000, 3_190_000, 3_620_000, 4_100_000, 4_620_000, 5_180_000, 5_800_000, 6_470_000, 7_200_000, 7_990_000,
  8_840_000, 9_760_000, 10_740_000, 11_800_000, 12_930_000, 14_140_000, 15_440_000, 16_820_000, 18_290_000, 19_850_000,
  21_510_000, 23_970_000, 25_890_000, 27_930_000, 30_080_000, 32_350_000, 34_750_000, 37_280_000, 39_940_000, 42_740_000,
  45_690_000, 48_780_000, 52_030_000, 55_440_000, 59_000_000, 62_740_000, 66_650_000, 70_740_000, 75_010_000, 79_470_000,
  84_120_000, 88_970_000, 94_030_000, 99_300_000, 104_790_000, 110_500_000,
]

/** Death defy chance % after `completedLevels` workshop purchases. */
export function workshopDeathDefyStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Death Defy', completedLevels)!
}

export function workshopDeathDefyStatDisplay(completedLevels: number): string {
  return `${workshopDeathDefyStatPercent(completedLevels).toFixed(2)}%`
}

export function workshopDeathDefyNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Death Defy', completedLevels)
}
