/**
 * Workshop **Rend Armor Chance** and **Rend Armor Mult**: **299** purchases each, shared marginal coin
 * ladder from the wiki (same **Cost** / **Total Cost** columns for both stats).
 *
 * - **Chance**: **0.10%** base + **0.10%** per purchase → **30.00%** at max.
 * - **Mult**: **0.0010X** base + **0.0010X** per purchase → **0.3000X** at max (tower projectiles only in-game).
 *
 * Cumulative totals at milestones **10, 20, …, 299** match wiki **Total Cost**; first purchase **600M**;
 * interior of each segment uses an **equal split** of the remaining block (same pattern as Super Crit Mult).
 *
 * Displayed chance: **(Workshop + Submodule) × Enhancement** when enhancements are unlocked.
 * In-game enhancement on the chance card caps at **+20%** (**×1.20**, first **20** enhance levels).
 *
 * Displayed mult: **(Workshop + Submodule) × Lab × Enhancement**; mult card caps at **+40%** (**×1.40**).
 */

import { workshopEnhanceAttackTierMultiplier } from './workshopEnhanceAttackShared'

export const WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL = 299 as const

/** Enhancement levels counted on the workshop Rend Armor Chance card (caps at **×1.20**). */
export const WORKSHOP_DISPLAYED_REND_ARMOR_CHANCE_ENHANCE_LEVEL_CAP = 20 as const

/** Enhancement × multiplier for displayed rend armor chance (1 when locked). */
export function workshopDisplayedRendArmorChanceEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_DISPLAYED_REND_ARMOR_CHANCE_ENHANCE_LEVEL_CAP,
  )
  return workshopEnhanceAttackTierMultiplier(L)
}

export const WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL = 299 as const

/** Enhancement levels counted on the workshop Rend Armor Mult card (caps at **×1.40**). */
export const WORKSHOP_DISPLAYED_REND_ARMOR_MULT_ENHANCE_LEVEL_CAP = 40 as const

/** Enhancement × multiplier for displayed rend armor mult (1 when locked). */
export function workshopDisplayedRendArmorMultEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_DISPLAYED_REND_ARMOR_MULT_ENHANCE_LEVEL_CAP,
  )
  return workshopEnhanceAttackTierMultiplier(L)
}

/** Milestone levels with known cumulative spend (coins). `C(1)` is implied by the first marginal (600M). */
const CUMULATIVE_BY_LEVEL = new Map<number, bigint>([
  [0, 0n],
  [1, 600_000_000n],
  [10, 6_140_000_000n],
  [20, 12_600_000_000n],
  [30, 19_640_000_000n],
  [40, 28_210_000_000n],
  [50, 53_140_000_000n],
  [60, 96_760_000_000n],
  [70, 175_790_000_000n],
  [80, 322_370_000_000n],
  [90, 843_440_000_000n],
  [100, 1_710_000_000_000n],
  [110, 3_220_000_000_000n],
  [120, 5_530_000_000_000n],
  [130, 16_560_000_000_000n],
  [140, 33_350_000_000_000n],
  [150, 57_060_000_000_000n],
  [160, 95_000_000_000_000n],
  [170, 249_080_000_000_000n],
  [180, 476_960_000_000_000n],
  [190, 801_500_000_000_000n],
  [200, 1_220_000_000_000_000n],
  [210, 2_820_000_000_000_000n],
  [220, 4_840_000_000_000_000n],
  [230, 7_360_000_000_000_000n],
  [240, 10_470_000_000_000_000n],
  [250, 25_680_000_000_000_000n],
  [260, 44_160_000_000_000_000n],
  [270, 66_440_000_000_000_000n],
  [280, 93_100_000_000_000_000n],
  [290, 251_670_000_000_000_000n],
  [299, 418_970_000_000_000_000n],
])

/** Wiki **Cost** on milestone rows (marginal for the purchase that completes that level). */
const MILESTONE_END_MARGINAL = new Map<number, bigint>([
  [1, 600_000_000n],
  [10, 627_210_000n],
  [20, 664_960_000n],
  [30, 748_890_000n],
  [40, 977_400_000n],
  [50, 3_070_000_000n],
  [60, 5_600_000_000n],
  [70, 10_200_000_000n],
  [80, 19_090_000_000n],
  [90, 65_350_000_000n],
  [100, 107_130_000_000n],
  [110, 182_160_000_000n],
  [120, 276_670_000_000n],
  [130, 1_370_000_000_000n],
  [140, 1_960_000_000_000n],
  [150, 2_740_000_000_000n],
  [160, 4_350_000_000_000n],
  [170, 17_500_000_000_000n],
  [180, 27_970_000_000_000n],
  [190, 36_390_000_000_000n],
  [200, 46_700_000_000_000n],
  [210, 177_670_000_000_000n],
  [220, 222_820_000_000_000n],
  [230, 276_640_000_000_000n],
  [240, 340_310_000_000_000n],
  [250, 1_660_000_000_000_000n],
  [260, 2_010_000_000_000_000n],
  [270, 2_410_000_000_000_000n],
  [280, 2_880_000_000_000_000n],
  [290, 17_090_000_000_000_000n],
  [299, 19_830_000_000_000_000n],
])

const MILESTONE_LEVELS: readonly number[] = [
  0, 1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210,
  220, 230, 240, 250, 260, 270, 280, 290, 299,
]

function splitEqualBig(total: bigint, count: number): bigint[] {
  if (count <= 0) return []
  const base = total / BigInt(count)
  let rem = total - base * BigInt(count)
  const out: bigint[] = []
  for (let i = 0; i < count; i += 1) {
    out.push(base + (rem > 0n ? 1n : 0n))
    if (rem > 0n) rem -= 1n
  }
  return out
}

function bigintMarginals(): readonly bigint[] {
  const max = WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL
  const m: bigint[] = new Array(max).fill(0n)

  for (let s = 0; s < MILESTONE_LEVELS.length - 1; s += 1) {
    const a = MILESTONE_LEVELS[s]!
    const b = MILESTONE_LEVELS[s + 1]!
    const c0 = CUMULATIVE_BY_LEVEL.get(a)!
    const c1 = CUMULATIVE_BY_LEVEL.get(b)!
    const blockSum = c1 - c0

    if (a === 0 && b === 1) {
      m[0] = blockSum
      continue
    }

    const lastIdx = b - 1
    const endMarginal = MILESTONE_END_MARGINAL.get(b)!
    m[lastIdx] = endMarginal
    const midCount = lastIdx - a
    const midTotal = blockSum - endMarginal
    const mid = splitEqualBig(midTotal, midCount)
    for (let i = 0; i < midCount; i += 1) {
      m[a + i] = mid[i]!
    }
  }

  return m
}

const MARGINAL_COINS_BIG: readonly bigint[] = bigintMarginals()

const MARGINAL_COINS: readonly number[] = MARGINAL_COINS_BIG.map((x) => Number(x))

/** Chance percent (0.10 … 30.00) after `completedLevels` purchases (0 … 299). */
export function workshopRendArmorChancePercent(completedLevels: number): number {
  const L = Math.min(
    Math.max(0, completedLevels),
    WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
  )
  return Math.round((0.1 + 0.1 * L) * 100) / 100
}

export function workshopRendArmorChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
  enhancementMultiplier = 1,
): string {
  let pct = workshopRendArmorChancePercent(completedLevels) + extraPercentPoints
  if (enhancementMultiplier > 1 + 1e-9) {
    pct *= enhancementMultiplier
  }
  const displayed = Math.floor(pct * 100 + 1e-9) / 100
  return `${displayed.toFixed(2)}%`
}

/** Extra mult X (0.0010 … 0.3000) after `completedLevels` purchases (0 … 299). */
export function workshopRendArmorMultValue(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL)
  return Math.round((0.001 + 0.001 * L) * 1_000_000) / 1_000_000
}

/** Display like in-game workshop card (`×0.001` … `×0.3`); trims redundant trailing **0** after four decimal places. */
export function workshopRendArmorMultStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submodulePercentAdd = 0,
  enhancementMultiplier = 1,
): string {
  let v = workshopRendArmorMultValue(completedLevels) + submodulePercentAdd / 100
  if (labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9) {
    v = Math.round(v * labMultiplier * 1_000_000) / 1_000_000
  }
  if (enhancementMultiplier > 1 + 1e-9) {
    v = Math.round(v * enhancementMultiplier * 1_000_000) / 1_000_000
  }
  // In-game workshop card floors to **3** decimals (e.g. **×0.144**, not **×0.1442**).
  const displayed = Math.floor(v * 1_000 + 1e-9) / 1_000
  const s = displayed.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `×${s}`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopRendArmorChanceNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}

export function workshopRendArmorMultNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  return workshopRendArmorChanceNextMarginalCoins(completedLevels)
}
