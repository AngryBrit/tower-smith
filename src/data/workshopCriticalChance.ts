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


/**
 * Coins for the next workshop critical chance upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (79) or out of range.
 */
export function workshopCriticalChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Critical Chance', completedLevels)
}
