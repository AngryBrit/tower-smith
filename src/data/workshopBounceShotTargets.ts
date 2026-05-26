/**
 * Workshop **Bounce Shot Targets**: base **1** bounce target; **+1** per purchase, **7** purchases → **8** targets.
 * Wiki **Cost** is marginal coins per row (1…7). Perk cap (14) is not modeled here.
 */

export const WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL = 7 as const

const MARGINAL_COINS: readonly number[] = [700, 3000, 12000, 25000, 80000, 200000, 650000]

/** Total bounce targets (1 … 8) after `completedLevels` workshop purchases (0 … 7). */
export function workshopBounceShotTargetsCount(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL)
  return 1 + L
}

export function workshopBounceShotTargetsStatDisplay(
  completedLevels: number,
  extraCount = 0,
): string {
  return String(workshopBounceShotTargetsCount(completedLevels) + extraCount)
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopBounceShotTargetsNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
