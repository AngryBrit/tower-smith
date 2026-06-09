/**
 * Workshop **Multishot targets**: **7** upgrades; base **2** targets → **9** (+1 per level).
 * Marginal **Cost** from the published ladder (wiki **Cost** per row).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL = 7 as const

/** Target count after `completedLevels` workshop purchases (0 … 7). */
export function workshopMultishotTargetsCount(completedLevels: number): number {
  return workshopToolkitStatValue('Multishot Targets', completedLevels)!
}

/** Integer target count as display string. */
export function workshopMultishotTargetsStatDisplay(
  completedLevels: number,
  extraCount = 0,
): string {
  return String(workshopMultishotTargetsCount(completedLevels) + extraCount)
}


export function workshopMultishotTargetsNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Multishot Targets', completedLevels)
}
