/**
 * Workshop **Death Defy**: wiki **Level** 1…75 (**Value** % chance, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…75). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_DEATH_DEFY_MAX_LEVEL = 75 as const

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
