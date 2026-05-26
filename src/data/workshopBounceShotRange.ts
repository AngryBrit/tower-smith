/**
 * Workshop **Bounce Shot Range**: **2.0m** base, **+0.1m** per purchase, **60** purchases → **8.0m**.
 * Rows **1…40** share the same marginal **Cost** ladder as Bounce Shot Chance; **41…60** use the wiki range ladder.
 */

export const WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL = 60 as const

const MARGINAL_COINS: readonly number[] = [
  200, 279, 368, 472, 591, 728, 884, 1060, 1260, 1480, 1720, 1990, 2280, 2590, 2940, 3310, 3700, 4130, 4580,
  5060, 5570, 6110, 6680, 7290, 7920, 8580, 9280, 10010, 10780, 11570, 12400, 13270, 14170, 15100, 16070,
  17080, 18120, 19200, 20320, 21470, 226580, 238860, 251510, 2650000, 2780000, 2920000, 33660000, 35260000,
  36910000, 424670000, 457100000, 477300000, 5980000000, 6230000000, 77900000000, 81100000000, 84380000000,
  1140000000000, 1190000000000, 1230000000000,
]

/** Range in meters after `completedLevels` purchases (0 … 60). */
export function workshopBounceShotRangeMeters(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL)
  return Math.round((2.0 + 0.1 * L) * 100) / 100
}

/** Display like wiki (`2.00m` … `8.00m`). */
export function workshopBounceShotRangeStatDisplay(
  completedLevels: number,
  submoduleMetersAdd = 0,
): string {
  const m = workshopBounceShotRangeMeters(completedLevels) + submoduleMetersAdd
  return `${m.toFixed(2)}m`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopBounceShotRangeNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
