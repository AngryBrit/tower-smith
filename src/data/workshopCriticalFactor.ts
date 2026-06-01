/**
 * Workshop **Critical Factor**: base **1.2×**, **+0.1×** per purchase, **150** purchases → **16.2×**.
 *
 * Wiki **Cost** at milestone levels (1, 10, …, 150) is the marginal coin price for that row.
 * Levels between milestones use **log-linear** interpolation (same approach as workshop damage).
 * Wiki **Total Cost** is abbreviated (e.g. `259.20B`); exact spend uses interpolated marginals.
 *
 * Displayed value: **(Workshop + Submodule) × Lab × Enhancement** when enhancements are unlocked.
 * In-game enhancement on this card caps at **+25%** (**×1.25**, first **25** enhance levels).
 */

import { workshopEnhanceAttackTierMultiplier } from './workshopEnhanceAttackShared'

export const WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL = 150 as const

/** Enhancement levels counted on the workshop Critical Factor card (caps at **×1.25**). */
export const WORKSHOP_DISPLAYED_CRIT_FACTOR_ENHANCE_LEVEL_CAP = 25 as const

/** Enhancement × multiplier for displayed critical factor (0 when locked). */
export function workshopDisplayedCritFactorEnhancementMultiplier(
  enhanceCritFactorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCritFactorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceCritFactorLevel)),
    WORKSHOP_DISPLAYED_CRIT_FACTOR_ENHANCE_LEVEL_CAP,
  )
  return workshopEnhanceAttackTierMultiplier(L)
}

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
]

/** Multiplier after `completedLevels` workshop upgrades (0 … 150). */
export function workshopCriticalFactorStatValue(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL)
  return Math.round((1.2 + 0.1 * L) * 100) / 100
}

/** Display like in-game workshop card (`×1.30` … `×16.20`). */
export function workshopCriticalFactorStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
  enhancementMultiplier = 1,
): string {
  const base = workshopCriticalFactorStatValue(completedLevels) + submoduleAdd
  let v =
    labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9
      ? base * labMultiplier
      : base
  if (enhancementMultiplier > 1 + 1e-9) {
    v *= enhancementMultiplier
  }
  // In-game workshop card truncates to 2 decimals (does not round half up).
  const displayed = Math.floor(v * 100 + 1e-9) / 100
  return `×${displayed.toFixed(2)}`
}

/** Marginal **Cost** at each `ANCHOR_LEVELS` row (exact wiki values). */
const ANCHOR_MARGINAL_COINS: readonly number[] = [
  50, 593, 2280, 5340, 9920, 16150, 24820, 34880, 49210, 63900, 80750, 646_850, 6_280_000, 88_280_000,
  1_410_000_000, 26_240_000_000,
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
  if (targetLevel < 1 || targetLevel > WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL) return undefined
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

/**
 * Coins for the next workshop critical factor upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (150) or out of range.
 */
export function workshopCriticalFactorNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
