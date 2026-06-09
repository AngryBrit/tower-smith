/**
 * Workshop **Critical Chance**: **79** upgrades; workshop-only chance **1% → 80%** (+1% per purchase).
 *
 * **Value** in the wiki is the chance as a fraction of 1 (`0.01` … `0.80`); the workshop card shows the
 * same value as **`1%` … `80%`**. **Cost** is the marginal
 * coin price for that row (79 entries). **Total Cost** in the wiki is abbreviated (e.g. `1.41M`);
 * sums here use exact marginal integers.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatPercentAfterLabAddition } from './workshopLabDisplayHelpers'
export const WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL = 79 as const

/** Marginal coins for upgrade ending at workshop level L (1…79), i.e. wiki **Cost** on that row. */
const MARGINAL_COINS: readonly number[] = [
  50, 76, 109, 153, 206, 271, 349, 439, 542, 659, 790, 935, 1100, 1270, 1460, 1670, 1890, 2130, 2390,
  2660, 2950, 3260, 3580, 3930, 4290, 4670, 5060, 5480, 5920, 6370, 6840, 7330, 7850, 8380, 8930, 9500,
  10090, 10700, 11330, 11990, 12660, 13350, 14070, 14810, 15560, 16340, 17140, 17960, 18810, 19670, 21170,
  22110, 23070, 24050, 25060, 26080, 27140, 28210, 29310, 30430, 31580, 32750, 33940, 35160, 36400, 37660,
  38950, 40270, 41610, 42970, 44360, 45770, 47210, 48670, 50160, 54260, 55870, 57520, 59180,
]

/** Workshop crit chance as a percent (1 … 80) after `completedLevels` purchases (0 … 79). */
export function workshopCriticalChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Critical Chance', completedLevels)!
}

/** Same as wiki **Value** / GOD `valueDisplay` (`1.00%` … `80.00%`). */
export function workshopCriticalChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const extra = Number.isFinite(extraPercentPoints) ? extraPercentPoints : 0
  return formatPercentAfterLabAddition(workshopCriticalChancePercent(completedLevels), extra)
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

/**
 * Coins for the next workshop critical chance upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (79) or out of range.
 */
export function workshopCriticalChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Critical Chance', completedLevels)
}
