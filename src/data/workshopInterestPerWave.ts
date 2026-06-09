/**
 * Workshop **Interest / Wave**: wiki **Level** 1…99 (**Value** +0.06% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 * One-time workshop unlock: **5000** coins after free upgrades. Interest applies after Cash / Wave:
 * `(Current Cash + Cash/Wave × Cash Bonus) × Interest/Wave %`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import type { ResearchData } from '../types/research'
import { utilityResearchDamageStyleLabMultiplier } from '../types/research'
export const WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL = 99 as const

/** One-time workshop unlock cost (before level purchases). */
export const WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS = 5000 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…98); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  125, 179, 245, 328, 431, 556, 705, 881, 1080, 1320, 1580, 1880, 2200, 2570, 2970, 3400, 3870, 4390, 4940, 5530,
  6160, 6840, 7560, 8320, 9130, 9980, 10_880, 11_830, 12_820, 13_870, 14_960, 16_100, 17_290, 18_530, 19_830, 21_180,
  22_580, 24_030, 25_540, 27_100, 28_720, 30_390, 32_120, 33_910, 35_750, 37_650, 39_610, 41_630, 43_710, 45_850, 49_490,
  51_820, 54_210, 56_670, 59_190, 61_780, 64_430, 67_140, 69_930, 72_780, 75_690, 78_680, 81_730, 84_850, 88_040, 91_300,
  94_630, 98_030, 101_500, 105_040, 108_650, 112_340, 116_100, 119_920, 123_830, 127_810, 134_190, 138_450, 142_780, 147_190,
  151_680, 156_250, 160_890, 165_620, 170_430, 175_320, 180_290, 185_340, 190_470, 195_690, 200_990, 206_370, 211_840, 217_390,
  223_020, 228_740, 234_540, 240_430, 246_410, 252470,
]

/** Interest per wave (percent points, e.g. 0.06 for +0.06%) after `completedLevels` purchases. */
export function workshopInterestPerWaveStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Interest - Wave', completedLevels)!
}

export function workshopInterestPerWaveStatDisplay(completedLevels: number): string {
  const pct = workshopInterestPerWaveStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

/**
 * **Interest / Wave** workshop card: × **Interest** lab × **Cash / Wave** lab (calibrated:
 * workshop L99 + Cash / Wave L5 → **6.53%** in-game).
 */
export function workshopInterestPerWaveLabDisplayMultiplier(
  research: ResearchData,
  labOverrides: Record<string, number>,
): number {
  const interest = utilityResearchDamageStyleLabMultiplier(research, labOverrides, 'Interest')
  const cashWave = utilityResearchDamageStyleLabMultiplier(research, labOverrides, 'Cash / Wave')
  return interest * cashWave
}

export function workshopInterestPerWaveNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Interest - Wave', completedLevels)
}
