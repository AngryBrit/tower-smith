/**
 * Workshop **Land Mine Chance**: wiki **Level** 1…50 (**Value** +0.60% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…50). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL = 50 as const

/** Land mine chance % (percent points) after `completedLevels` workshop purchases. */
export function workshopLandMineChanceStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Chance', completedLevels)!
}

export function workshopLandMineChanceStatDisplay(completedLevels: number): string {
  const pct = workshopLandMineChanceStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopLandMineChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Chance', completedLevels)
}
