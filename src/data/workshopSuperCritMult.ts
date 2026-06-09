/**
 * Workshop **Super Crit Mult**: stat and marginal coins from `tables/workshop/attack/super-crit-mult.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL = 120 as const

/** Multiplier (1.2 … 13.2) after `completedLevels` purchases (0 … 120). */
export function workshopSuperCritMultValue(completedLevels: number): number {
  return workshopToolkitStatValue('Super Crit Mult', completedLevels)!
}

/** Display like in-game workshop card (`×1.20` … `×13.20`). */
export function workshopSuperCritMultStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
): string {
  const base = workshopSuperCritMultValue(completedLevels) + submoduleAdd
  const v =
    labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9
      ? base * labMultiplier
      : base
  const displayed = Math.floor(v * 100 + 1e-9) / 100
  return `×${displayed.toFixed(2)}`
}


export function workshopSuperCritMultNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Super Crit Mult', completedLevels)
}
