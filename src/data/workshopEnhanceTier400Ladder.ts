/**
 * Shared **400-level** enhancement coin ladder (+0.01×/level value curve on the wiki **Value**
 * column). Used by Attack tier enhancements and Defense **Health**, **Health Regen**,
 * **Defense Absolute**, and **Wall Health** (identical **Coins** / **Value** tables).
 * **Land Mine Damage** shares the **Coins** ladder with **+0.06×** per level on **Value**.
 * Utility **Cash Bonus +** uses the full ladder; **Recovery Package +** through **L300**.
 * Wiki decade anchors: `workshopEnhanceTier400WikiDecades.ts`.
 */

export const WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL = 400 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390,
  400,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  5e9, 6.53e9, 48.3e9, 313.07e9, 2.54e12, 9.59e12, 60.08e12, 216.08e12, 580.27e12, 1.31e15,
  2.63e15, 4.85e15, 8.36e15, 13.67e15, 21.4e15, 32.31e15, 47.31e15, 67.46e15, 94.01e15,
  128.41e15, 172.31e15, 637.22e15, 1.42e18, 2.59e18, 4.26e18, 6.57e18, 9.7e18, 13.84e18,
  19.23e18, 26.14e18, 34.88e18, 45.82e18, 59.36e18, 75.97e18, 96.16e18, 120.54e18, 149.75e18,
  184.53e18, 225.68e18, 274.11e18, 330.8e18,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

/**
 * Within a wiki decade segment, in-game marginal coins vs plain log-linear `t` vary by
 * anchor ratio and position in the segment.
 */
const COIN_SEGMENT_LERP_T_EXPONENT_BY_SEGMENT: Readonly<Partial<Record<number, number>>> = {
  4: 0.93, // L40–L50 (e.g. Damage + L40→41 ~2.97T)
}

/** L60–L70: flat ~0.9373 matches L61 (~69.65T) but undershoots L63 (~92.14T). */
const COIN_L60_L70_SEGMENT_BASE_EXPONENT = 0.9373
const COIN_L60_L70_SEGMENT_T_SLOPE = -0.1335

/** L10–L20 (ratio ~7.4): exponent rises through the decade. */
const COIN_L10_L20_SEGMENT_BASE_EXPONENT = 1.58
const COIN_L10_L20_SEGMENT_T_SLOPE = 2.3

/** L20–L60 steep decades (ratio ~6–8): base at `t≈0.1`, higher `t` needs larger exponent. */
const COIN_STEEP_SEGMENT_BASE_EXPONENT = 1.225
const COIN_STEEP_SEGMENT_T_SLOPE = 0.136

function coinSegmentLerpTExponent(
  segmentIndex: number,
  t: number,
  v0: number,
  v1: number,
): number {
  const manual = COIN_SEGMENT_LERP_T_EXPONENT_BY_SEGMENT[segmentIndex]
  if (manual != null) return manual

  if (segmentIndex === 6) {
    return COIN_L60_L70_SEGMENT_BASE_EXPONENT + (t - 0.1) * COIN_L60_L70_SEGMENT_T_SLOPE
  }

  const ratio = v1 / v0
  if (segmentIndex === 1) {
    return COIN_L10_L20_SEGMENT_BASE_EXPONENT + (t - 0.1) * COIN_L10_L20_SEGMENT_T_SLOPE
  }
  if (ratio < 4) return ratio >= 3.5 ? 0.94 : 0.93
  if (ratio >= 8) return 1
  if (ratio >= 6) return COIN_STEEP_SEGMENT_BASE_EXPONENT + (t - 0.1) * COIN_STEEP_SEGMENT_T_SLOPE
  return 1
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1] < level) i += 1
  return i
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  const maxL = ANCHOR_LEVELS[ANCHOR_LEVELS.length - 1]!
  if (targetLevel < 1 || targetLevel > maxL) return undefined
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
  const curvedT = Math.pow(t, coinSegmentLerpTExponent(i, t, v0, v1))
  return logLerp(v0, v1, curvedT)
}

/** Multiplier after `completedLevels` purchases: `1 + incrementPerLevel × level`. */
export function workshopEnhanceTier400Multiplier(
  completedLevels: number,
  maxLevel: number = WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  incrementPerLevel = 0.01,
  roundHundredth = true,
): number {
  const L = Math.min(Math.max(0, completedLevels), maxLevel)
  const raw = 1 + incrementPerLevel * L
  return roundHundredth ? Math.round(raw * 100) / 100 : raw
}

/** Workshop Enhance tab **Value** label (wiki **x1.00** style, matches main workshop labs). */
export function formatWorkshopEnhanceMultiplierDisplay(multiplier: number): string {
  return `x${multiplier.toFixed(2)}`
}

export function workshopEnhanceTier400StatDisplay(
  completedLevels: number,
  maxLevel: number = WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  incrementPerLevel = 0.01,
): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceTier400Multiplier(completedLevels, maxLevel, incrementPerLevel),
  )
}

export function workshopEnhanceTier400NextMarginalCoins(
  completedLevels: number,
  maxLevel: number = WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= maxLevel) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
