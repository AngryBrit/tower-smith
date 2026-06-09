/**
 * Workshop **Lifesteal**: wiki **Level** 1…80 (**Value** and marginal **Cost** per row; values are not a simple linear ramp).
 * `completedLevels` = finished purchases (0…80). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_LIFESTEAL_MAX_LEVEL = 80 as const



/** Lifesteal % (percent points, e.g. 0.1 for +0.10%) after `completedLevels` workshop purchases. */
export function workshopLifestealStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Lifesteal', completedLevels)!
}

export function workshopLifestealStatDisplay(completedLevels: number): string {
  const pct = workshopLifestealStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopLifestealNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Lifesteal', completedLevels)
}
