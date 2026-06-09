/**
 * Workshop **Multishot targets**: **7** upgrades; base **2** targets → **9** (+1 per level).
 * Marginal **Cost** from the published ladder (wiki **Cost** per row).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL = 7 as const

const MARGINAL_COINS: readonly number[] = [
  450, 2000, 5000, 12_500, 40_000, 120_000, 350_000,
]

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

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopMultishotTargetsNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Multishot Targets', completedLevels)
}
