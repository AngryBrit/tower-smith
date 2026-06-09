/**
 * Workshop **Damage / Meter**: **200** levels, base **0%** (multiplier **0**), max **5.9%** (**0.059**).
 * Stat **0…70**: log-linear between published milestone **Value** rows; **71…200**: **+0.0002** per level
 * from the L=70 anchor (**0.033**).
 * **Cost**: milestone marginals from the wiki; log-linear between milestones (same pattern as Critical Factor).
 * Workshop UI shows **`x1 / m`** … **`x1.059 / m`** (baseline **×1** per meter plus the wiki bonus as **1 + Value**).
 * Attack **Damage / Meter** research lab adds a **fraction** of **(labMult − 1)** to this card
 * (not the full damage-style × lab used in combat).
 */
/**
 * Share of the attack DPM lab excess shown on the workshop ×/m card.
 * Calibrated: workshop DPM **+5.5%** (L180) + lab **×1.28** (L14) → in-game **×1.1429 / m**.
 */
import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION = 0.0879 / (1.28 - 1)

export const WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL = 200 as const

/** Milestone levels for the curved part of the stat (wiki **Value**). */
const STAT_ANCHOR_LEVELS: readonly number[] = [1, 10, 20, 30, 40, 50, 60, 70]

/** Multiplier values at `STAT_ANCHOR_LEVELS` (wiki **Value** without the `x`). */
const STAT_ANCHOR_MULT: readonly number[] = [
  0.00079, 0.00742, 0.01376, 0.01913, 0.02365, 0.02741, 0.0305, 0.033,
]

const COST_ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
]

/** Marginal **Cost** at each `COST_ANCHOR_LEVELS` row (exact wiki). */
const COST_ANCHOR_MARGINAL: readonly number[] = [
  50, 691, 2780, 6630, 12_460, 20_430, 31_590, 44_590, 63_150, 82_270, 104_250, 558_080, 3_390_000,
  27_320_000, 193_700_000, 1_360_000_000, 10_930_000_000, 75_200_000_000, 621_080_000_000,
  4_210_000_000_000, 28_360_000_000_000,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndexStat(level: number): number {
  if (level <= STAT_ANCHOR_LEVELS[0]) return 0
  let i = 0
  while (i < STAT_ANCHOR_LEVELS.length - 1 && STAT_ANCHOR_LEVELS[i + 1] < level) i += 1
  return i
}

function segmentIndexCost(level: number): number {
  if (level <= COST_ANCHOR_LEVELS[0]) return 0
  let i = 0
  while (i < COST_ANCHOR_LEVELS.length - 1 && COST_ANCHOR_LEVELS[i + 1] < level) i += 1
  return i
}

/** GOD **Value** is bonus ×1000 (e.g. **59** → **0.059** bonus → **×1.059 / m** display). */
const DAMAGE_PER_METER_GOD_VALUE_SCALE = 1 / 1000

/** Damage/meter multiplier after `completedLevels` workshop purchases (0 … 200). */
export function workshopDamagePerMeterStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Damage - Meter', completedLevels)! * DAMAGE_PER_METER_GOD_VALUE_SCALE
}

/**
 * Additive **Damage / Meter** research lab bonus for the workshop ×/m card (not full × lab).
 */
export function workshopDamagePerMeterResearchLabDisplayAdd(
  damagePerMeterLabMultiplier: number | undefined,
): number {
  if (
    damagePerMeterLabMultiplier == null ||
    !Number.isFinite(damagePerMeterLabMultiplier) ||
    damagePerMeterLabMultiplier <= 1 + 1e-9
  ) {
    return 0
  }
  return (damagePerMeterLabMultiplier - 1) * WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION
}

function formatDamagePerMeterMultiplier(n: number): string {
  // In-game baseline is **×1.000 / m**; higher levels use up to four decimals (e.g. **×1.1429 / m**).
  if (Math.abs(n - 1) < 1e-9) return 'x1.000'
  const s = n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return `x${s}`
}

/**
 * Workshop card: effective multiplier on damage **per meter** vs baseline (**×1** at Lv.0),
 * wiki-style **`x1.00079 / m`** … **`x1.059 / m`** plus partial Attack **Damage / Meter** lab.
 * Sub-module **Damage / Meter [m]** is not shown on this card in-game (combat only).
 */
export function workshopDamagePerMeterStatDisplay(
  completedLevels: number,
  damagePerMeterLabMultiplier?: number,
): string {
  const workshopBonus = workshopDamagePerMeterStatMultiplier(completedLevels)
  const labAdd = workshopDamagePerMeterResearchLabDisplayAdd(damagePerMeterLabMultiplier)
  const n = 1 + workshopBonus + labAdd
  return `${formatDamagePerMeterMultiplier(n)} / m`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL) return undefined
  if (targetLevel === COST_ANCHOR_LEVELS[0]) return COST_ANCHOR_MARGINAL[0]

  const i = segmentIndexCost(targetLevel)
  const L0 = COST_ANCHOR_LEVELS[i]
  const L1 = COST_ANCHOR_LEVELS[i + 1]
  const v0 = COST_ANCHOR_MARGINAL[i]
  const v1 = COST_ANCHOR_MARGINAL[i + 1]
  if (targetLevel === L0) return v0
  if (targetLevel === L1) return v1
  if (L1 <= L0) return v0
  const t = (targetLevel - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

/**
 * Coins for the next workshop damage/meter upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (200) or out of range.
 */
export function workshopDamagePerMeterNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Damage - Meter', completedLevels)
}
