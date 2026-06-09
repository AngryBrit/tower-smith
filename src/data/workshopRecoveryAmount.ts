/**
 * Workshop **Recovery Amount**: stat and marginal coins from `tables/workshop/utility/recovery-amount.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceFreeUpgradesMultiplier } from './workshopEnhanceFreeUpgrades'
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
 * Share of **Free Upgrades +** enhancement excess in displayed Recovery Amount
 * (calibrated: Recovery Package+ **×1.4** + Free Upgrades+ **×1.1** on **152%** → **220.86%**).
 */
export const WORKSHOP_DISPLAYED_RECOVERY_AMOUNT_FREE_UPGRADES_ENHANCE_EXCESS_FRACTION =
  0.53026315789473684

/** **Recovery Package +** tier plus partial **Free Upgrades +** excess when unlocked. */
export function workshopDisplayedRecoveryAmountEnhancementMultiplier(
  enhanceRecoveryPackageLevel: number,
  enhanceFreeUpgradesLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRecoveryPackageLevel <= 0) return 1
  const recoveryMult = workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceRecoveryPackageLevel)),
    'Recovery Package +',
  )
  if (recoveryMult <= 1 + 1e-9) return 1
  const freeMult =
    enhanceFreeUpgradesLevel > 0
      ? workshopEnhanceFreeUpgradesMultiplier(Math.max(0, Math.trunc(enhanceFreeUpgradesLevel)))
      : 1
  const freeExcess = Math.max(0, freeMult - 1)
  return (
    recoveryMult +
    freeExcess * WORKSHOP_DISPLAYED_RECOVERY_AMOUNT_FREE_UPGRADES_ENHANCE_EXCESS_FRACTION
  )
}
