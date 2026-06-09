/**
 * Workshop **Cash / Wave**: wiki milestone **Level** / **Value** (cash per wave) / **Cost** (marginal) / **Total Cost**;
 * max **149** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_CASH_PER_WAVE_MAX_LEVEL = 149 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 149,
]

/** Cash per wave at each anchor level (wiki **Value**). */
const ANCHOR_STAT_CASH_PER_WAVE: readonly number[] = [
  4, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 596,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  30, 674, 2880, 7060, 13_470, 22_310, 34_770, 49_380, 70_300, 91_980, 117_010, 157_130, 191_730, 257_880,
  305_530, 352_360,
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

/** Cash per wave after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopCashPerWaveStatAmount(completedLevels: number): number {
  return workshopToolkitStatValue('Cash - Wave', completedLevels)!
}

export function workshopCashPerWaveStatDisplay(completedLevels: number): string {
  return String(workshopCashPerWaveStatAmount(completedLevels))
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_CASH_PER_WAVE_MAX_LEVEL) return undefined
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

export function workshopCashPerWaveNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Cash - Wave', completedLevels)
}
