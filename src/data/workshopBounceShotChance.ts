/**
 * Workshop **Bounce Shot Chance**: **+0.80%** per purchase, **85** purchases → **68.00%**.
 * **Cost** is marginal coins per wiki row (1…85).
 */

export const WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL = 85 as const

const MARGINAL_COINS: readonly number[] = [
  200, 279, 368, 472, 591, 728, 884, 1060, 1260, 1480, 1720, 1990, 2280, 2590, 2940, 3310, 3700, 4130, 4580,
  5060, 5570, 6110, 6680, 7290, 7920, 8580, 9280, 10010, 10780, 11570, 12400, 13270, 14170, 15100, 16070,
  17080, 18120, 19200, 20320, 21470, 22660, 23890, 25150, 26450, 27800, 29180, 30600, 32060, 33560, 35100,
  37780, 39450, 41160, 42910, 44710, 46550, 48430, 50350, 52320, 54330, 56390, 58490, 60640, 62830, 65070,
  67350, 69670, 72050, 74460, 76930, 79440, 82000, 84600, 87260, 89960, 97340, 100270, 103260, 106290,
  109380, 112520, 115700, 118940, 122240, 125580,
]

/** Chance percent (0 … 68) after `completedLevels` purchases (0 … 85). */
export function workshopBounceShotChancePercent(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL)
  return Math.round(L * 0.8 * 100) / 100
}

/** Two decimals + `%` (e.g. `0.80%`, `68.00%`). */
export function workshopBounceShotChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const pct = workshopBounceShotChancePercent(completedLevels) + extraPercentPoints
  return `${pct.toFixed(2)}%`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopBounceShotChanceNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
