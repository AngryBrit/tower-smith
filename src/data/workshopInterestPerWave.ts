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
