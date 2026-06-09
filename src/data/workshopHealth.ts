/**
 * Workshop **Health** (defense): wiki milestone **Level** / **Value** / **Cost** (marginal) / **Total Cost**;
 * max **6000** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation
 * (same pattern as {@link ./workshopDamage}).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_HEALTH_MAX_LEVEL = 6000 as const

/** Milestone workshop levels (must stay sorted ascending). */
const ANCHOR_LEVELS: readonly number[] = [
  1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500,
  3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200,
  5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000,
]

/** **Value** (HP) at each anchor level (wiki). */
const ANCHOR_STAT: readonly number[] = [
  10, 21_560, 143_010, 431_240, 943_900, 1.73e6, 2.85e6, 4.33e6, 6.23e6, 8.59e6, 11.44e6, 14.83e6,
  18.79e6, 23.36e6, 28.58e6, 34.48e6, 41.1e6, 48.48e6, 56.63e6, 65.61e6, 75.44e6, 86.15e6, 97.78e6,
  110.35e6, 123.89e6, 138.45e6, 154.04e6, 170.7e6, 188.46e6, 207.34e6, 227.37e6, 248.59e6, 271.01e6,
  294.68e6, 319.61e6, 345.84e6, 373.39e6, 402.29e6, 432.56e6, 464.24e6, 497.34e6, 531.9e6, 567.94e6,
  605.49e6, 644.56e6, 685.2e6, 727.42e6, 771.25e6, 816.72e6, 863.84e6, 912.65e6, 1.12e9, 1.37e9, 1.68e9,
  2.05e9, 2.5e9, 3.05e9, 3.72e9, 4.53e9, 5.52e9, 6.71e9,
]

/**
 * Marginal coin cost for the upgrade that ends at `targetLevel` (i.e. (targetLevel−1) → targetLevel),
 * matching the wiki **Cost** on the row for that level.
 */
const ANCHOR_MARGINAL_COINS: readonly number[] = [
  30, 77_220, 610_350, 1.5e6, 2.86e6, 4.7e6, 7.05e6, 9.94e6, 13.39e6, 17.41e6, 22.03e6, 27.24e6, 33.08e6,
  39.54e6, 46.64e6, 54.4e6, 62.82e6, 71.92e6, 81.7e6, 92.17e6, 103.33e6, 115.21e6, 127.81e6, 141.13e6,
  155.18e6, 169.97e6, 185.5e6, 201.79e6, 218.84e6, 236.66e6, 255.24e6, 274.61e6, 294.75e6, 315.69e6,
  337.42e6, 359.96e6, 383.3e6, 407.45e6, 432.42e6, 458.2e6, 484.82e6, 512.27e6, 540.55e6, 569.67e6,
  599.64e6, 630.46e6, 662.13e6, 694.66e6, 728.06e6, 762.32e6, 797.45e6, 1.67e9, 3.48e9, 7.26e9, 15.15e9,
  39.45e9, 102.67e9, 267.02e9, 693.95e9, 1.8e12, 4.68e12,
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

/** HP **Value** after `completedLevels` workshop purchases (0 … 6000). */
export function workshopHealthStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Health', completedLevels)!
}

/** Abbreviated wiki **Value** (same style as other workshop stats). */
export function workshopHealthStatDisplay(completedLevels: number): string {
  return formatCoinAbbrev(workshopHealthStatValue(completedLevels))
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_HEALTH_MAX_LEVEL) return undefined
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

/**
 * Coins for the next workshop health upgrade when `completedLevels` purchases are already done.
 * `undefined` when maxed (6000) or out of range.
 */
export function workshopHealthNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Health', completedLevels)
}
