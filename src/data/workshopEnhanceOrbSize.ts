/**
 * Workshop **Orb Size** defense enhancement: **200** levels, **+0.01×** per level → **×3.00**.
 * Dedicated coin ladder (wiki **Coins** at decade milestones, log-linear between).
 */

import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL = 200 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  5e9, 477.01e9, 15.26e12, 174.29e12, 1.92e15, 8.82e15, 63.9e15, 257.74e15, 760.97e15, 1.86e18,
  4.02e18, 7.88e18, 14.38e18, 24.75e18, 40.61e18, 64.05e18, 97.66e18, 144.65e18, 208.91e18,
  295.11e18, 408.77e18,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1] < level) i += 1
  return i
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL) return undefined
  if (targetLevel === ANCHOR_LEVELS[0]) return ANCHOR_MARGINAL_COINS[0]

  const i = segmentIndex(targetLevel)
  const L0 = ANCHOR_LEVELS[i]
  const L1 = ANCHOR_LEVELS[i + 1]
  const v0 = ANCHOR_MARGINAL_COINS[i]
  const v1 = ANCHOR_MARGINAL_COINS[i + 1]
  if (targetLevel === L0) return v0
  if (targetLevel === L1) return v1
  if (L1 <= L0) return v0
  const t = (targetLevel - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

export function workshopEnhanceOrbSizeMultiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceOrbSizeStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(workshopEnhanceOrbSizeMultiplier(completedLevels))
}

export function workshopEnhanceOrbSizeNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
