/**
 * Workshop **Attack range**: **30m** base, **+0.5m** per purchase, **79** purchases → **69.5m**.
 * Wiki **Value** uses an **M** suffix for meters. **Cost** is marginal coins per row (full ladder).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ATTACK_RANGE_MAX_LEVEL = 79 as const

/** Marginal coins for upgrade ending at workshop level L (1…79), i.e. wiki **Cost** on that row. */
const MARGINAL_COINS: readonly number[] = [
  50, 78, 114, 160, 217, 285, 366, 461, 569, 691, 828, 980, 1150, 1330, 1530, 1740, 1980, 2230, 2490,
  2780, 3080, 3400, 3740, 4090, 4470, 4860, 5270, 5710, 6160, 6630, 7120, 7630, 8160, 8710, 9290, 9880,
  10490, 11130, 11780, 12460, 13160, 13880, 14620, 15380, 16170, 16980, 17810, 18660, 19530, 20430,
  21990, 22960, 23950, 24970, 26010, 27080, 28170, 29280, 30420, 31590, 32780, 33990, 35220, 36490,
  37770, 39090, 40420, 41790, 43170, 44590, 46030, 47490, 48980, 50500, 52040, 56290, 57960, 59670,
  61400,
]

/** Range in meters after `completedLevels` workshop purchases (0 … 79). */
export function workshopAttackRangeMeters(completedLevels: number): number {
  return workshopToolkitStatValue('Range', completedLevels)! / 1e6
}

/** Wiki-style value (`30.00M` … `69.50M`); **M** = meters. */
export function workshopAttackRangeStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleMetersAdd = 0,
): string {
  let m = workshopAttackRangeMeters(completedLevels) + submoduleMetersAdd
  if (labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9) {
    m = Math.round(m * labMultiplier * 100) / 100
  }
  return `${m.toFixed(2)}M`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_ATTACK_RANGE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

/**
 * Coins for the next workshop attack range upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (79) or out of range.
 */
export function workshopAttackRangeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Range', completedLevels)
}
