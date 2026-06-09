/**
 * Workshop **Max Recovery**: wiki milestone **Value** (`x` multiplier) and shared **Cost** ladder; max **500** levels.
 * Between milestones, **Value** uses log-linear interpolation (wiki table); level 0 is **x1.00**.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopRecoverySharedMarginalCoins } from './workshopRecoveryShared'

export const WORKSHOP_MAX_RECOVERY_MAX_LEVEL = 500 as const

export const WORKSHOP_MAX_RECOVERY_BASE_MULTIPLIER = 1 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230,
  240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450,
  460, 470, 480, 490, 500,
]

const ANCHOR_STAT_MULTIPLIER: readonly number[] = [
  1.53, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9, 7.2, 7.5, 7.8, 8.1,
  8.4, 8.7, 9.0, 9.3, 9.6, 9.9, 10.2, 10.5, 10.8, 11.1, 11.4, 11.7, 12.0, 12.3, 12.6, 12.9, 13.2, 13.5, 13.8, 14.1,
  14.4, 14.7, 15.0, 15.3, 15.6, 15.9, 16.2, 16.5,
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

/** Max recovery multiplier after `completedLevels` workshop purchases. */
export function workshopMaxRecoveryStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Max Recovery', completedLevels)!
}

export function workshopMaxRecoveryStatDisplay(completedLevels: number): string {
  const mult = workshopMaxRecoveryStatMultiplier(completedLevels)
  return `x${mult.toFixed(2)}`
}

export function workshopMaxRecoveryNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Max Recovery', completedLevels)
}
