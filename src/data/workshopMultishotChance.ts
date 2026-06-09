/**
 * Workshop **Multishot chance**: **99** upgrades, **+0.5%** per level → **49.5%** max.
 * Marginal **Cost** from the published ladder (wiki **Cost** per row).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL = 99 as const

/** Chance percent (0 … 49.5) after `completedLevels` purchases (0 … 99). */
export function workshopMultishotChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Multishot Chance', completedLevels)!
}

/** Display with two decimals to match in-game workshop UI (e.g. `56.50%`). */
export function workshopMultishotChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const pct = workshopMultishotChancePercent(completedLevels) + extraPercentPoints
  return `${pct.toFixed(2)}%`
}


export function workshopMultishotChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Multishot Chance', completedLevels)
}
