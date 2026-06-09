/**
 * Workshop **Defense Absolute**: wiki milestone **Level** / **Value** / **Cost** (marginal) / **Total Cost**;
 * max **5000** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation
 * (same pattern as {@link ./workshopHealth}).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL = 5000 as const

/** Milestone workshop levels (must stay sorted ascending). */
const ANCHOR_LEVELS: readonly number[] = [
  1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500,
  3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000,
]

/** **Value** at each anchor level (wiki). */
const ANCHOR_STAT: readonly number[] = [
  1, 1020, 5990, 17_160, 38_390, 74_220, 126_840, 198_060, 289_480, 402_570, 538_720, 699_240, 885_360,
  1.1e6, 1.34e6, 1.62e6, 1.94e6, 2.3e6, 2.7e6, 3.14e6, 3.65e6, 4.21e6, 4.84e6, 5.53e6, 6.29e6, 7.13e6,
  8.04e6, 9.07e6, 10.22e6, 11.5e6, 12.92e6, 14.5e6, 16.23e6, 18.12e6, 20.19e6, 22.43e6, 24.85e6, 27.45e6,
  30.25e6, 33.24e6, 36.44e6, 39.83e6, 43.43e6, 47.25e6, 51.28e6, 55.53e6, 60.01e6, 64.71e6, 69.64e6,
  74.81e6, 80.21e6,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  50, 77_240, 610_390, 1.5e6, 2.86e6, 4.7e6, 7.05e6, 9.94e6, 13.39e6, 17.41e6, 22.03e6, 27.24e6, 33.08e6,
  39.54e6, 46.64e6, 54.4e6, 62.82e6, 71.92e6, 81.7e6, 92.17e6, 103.33e6, 115.21e6, 127.81e6, 141.13e6,
  155.18e6, 169.97e6, 185.5e6, 201.79e6, 218.84e6, 236.66e6, 255.24e6, 274.61e6, 294.75e6, 315.69e6,
  337.42e6, 359.96e6, 383.3e6, 407.45e6, 432.42e6, 458.2e6, 484.82e6, 512.27e6, 540.55e6, 569.67e6,
  599.64e6, 630.46e6, 662.13e6, 694.66e6, 728.06e6, 762.32e6, 797.45e6,
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

/** **Value** after `completedLevels` workshop purchases (0 … 5000). */
export function workshopDefenseAbsoluteStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Defense Absolute', completedLevels)!
}

export function workshopDefenseAbsoluteStatDisplay(completedLevels: number): string {
  return formatCoinAbbrev(workshopDefenseAbsoluteStatValue(completedLevels))
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL) return undefined
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

export function workshopDefenseAbsoluteNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Defense Absolute', completedLevels)
}
