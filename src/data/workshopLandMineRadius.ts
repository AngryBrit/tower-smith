/**
 * Workshop **Land Mine Radius**: wiki **Level** 1…50 (**Value** and marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…50). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL = 50 as const

/** Blast radius **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopLandMineRadiusStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Radius', completedLevels)!
}

/** Two-decimal radius string for the workshop card (no `+` prefix). */
export function workshopLandMineRadiusStatDisplay(completedLevels: number): string {
  const v = workshopLandMineRadiusStatValue(completedLevels)
  return v.toFixed(2)
}

export function workshopLandMineRadiusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Radius', completedLevels)
}
