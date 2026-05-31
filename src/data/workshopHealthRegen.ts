/**
 * Workshop **Health Regen** (defense): wiki milestone **Level** / **Value** / **Cost** / **Total Cost**;
 * max **6000** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation
 * (same pattern as {@link ./workshopHealth}).
 */

import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_HEALTH_REGEN_MAX_LEVEL = 6000 as const

/** Milestone workshop levels (must stay sorted ascending). */
const ANCHOR_LEVELS: readonly number[] = [
  1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500,
  3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200,
  5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000,
]

/** **Value** at each anchor level (wiki). */
const ANCHOR_STAT: readonly number[] = [
  0, 269, 1410, 3870, 9020, 17_680, 40_560, 120_370, 300_090, 619_260, 1.12e6, 1.82e6, 2.78e6, 4.02e6,
  5.58e6, 7.48e6, 9.76e6, 12.46e6, 15.59e6, 19.21e6, 23.32e6, 27.98e6, 33.19e6, 39.01e6, 45.44e6, 52.53e6,
  60.3e6, 68.78e6, 78e6, 87.98e6, 98.77e6, 110.37e6, 122.82e6, 136.16e6, 150.4e6, 165.57e6, 181.7e6,
  198.82e6, 216.95e6, 236.12e6, 256.36e6, 277.7e6, 300.15e6, 323.75e6, 348.53e6, 374.5e6, 401.69e6,
  430.14e6, 459.86e6, 490.88e6, 523.23e6, 707.8e6, 956.2e6, 1.29e9, 1.74e9, 2.34e9, 3.15e9, 4.22e9,
  5.67e9, 7.6e9, 10.17e9,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  30, 77_220, 610_350, 1.5e6, 2.86e6, 4.7e6, 7.05e6, 9.94e6, 13.39e6, 17.41e6, 22.03e6, 27.24e6, 33.08e6,
  39.54e6, 46.64e6, 54.4e6, 62.82e6, 71.92e6, 81.7e6, 92.17e6, 103.33e6, 115.21e6, 127.81e6, 141.13e6,
  155.18e6, 169.97e6, 185.5e6, 201.79e6, 218.84e6, 236.66e6, 255.24e6, 274.61e6, 294.75e6, 315.69e6,
  337.42e6, 359.96e6, 383.3e6, 407.45e6, 432.42e6, 458.2e6, 484.82e6, 512.27e6, 540.55e6, 569.67e6,
  599.64e6, 630.46e6, 662.13e6, 694.66e6, 728.06e6, 762.32e6, 797.45e6, 1.25e9, 1.96e9, 3.06e9, 4.79e9,
  9.99e9, 20.79e9, 43.26e9, 89.94e9, 186.86e9, 388e9,
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

/** **Value** after `completedLevels` workshop purchases (0 … 6000). */
export function workshopHealthRegenStatValue(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_HEALTH_REGEN_MAX_LEVEL)
  if (L === 0) return 0
  if (L === 1) return ANCHOR_STAT[0]!

  const i = segmentIndex(L)
  const L0 = ANCHOR_LEVELS[i]!
  const L1 = ANCHOR_LEVELS[i + 1]!
  const v0 = ANCHOR_STAT[i]!
  const v1 = ANCHOR_STAT[i + 1]!
  if (L1 <= L0) return v0
  const t = (L - L0) / (L1 - L0)
  return Math.round(logLerp(v0, v1, t))
}

export function workshopHealthRegenStatDisplay(
  completedLevels: number,
  dissonanceMultiplier = 1,
): string {
  const base = workshopHealthRegenStatValue(completedLevels)
  const scaled =
    dissonanceMultiplier !== 1 && Number.isFinite(dissonanceMultiplier)
      ? Math.round(base * dissonanceMultiplier)
      : base
  return formatCoinAbbrev(scaled)
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_HEALTH_REGEN_MAX_LEVEL) return undefined
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

export function workshopHealthRegenNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_HEALTH_REGEN_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
