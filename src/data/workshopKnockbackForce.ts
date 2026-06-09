/**
 * Workshop **Knockback Force**: wiki **Level** 1…40 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…40). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL = 40 as const

/** Wiki **Value** (multiplier) after exactly `level` purchases (`level` = 1…40). */
const WIKI_VALUE_AT_LEVEL: readonly number[] = [
  0.55, 0.7, 0.85, 1.0, 1.15, 1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2, 2.35, 2.5, 2.65, 2.8, 2.95, 3.1, 3.25, 3.4,
  3.55, 3.7, 3.85, 4.0, 4.15, 4.3, 4.45, 4.6, 4.75, 4.66, 4.8, 4.94, 5.08, 5.23, 5.37, 5.51, 5.65, 5.8, 5.94, 6.08,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  80, 113, 154, 206, 269, 346, 436, 540, 659, 794, 945, 1110, 1300, 1500, 1720, 1960, 2220, 2500, 2790, 3110,
  3450, 3800, 4180, 4580, 5000, 5440, 5900, 6390, 6900, 7430, 7980, 8550, 9150, 9780, 10_420, 11_090, 11_790,
  12_500, 13_250, 14_010,
]

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
