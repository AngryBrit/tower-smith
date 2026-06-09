/**
 * Workshop **Max Recovery**: stat and marginal coins from `tables/workshop/utility/max-recovery.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_MAX_RECOVERY_MAX_LEVEL = 500 as const

export const WORKSHOP_MAX_RECOVERY_BASE_MULTIPLIER = 1 as const

/** Max recovery multiplier after `completedLevels` workshop purchases. */
export function workshopMaxRecoveryStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Max Recovery', completedLevels)!
}

export function workshopMaxRecoveryStatDisplay(completedLevels: number): string {
  const mult = workshopMaxRecoveryStatMultiplier(completedLevels)
  return `x${mult.toFixed(2)}`
}

export function workshopMaxRecoveryNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Max Recovery', completedLevels)
}

/** **Recovery Package +** × on the Max Recovery workshop card (no Free Upgrades+ cross-term). */
export function workshopDisplayedMaxRecoveryEnhancementMultiplier(
  enhanceRecoveryPackageLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRecoveryPackageLevel <= 0) return 1
  return workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceRecoveryPackageLevel)),
    'Recovery Package +',
  )
}
