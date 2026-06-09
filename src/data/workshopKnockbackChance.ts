/**
 * Workshop **Knockback Chance**: wiki **Level** 1…80 (**Value** +1.00% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…80). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL = 80 as const

/** Knockback chance % (percent points) after `completedLevels` workshop purchases. */
export function workshopKnockbackChanceStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Knockback Chance', completedLevels)!
}

export function workshopKnockbackChanceStatDisplay(completedLevels: number): string {
  const pct = workshopKnockbackChanceStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopKnockbackChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Knockback Chance', completedLevels)
}
