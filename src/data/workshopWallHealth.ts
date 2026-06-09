/**
 * Workshop **Wall Health**: wiki milestone **Level** / **Value** / **Cost** (marginal) / **Total Cost**;
 * max **1800** levels. Between milestones, **Value** (%) and marginal **Cost** use log-linear interpolation.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_WALL_HEALTH_MAX_LEVEL = 1800 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
]

/** Wall health bonus **%** at each anchor level (wiki **Value**). */
const ANCHOR_STAT_PERCENT: readonly number[] = [
  20.1, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  8e6, 31.91e6, 111.04e6, 398.7e6, 665.11e6, 2.09e9, 3.14e9, 9.02e9, 12.52e9, 33.73e9, 44.29e9, 113.82e9,
  143.51e9, 356.03e9, 435.37e9, 1.58e12, 1.88e12, 6.68e12, 23.48e12,
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

/** Wall health bonus % after `completedLevels` workshop purchases (0 … 1800). */
export function workshopWallHealthStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Wall Health', completedLevels)!
}

export function workshopWallHealthStatDisplay(completedLevels: number): string {
  const pct = workshopWallHealthStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_WALL_HEALTH_MAX_LEVEL) return undefined
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

export function workshopWallHealthNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Wall Health', completedLevels)
}
