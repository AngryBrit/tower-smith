/**
 * Workshop **Bounce Shot Targets**: base **1** bounce target; **+1** per purchase, **7** purchases → **8** targets.
 * Wiki **Cost** is marginal coins per row (1…7). Perk cap (14) is not modeled here.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL = 7 as const

/** Total bounce targets (1 … 8) after `completedLevels` workshop purchases (0 … 7). */
export function workshopBounceShotTargetsCount(completedLevels: number): number {
  return workshopToolkitStatValue('Bounce Shot Targets', completedLevels)!
}

export function workshopBounceShotTargetsStatDisplay(
  completedLevels: number,
  extraCount = 0,
): string {
  return String(workshopBounceShotTargetsCount(completedLevels) + extraCount)
}


export function workshopBounceShotTargetsNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Bounce Shot Targets', completedLevels)
}
