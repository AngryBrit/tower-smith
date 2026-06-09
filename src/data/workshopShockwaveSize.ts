/**
 * Workshop **Shockwave Size**: wiki **Level** 1…35 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…35). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL = 35 as const

/** Multiplier **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopShockwaveSizeStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Shockwave Size', completedLevels)!
}

/** Two-decimal multiplier string for the workshop card (no `x` prefix). */
export function workshopShockwaveSizeStatDisplay(completedLevels: number): string {
  const v = workshopShockwaveSizeStatMultiplier(completedLevels)
  return v.toFixed(2)
}

export function workshopShockwaveSizeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Shockwave Size', completedLevels)
}
