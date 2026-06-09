/**
 * Workshop **Recovery Amount**: wiki milestone **Cost** (shared recovery ladder); max **300** levels.
 * **Value** is **14 + 0.40 × level** percent (base **14%** at level 0 → **134%** at level 300).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopRecoverySharedMarginalCoins } from './workshopRecoveryShared'

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
