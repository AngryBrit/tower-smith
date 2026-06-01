/**
 * Workshop **Multishot chance**: **99** upgrades, **+0.5%** per level → **49.5%** max.
 * Marginal **Cost** from the published ladder (wiki **Cost** per row).
 */

export const WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL = 99 as const

const MARGINAL_COINS: readonly number[] = [
  60, 103, 156, 220, 299, 392, 501, 627, 770, 932, 1110, 1310, 1540, 1780, 2040, 2330, 2640, 2970,
  3320, 3700, 4100, 4530, 4980, 5450, 5960, 6490, 7040, 7620, 8230, 8860, 9530, 10220, 10940, 11680,
  12460, 13260, 14100, 14960, 15850, 16770, 17730, 18710, 19720, 20770, 21840, 22950, 24090, 25260,
  26460, 27700, 29830, 31170, 32540, 33950, 35390, 36860, 38370, 39910, 41490, 43100, 44750, 46440,
  48160, 49910, 51710, 53530, 55400, 57300, 59240, 61210, 63220, 65270, 67360, 69480, 71650, 77540,
  79890, 82280, 84710, 87180, 89620, 92240, 94830, 97490, 100140, 102860, 105610, 108410, 111250,
  114140, 117060, 120030, 123040, 126090, 129190, 132320, 135510, 138730, 142000,
]

/** Chance percent (0 … 49.5) after `completedLevels` purchases (0 … 99). */
export function workshopMultishotChancePercent(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL)
  return Math.round(L * 5) / 10
}

/** Display with two decimals to match in-game workshop UI (e.g. `56.50%`). */
export function workshopMultishotChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const pct = workshopMultishotChancePercent(completedLevels) + extraPercentPoints
  return `${pct.toFixed(2)}%`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopMultishotChanceNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
