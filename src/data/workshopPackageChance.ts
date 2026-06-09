/**
 * Workshop **Package Chance**: wiki **Level** 1…60 (**Value** +0.40% per level, marginal **Cost** per row).
 * Base **6%** at level 0 → **30%** at level 60.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL = 60 as const

export const WORKSHOP_PACKAGE_CHANCE_BASE_PERCENT = 6 as const

export const WORKSHOP_PACKAGE_CHANCE_PERCENT_PER_LEVEL = 0.4 as const


/** Package spawn chance % after `completedLevels` workshop purchases (exact **6 + 0.40 × level**). */
export function workshopPackageChanceStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Package Chance', completedLevels)!
}

export function workshopPackageChanceStatDisplay(completedLevels: number): string {
  const pct = workshopPackageChanceStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopPackageChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Package Chance', completedLevels)
}
