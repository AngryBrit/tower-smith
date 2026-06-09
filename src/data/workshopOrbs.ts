/**
 * Workshop **Orbs**: wiki **Level** 1…4 (**Value** = orb count, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…4). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ORBS_MAX_LEVEL = 4 as const


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
