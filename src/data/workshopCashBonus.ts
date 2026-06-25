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
 * **Cash Bonus +** multiplier on the main Cash Bonus workshop card (multiplicative ×).
 * Calibrated against an in-game save: workshop **x2.49** × lab **x1.54** × Cash Bonus+ **x1.40**
 * (L40) × (1 + cash relics **0.25**) → in-game **x6.71**.
 */
export function workshopDisplayedCashBonusEnhancementMultiplier(
  enhanceCashBonusLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCashBonusLevel <= 0) return 1
  const level = Math.max(0, Math.trunc(enhanceCashBonusLevel))
  if (level <= 0) return 1
  return workshopEnhanceTier400Multiplier(level, 'Cash Bonus +')
}


export function workshopCashBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Cash Bonus', completedLevels)
}
