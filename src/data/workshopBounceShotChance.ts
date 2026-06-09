/**
 * Workshop **Bounce Shot Chance**: **+0.80%** per purchase, **85** purchases → **68.00%**.
 * **Cost** is marginal coins per wiki row (1…85).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL = 85 as const

/** Chance percent (0 … 68) after `completedLevels` purchases (0 … 85). */
export function workshopBounceShotChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Bounce Shot Chance', completedLevels)!
}

/** Two decimals + `%` (e.g. `0.80%`, `68.00%`). */
export function workshopBounceShotChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const pct = workshopBounceShotChancePercent(completedLevels) + extraPercentPoints
  return `${pct.toFixed(2)}%`
}


export function workshopBounceShotChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Bounce Shot Chance', completedLevels)
}
