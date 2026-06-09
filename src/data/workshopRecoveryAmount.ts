/**
 * Workshop **Recovery Amount**: stat and marginal coins from `tables/workshop/utility/recovery-amount.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'

export const WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL = 300 as const

export const WORKSHOP_RECOVERY_AMOUNT_BASE_PERCENT = 14 as const

export const WORKSHOP_RECOVERY_AMOUNT_PERCENT_PER_LEVEL = 0.4 as const

/** Bonus health % after `completedLevels` workshop purchases (exact **14 + 0.40 × level**). */
export function workshopRecoveryAmountStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Recovery Amount', completedLevels)!
}

export function workshopRecoveryAmountStatDisplay(completedLevels: number): string {
  const pct = workshopRecoveryAmountStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopRecoveryAmountNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Recovery Amount', completedLevels)
}
