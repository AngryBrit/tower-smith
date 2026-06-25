/**
 * Workshop **Coins / Kill Bonus** from `tables/workshop/utility/coins-kill-bonus.json`.
 * One-time unlock: **100** coins after **Cash Bonus** and **Cash / Wave** are available.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
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

/**
 * **Coin Bonus +** multiplier on the Coins / Kill Bonus workshop card (multiplicative ×).
 * Mirrors the **Cash Bonus +** treatment. Calibrated against an in-game save:
 * workshop **x2.49** × lab **x2.78** × Coin Bonus+ **x1.26** (L26) → **x8.72** (matches in-game).
 *
 * NOTE: the equipped generator's Coin Bonus is **not** applied to this card. In `libil2cpp.so`
 * (`Main::GetOutOfRoundCoinsBonusUpgrade`) the card multiplies by `Main.coinsMultFromModule`
 * (offset `0x4F0`), but that field is a **transient in-run accumulation** (its writer reads the
 * prior value and multiplies onto it) that resets to **1.0** on a game reset — so the steady-state
 * card is x8.72. Coin relics also have no effect here (the getter never reads `relics.coin`).
 */
export function workshopDisplayedCoinsKillBonusEnhancementMultiplier(
  enhanceCoinBonusLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCoinBonusLevel <= 0) return 1
  const level = Math.max(0, Math.trunc(enhanceCoinBonusLevel))
  if (level <= 0) return 1
  return workshopEnhanceTier400Multiplier(level, 'Coin Bonus +')
}


export function workshopCoinsKillBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Coins - Kill Bonus', completedLevels)
}

/** Wiki milestone multipliers (for tests); equals {@link workshopCoinsKillBonusStatMultiplier} at anchor levels. */
export const WORKSHOP_COINS_KILL_BONUS_ANCHOR_MULTIPLIERS: readonly number[] = [
  1.01, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.49,
]
