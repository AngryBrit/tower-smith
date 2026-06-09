/**
 * Shared constants for **Enemy Attack Level Skip** and **Enemy Health Level Skip**.
 * Unlock **1B** coins after Recovery Packages; max **699** levels.
 */

import { workshopToolkitStatValue } from '../workshopCosts'

export const WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS = 1_000_000_000 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL = 699 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_BASE_PERCENT = 0.05 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_PERCENT_PER_LEVEL = 0.05 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230,
  240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450,
  460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670,
  680, 690, 699,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  300e6, 444.01e6, 604.08e6, 764.32e6, 924.86e6, 2.17e9, 2.57e9, 2.9e9, 3.4e9, 7.52e9, 8.23e9, 9.67e9, 10.47e9,
  25.23e9, 27.05e9, 28.89e9, 35.68e9, 75.76e9, 97.1e9, 102.62e9, 108.26e9, 228.03e9, 239.79e9, 251.82e9, 264.13e9,
  553.48e9, 579.34e9, 605.87e9, 633.11e9, 1.98e12, 2.07e12, 2.16e12, 2.25e12, 7.03e12, 7.32e12, 7.62e12, 7.93e12,
  24.73e12, 25.71e12, 26.72e12, 27.77e12, 86.52e12, 89.85e12, 93.27e12, 96.81e12, 301.37e12, 312.65e12, 324.29e12,
  336.28e12, 1.39e15, 1.45e15, 1.5e15, 1.55e15, 6.43e15, 6.66e15, 6.9e15, 7.15e15, 29.59e15, 30.63e15, 31.7e15,
  32.8e15, 135.72e15, 140.38e15, 145.18e15, 150.12e15, 775.99e15, 802.09e15, 828.94e15, 856.53e15, 4.42e18, 4.56e18,
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

/** @deprecated Use {@link workshopEnemyAttackLevelSkipStatPercent} or health variant. */
export function workshopEnemyLevelSkipStatPercent(completedLevels: number): number {
  return workshopEnemyAttackLevelSkipStatPercent(completedLevels)
}

export function workshopEnemyAttackLevelSkipStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Enemy Attack Level Skip', completedLevels)!
}

export function workshopEnemyHealthLevelSkipStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Enemy Health Level Skip', completedLevels)!
}

export function workshopEnemyAttackLevelSkipStatDisplay(completedLevels: number): string {
  const pct = workshopEnemyAttackLevelSkipStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopEnemyHealthLevelSkipStatDisplay(completedLevels: number): string {
  const pct = workshopEnemyHealthLevelSkipStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

/** @deprecated Use attack/health-specific display helpers. */
export function workshopEnemyLevelSkipStatDisplay(completedLevels: number): string {
  return workshopEnemyAttackLevelSkipStatDisplay(completedLevels)
}

/** Marginal coin cost for workshop level `targetLevel` (1…699). */
export function workshopEnemyLevelSkipMarginalCoins(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL) return undefined
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

export function workshopEnemyLevelSkipNextMarginalCoins(completedLevels: number): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL) return undefined
  return workshopEnemyLevelSkipMarginalCoins(completedLevels + 1)
}
