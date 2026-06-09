/**
 * Workshop **Coins / Kill Bonus**: wiki milestone **Level** / **Value** (`x` multiplier) / **Cost** (marginal) / **Total Cost**;
 * max **149** levels. **Value** is **1 + 0.01 × level** (no rounding). Marginal **Cost** uses log-linear interpolation
 * between milestones. One-time workshop unlock: **100** coins after **Cash Bonus** and **Cash / Wave** are available.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL = 149 as const

/** One-time workshop unlock cost (before level purchases). */
export const WORKSHOP_COINS_KILL_BONUS_UNLOCK_COINS = 100 as const

/** Coins/kill multiplier with zero workshop level purchases. */
export const WORKSHOP_COINS_KILL_BONUS_BASE_MULTIPLIER = 1 as const

/** Per-level multiplier increment (wiki: +0.01 per level → **x2.49** at level 149). */
export const WORKSHOP_COINS_KILL_BONUS_MULTIPLIER_PER_LEVEL = 0.01 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 149,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  50, 838, 3580, 8840, 17_020, 28_410, 44_560, 63_660, 91_100, 119_750, 152_970, 206_190, 252_450, 340_640,
  404_780, 467_980,
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

/** Workshop coins/kill multiplier after `completedLevels` purchases (exact **1 + 0.01 × level**). */
export function workshopCoinsKillBonusStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Coins - Kill Bonus', completedLevels)!
}

export function workshopCoinsKillBonusStatDisplay(completedLevels: number): string {
  const mult = workshopCoinsKillBonusStatMultiplier(completedLevels)
  return `x${mult.toFixed(2)}`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL) return undefined
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

export function workshopCoinsKillBonusNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Coins - Kill Bonus', completedLevels)
}

/** Wiki milestone multipliers (for tests); equals {@link workshopCoinsKillBonusStatMultiplier} at anchor levels. */
export const WORKSHOP_COINS_KILL_BONUS_ANCHOR_MULTIPLIERS: readonly number[] = [
  1.01, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.49,
]
