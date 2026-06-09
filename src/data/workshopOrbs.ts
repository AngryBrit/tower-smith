/**
 * Workshop **Orbs**: wiki **Level** 1…4 (**Value** = orb count, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…4). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ORBS_MAX_LEVEL = 4 as const

/** Marginal coin cost for purchase `k` → `k+1` completed levels (`k` = 0…3); wiki **Cost** at Level `k + 1`. */
const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [3_000, 20_000, 120_000, 350_000]

/** Extra orb count after `completedLevels` workshop purchases. */
export function workshopOrbsStatCount(completedLevels: number): number {
  return workshopToolkitStatValue('Orbs', completedLevels)!
}

export function workshopOrbsStatDisplay(completedLevels: number): string {
  return String(workshopOrbsStatCount(completedLevels))
}

export function workshopOrbsNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Orbs', completedLevels)
}
