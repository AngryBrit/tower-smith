/**
 * Workshop **Wall Rebuild**: wiki milestone **Level** / **Value** (seconds) / **Cost** (marginal) / **Total Cost**;
 * max **300** levels. Between milestones, **Value** and marginal **Cost** use log-linear interpolation.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_WALL_REBUILD_MAX_LEVEL = 300 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220,
  230, 240, 250, 260, 270, 280, 290, 300,
]

/** Rebuild time (seconds) with zero workshop purchases (before wiki level 1). */
export const WORKSHOP_WALL_REBUILD_BASE_SECONDS = 1200 as const

/** Rebuild time in seconds at each anchor level (wiki **Value**). */
const ANCHOR_STAT_SECONDS: readonly number[] = [
  1198, 1180, 1160, 1140, 1120, 1100, 1080, 1060, 1040, 1020, 1000, 980, 960, 940, 920, 900, 880, 860, 840, 820,
  800, 780, 760, 740, 720, 700, 680, 660, 640, 620, 600,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  16e6, 23.21e6, 31.37e6, 39.98e6, 49.45e6, 60.28e6, 150.51e6, 182.21e6, 231.8e6, 281.18e6, 341.3e6, 894.47e6,
  1.08e9, 1.47e9, 1.77e9, 2.12e9, 8.79e9, 10.44e9, 14.93e9, 17.56e9, 20.54e9, 71.71e9, 83.06e9, 95.76e9, 109.9e9,
  125.59e9, 571.7e9, 648.06e9, 731.87e9, 823.55e9, 923.56e9,
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

/** GOD **Value** stores seconds ×1e21 (import parses trailing `s` as septillion suffix). */
const WALL_REBUILD_GOD_VALUE_SCALE = 1e-21

/** Rebuild time (seconds) after `completedLevels` workshop purchases. */
export function workshopWallRebuildStatSeconds(completedLevels: number): number {
  const raw = workshopToolkitStatValue('Wall Rebuild', completedLevels)! * WALL_REBUILD_GOD_VALUE_SCALE
  return Math.round(raw)
}

export function workshopWallRebuildStatDisplay(completedLevels: number): string {
  const sec = workshopWallRebuildStatSeconds(completedLevels)
  return `${sec}s`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_WALL_REBUILD_MAX_LEVEL) return undefined
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

export function workshopWallRebuildNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Wall Rebuild', completedLevels)
}
