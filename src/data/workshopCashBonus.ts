/**
 * Workshop **Cash Bonus**: wiki milestone **Level** / **Value** (`x` multiplier) / **Cost** (marginal) / **Total Cost**;
 * max **149** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
export const WORKSHOP_CASH_BONUS_MAX_LEVEL = 149 as const

/** Cash multiplier with zero workshop purchases (before wiki level 1). */
export const WORKSHOP_CASH_BONUS_BASE_MULTIPLIER = 1 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 149,
]

/** Cash multiplier at each anchor level (wiki **Value**, e.g. 1.01 = 1.01x). */
const ANCHOR_STAT_MULTIPLIER: readonly number[] = [
  1.01, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.49,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  30, 674, 2880, 7060, 13_470, 22_310, 34_770, 49_380, 70_300, 91_980, 117_010, 157_130, 191_730, 257_880,
  305_530, 352_360,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]!) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1]! < level) i += 1
  return i
}

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

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_CASH_BONUS_MAX_LEVEL) return undefined
  if (targetLevel === 1) return ANCHOR_MARGINAL_COINS[0]

  const i = segmentIndex(targetLevel)
  const L0 = ANCHOR_LEVELS[i]!
  const L1 = ANCHOR_LEVELS[i + 1]!
  const v0 = ANCHOR_MARGINAL_COINS[i]!
  const v1 = ANCHOR_MARGINAL_COINS[i + 1]!
  if (targetLevel === L0) return v0
  if (targetLevel === L1) return v1
  if (L1 <= L0) return v0
  const t = (targetLevel - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

export function workshopCashBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Cash Bonus', completedLevels)
}
