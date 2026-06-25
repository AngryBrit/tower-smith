/**
 * Workshop **Recovery Amount**: stat and marginal coins from `tables/workshop/utility/recovery-amount.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

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

/**
 * **Recovery Package +** enhancement tier multiplier when unlocked.
 *
 * Verified against `Main::GetOutOfRoundRecoveryAmount` in libil2cpp.so:
 * `((14 + 0.4·level + lab% + module%) × recoveryPackageEnhancement + techTree) × relics.recoveryAmount`.
 * Only **Recovery Package +** scales the card here — **Free Upgrades +** does **not** apply, and the
 * recovery relic is a final multiplier (see `recoveryAmountRelicMultiplier`), not additive lab points.
 */
export function workshopDisplayedRecoveryAmountEnhancementMultiplier(
  enhanceRecoveryPackageLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRecoveryPackageLevel <= 0) return 1
  const recoveryMult = workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceRecoveryPackageLevel)),
    'Recovery Package +',
  )
  return recoveryMult > 1 + 1e-9 ? recoveryMult : 1
}
