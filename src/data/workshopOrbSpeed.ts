/**
 * Workshop **Orb Speed**: wiki **Level** 1…38 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…38). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ORB_SPEED_MAX_LEVEL = 38 as const

/** Multiplier **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopOrbSpeedStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Orb Speed', completedLevels)!
}

/** Two-decimal multiplier string for the workshop card (no `x` prefix). */
export function workshopOrbSpeedStatDisplay(completedLevels: number): string {
  const v = workshopOrbSpeedStatMultiplier(completedLevels)
  return v.toFixed(2)
}

export function workshopOrbSpeedNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Orb Speed', completedLevels)
}
