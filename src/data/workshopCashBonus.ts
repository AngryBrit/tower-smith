/** Workshop **Cash Bonus** from `tables/workshop/utility/cash-bonus.json`. */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
export const WORKSHOP_CASH_BONUS_MAX_LEVEL = 149 as const

/** Cash multiplier with zero workshop purchases (before wiki level 1). */
export const WORKSHOP_CASH_BONUS_BASE_MULTIPLIER = 1 as const

/** Cash multiplier at each anchor level (wiki **Value**, e.g. 1.01 = 1.01x). */
/** Cash multiplier after `completedLevels` workshop purchases. */
export function workshopCashBonusStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Cash Bonus', completedLevels)!
}

export function workshopCashBonusStatDisplay(completedLevels: number): string {
  const mult = workshopCashBonusStatMultiplier(completedLevels)
  return `x${mult.toFixed(2)}`
}

/**
 * **Cash Bonus +** contribution on the main Cash Bonus workshop card (additive `x`, not ×).
 * Calibrated: L10 enhance adds **+0.09** on top of **x5.10** → in-game **x5.19**.
 */
export function workshopDisplayedCashBonusEnhancementAdditive(
  enhanceCashBonusLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCashBonusLevel <= 0) return 0
  const level = Math.max(0, Math.trunc(enhanceCashBonusLevel))
  if (level <= 0) return 0
  return workshopEnhanceTier400Multiplier(level - 1, 'Cash Bonus +') - 1
}


export function workshopCashBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Cash Bonus', completedLevels)
}
