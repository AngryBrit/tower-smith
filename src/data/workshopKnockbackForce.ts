/**
 * Workshop **Knockback Force**: wiki **Level** 1…40 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…40). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL = 40 as const

/** Multiplier **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopKnockbackForceStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Knockback Force', completedLevels)!
}

/** Two-decimal multiplier string for the workshop card (no `x` prefix). */
export function workshopKnockbackForceStatDisplay(completedLevels: number): string {
  const v = workshopKnockbackForceStatMultiplier(completedLevels)
  return v.toFixed(2)
}

export function workshopKnockbackForceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Knockback Force', completedLevels)
}
