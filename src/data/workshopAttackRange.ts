/**
 * Workshop **Attack range**: **30m** base, **+0.5m** per purchase, **79** purchases → **69.5m**.
 * Wiki **Value** uses an **M** suffix for meters. **Cost** is marginal coins per row (full ladder).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ATTACK_RANGE_MAX_LEVEL = 79 as const

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


/**
 * Coins for the next workshop attack range upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (79) or out of range.
 */
export function workshopAttackRangeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Range', completedLevels)
}
