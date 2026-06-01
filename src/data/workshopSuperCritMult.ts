/**
 * Workshop **Super Crit Mult**: **×1.2** base, **+0.1** per purchase, **120** purchases → **×13.2**.
 * Marginal **Cost** per wiki decade-end rows plus **cumulative Total Cost** milestones; interior
 * of each decade uses an **equal split** of the remaining block spend (matches wiki **Cost** + **Total** at 10/20/…/120).
 */

export const WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL = 120 as const

/** Cumulative coins after `L` completed purchases (`L` ∈ {0,1,10,20,…,120}). */
const CUMULATIVE_BY_LEVEL = new Map<number, number>([
  [0, 0],
  [1, 30_000],
  [10, 3_290_000],
  [20, 70_550_000],
  [30, 779_320_000],
  [40, 4_530_000_000],
  [50, 17_870_000_000],
  [60, 55_900_000_000],
  [70, 144_960_000_000],
  [80, 335_120_000_000],
  [90, 892_710_000_000],
  [100, 4_750_000_000_000],
  [110, 32_460_000_000_000],
  [120, 214_500_000_000_000],
])

/** Wiki **Cost** on rows 10, 20, …, 120 (marginal for purchases ending at those levels). */
const DECADE_END_MARGINAL: readonly number[] = [
  847_800, 17_600_000, 145_090_000, 652_710_000, 2_090_000_000, 5_540_000_000, 12_300_000_000,
  25_760_000_000, 89_880_000_000, 618_840_000_000, 4_370_000_000_000, 28_700_000_000_000,
]

function splitEqual(total: number, count: number): number[] {
  if (count <= 0) return []
  const base = Math.floor(total / count)
  let rem = total - base * count
  const out: number[] = []
  for (let i = 0; i < count; i += 1) {
    out.push(base + (rem > 0 ? 1 : 0))
    if (rem > 0) rem -= 1
  }
  return out
}

function buildMarginalCoins(): readonly number[] {
  const m: number[] = new Array(WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL).fill(0)

  for (let decade = 0; decade < 12; decade += 1) {
    const levelLo = decade === 0 ? 0 : decade * 10
    const levelHi = (decade + 1) * 10
    const c0 = CUMULATIVE_BY_LEVEL.get(levelLo)!
    const c1 = CUMULATIVE_BY_LEVEL.get(levelHi)!
    const blockSum = c1 - c0

    if (decade === 0) {
      m[0] = 30_000
      m[9] = DECADE_END_MARGINAL[0]!
      const mid = splitEqual(blockSum - m[0]! - m[9]!, 8)
      for (let i = 0; i < 8; i += 1) m[1 + i] = mid[i]!
    } else {
      const endIdx = decade * 10 + 9
      m[endIdx] = DECADE_END_MARGINAL[decade]!
      const startIdx = decade * 10
      const mid = splitEqual(blockSum - m[endIdx]!, 9)
      for (let i = 0; i < 9; i += 1) m[startIdx + i] = mid[i]!
    }
  }

  return m
}

const MARGINAL_COINS: readonly number[] = buildMarginalCoins()

/** Multiplier (1.2 … 13.2) after `completedLevels` purchases (0 … 120). */
export function workshopSuperCritMultValue(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL)
  return Math.round((1.2 + 0.1 * L) * 100) / 100
}

/** Display like in-game workshop card (`×1.20` … `×13.20`). */
export function workshopSuperCritMultStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
): string {
  const base = workshopSuperCritMultValue(completedLevels) + submoduleAdd
  const v =
    labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9
      ? base * labMultiplier
      : base
  const displayed = Math.floor(v * 100 + 1e-9) / 100
  return `×${displayed.toFixed(2)}`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopSuperCritMultNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
