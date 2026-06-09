/**
 * Workshop **Shockwave Frequency**: wiki **Level** 1…40 (**Value** in seconds, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…40). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL = 40 as const

/** Wiki **Value** (seconds) after exactly `level` purchases (`level` = 1…40). */
const WIKI_SECONDS_AT_LEVEL: readonly number[] = [
  19.85, 19.7, 19.55, 19.4, 19.25, 19.1, 18.95, 18.8, 18.65, 18.5, 18.35, 18.2, 18.05, 17.9, 17.75, 17.6, 17.45,
  17.3, 17.15, 17.0, 16.85, 16.7, 16.55, 16.4, 16.25, 16.1, 15.95, 15.8, 15.65, 15.5, 15.35, 15.2, 15.05, 14.9,
  14.75, 14.6, 14.45, 14.3, 14.15, 14.0,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  250, 314, 397, 512, 667, 874, 1140, 1470, 1880, 2370, 2960, 3630, 4410, 5310, 6310, 7440, 8700, 10_090, 11_620,
  13_300, 15_130, 17_110, 19_260, 21_580, 24_070, 26_740, 29_590, 32_630, 35_860, 39_290, 42_930, 46_770, 50_830,
  55_100, 59_600, 64_330, 69_290, 74_480, 79_920, 85_600,
]

/** GOD **Value** stores seconds ×1e21 (import parses trailing `s` as septillion suffix). */
const SHOCKWAVE_FREQUENCY_GOD_VALUE_SCALE = 1e-21

/** Interval in seconds after `completedLevels` workshop purchases. */
export function workshopShockwaveFrequencyStatSeconds(completedLevels: number): number {
  const raw =
    workshopToolkitStatValue('Shockwave Frequency', completedLevels)! *
    SHOCKWAVE_FREQUENCY_GOD_VALUE_SCALE
  return Math.round(raw * 100) / 100
}

export function workshopShockwaveFrequencyStatDisplay(completedLevels: number): string {
  const sec = workshopShockwaveFrequencyStatSeconds(completedLevels)
  return `${sec.toFixed(2)}s`
}

export function workshopShockwaveFrequencyNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Shockwave Frequency', completedLevels)
}
