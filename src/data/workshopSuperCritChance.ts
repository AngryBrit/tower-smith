/**
 * Workshop **Super Crit Chance**: **+0.20%** per purchase, **100** purchases → **20.00%**.
 * **Cost** is marginal coins per wiki row (1…100).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL = 100 as const

/** Chance percent (0 … 20) after `completedLevels` purchases (0 … 100). */
export function workshopSuperCritChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Super Crit Chance', completedLevels)!
}

/** Two decimals + `%` (e.g. `0.20%`, `20.00%`). */
export function workshopSuperCritChanceStatDisplay(
  completedLevels: number,
  labPercentPoints?: number,
): string {
  let pct = workshopSuperCritChancePercent(completedLevels)
  if (labPercentPoints != null && Number.isFinite(labPercentPoints) && labPercentPoints > 0) {
    pct += labPercentPoints
  }
  return `${pct.toFixed(2)}%`
}


export function workshopSuperCritChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Super Crit Chance', completedLevels)
}
