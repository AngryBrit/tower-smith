/**
 * Workshop **Coins / Kill Bonus** from `tables/workshop/utility/coins-kill-bonus.json`.
 * One-time unlock: **100** coins after **Cash Bonus** and **Cash / Wave** are available.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL = 149 as const

/** One-time workshop unlock cost (before level purchases). */
export const WORKSHOP_COINS_KILL_BONUS_UNLOCK_COINS = 100 as const

/** Coins/kill multiplier with zero workshop level purchases. */
export const WORKSHOP_COINS_KILL_BONUS_BASE_MULTIPLIER = 1 as const

/** Per-level multiplier increment (wiki: +0.01 per level → **x2.49** at level 149). */
export const WORKSHOP_COINS_KILL_BONUS_MULTIPLIER_PER_LEVEL = 0.01 as const

/** Workshop coins/kill multiplier after `completedLevels` purchases (exact **1 + 0.01 × level**). */
export function workshopCoinsKillBonusStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Coins - Kill Bonus', completedLevels)!
}

export function workshopCoinsKillBonusStatDisplay(completedLevels: number): string {
  const mult = workshopCoinsKillBonusStatMultiplier(completedLevels)
  return `x${mult.toFixed(2)}`
}


export function workshopCoinsKillBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Coins - Kill Bonus', completedLevels)
}

/** Wiki milestone multipliers (for tests); equals {@link workshopCoinsKillBonusStatMultiplier} at anchor levels. */
export const WORKSHOP_COINS_KILL_BONUS_ANCHOR_MULTIPLIERS: readonly number[] = [
  1.01, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.49,
]
