/**
 * Workshop **Shockwave Frequency**: wiki **Level** 1…40 (**Value** in seconds, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…40). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL = 40 as const

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
