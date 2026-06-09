/**
 * Workshop **Bounce Shot Range**: **2.0m** base, **+0.1m** per purchase, **60** purchases → **8.0m**.
 * Rows **1…40** share the same marginal **Cost** ladder as Bounce Shot Chance; **41…60** use the wiki range ladder.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL = 60 as const

/** GOD **Value** is meters ×1e6 (same encoding as workshop **Range**). */
const BOUNCE_SHOT_RANGE_GOD_VALUE_SCALE = 1e-6

/** Range in meters after `completedLevels` purchases (0 … 60). */
export function workshopBounceShotRangeMeters(completedLevels: number): number {
  return workshopToolkitStatValue('Bounce Shot Range', completedLevels)! * BOUNCE_SHOT_RANGE_GOD_VALUE_SCALE
}

/** Display like wiki (`2.00m` … `8.00m`). */
export function workshopBounceShotRangeStatDisplay(
  completedLevels: number,
  submoduleMetersAdd = 0,
): string {
  const m = workshopBounceShotRangeMeters(completedLevels) + submoduleMetersAdd
  return `${m.toFixed(2)}m`
}


export function workshopBounceShotRangeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Bounce Shot Range', completedLevels)
}
