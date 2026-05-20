/**
 * Assist Modules wiki reference (unlock, stone upgrades, labs).
 */

import {
  ASSIST_STONE_EFFICIENCY_MAX,
  clampAssistStoneEfficiency,
} from './workshopAssistChassisModule'
import type { WorkshopChassisModuleEffectTier } from './workshopChassisModuleShared'

export const ASSIST_SLOT_UNLOCK_STONE_COST = 1000
export const ASSIST_UNIQUE_RARITY_STONE_TOTAL = 4600
export const ASSIST_STONE_EFFICIENCY_MAX_TOTAL = 8073

/** Marginal stone cost to raise main/sub stone efficiency from (n−1)% to n%. */
export function assistStoneEfficiencyMarginalCost(targetPercent: number): number {
  const p = Math.trunc(targetPercent)
  if (p <= 1 || p > ASSIST_STONE_EFFICIENCY_MAX) return 0
  return 9 + 3 * p
}

/** Cumulative stones spent to reach n% stone efficiency (1% costs 0). */
export function assistStoneEfficiencyCumulativeCost(targetPercent: number): number {
  const p = Math.min(
    ASSIST_STONE_EFFICIENCY_MAX,
    Math.max(1, Math.trunc(targetPercent)),
  )
  let sum = 0
  for (let i = 2; i <= p; i += 1) {
    sum += assistStoneEfficiencyMarginalCost(i)
  }
  return sum
}

/** Stones still needed from current % to 70%. */
export function assistStoneEfficiencyStonesToMax(currentPercent: number): number {
  return (
    ASSIST_STONE_EFFICIENCY_MAX_TOTAL -
    assistStoneEfficiencyCumulativeCost(currentPercent)
  )
}

/** Quantity sub-stats use floor, not round (wiki assist modules). */
export function assistFlooredQuantity(
  baseQuantity: number,
  efficiencyPercent: number,
): number {
  const eff = clampAssistStoneEfficiency(efficiencyPercent)
  return Math.floor((baseQuantity * eff) / 100)
}

export type AssistStoneEfficiencyRow = {
  valuePercent: number
  marginalStones: number
  cumulativeStones: number
  stonesToMax: number
}

export const ASSIST_STONE_EFFICIENCY_ROWS: readonly AssistStoneEfficiencyRow[] =
  Array.from({ length: ASSIST_STONE_EFFICIENCY_MAX }, (_, i) => {
    const valuePercent = i + 1
    const cumulativeStones = assistStoneEfficiencyCumulativeCost(valuePercent)
    return {
      valuePercent,
      marginalStones: assistStoneEfficiencyMarginalCost(valuePercent),
      cumulativeStones,
      stonesToMax: ASSIST_STONE_EFFICIENCY_MAX_TOTAL - cumulativeStones,
    }
  })

export type AssistUniqueRarityRow = {
  rarity: WorkshopChassisModuleEffectTier
  stoneCost: number
  cumulativeStones: number
}

export const ASSIST_UNIQUE_RARITY_ROWS: readonly AssistUniqueRarityRow[] = [
  { rarity: 'epic', stoneCost: 1000, cumulativeStones: 1000 },
  { rarity: 'legendary', stoneCost: 1000, cumulativeStones: 2000 },
  { rarity: 'mythic', stoneCost: 1200, cumulativeStones: 3200 },
  { rarity: 'ancestral', stoneCost: 1400, cumulativeStones: 4600 },
]

const ASSIST_UNIQUE_RARITY_ORDER = ASSIST_UNIQUE_RARITY_ROWS.map((r) => r.rarity)

/** Stone cost to raise unique-effect tier from current to the next rarity (null at max). */
export function assistUniqueRarityUpgradeCost(
  current: WorkshopChassisModuleEffectTier,
): number | null {
  const idx = ASSIST_UNIQUE_RARITY_ORDER.indexOf(current)
  if (idx < 0 || idx >= ASSIST_UNIQUE_RARITY_ORDER.length - 1) return null
  const next = ASSIST_UNIQUE_RARITY_ORDER[idx + 1]!
  return ASSIST_UNIQUE_RARITY_ROWS.find((r) => r.rarity === next)?.stoneCost ?? null
}

export function stepAssistUniqueRarity(
  current: WorkshopChassisModuleEffectTier,
  delta: -1 | 1,
): WorkshopChassisModuleEffectTier {
  const idx = ASSIST_UNIQUE_RARITY_ORDER.indexOf(current)
  if (idx < 0) return 'epic'
  const next = Math.max(0, Math.min(ASSIST_UNIQUE_RARITY_ORDER.length - 1, idx + delta))
  return ASSIST_UNIQUE_RARITY_ORDER[next] ?? 'epic'
}

export const WORKSHOP_ASSIST_GLOBAL_INTRO: readonly string[] = [
  'Unlocked as a milestone reward at Tier 19, wave 40.',
  'Spend stones to equip a second module on the same chassis slot — a weaker copy of its unique effect, main effect, and sub-stats. Stone efficiency (main/sub) is upgraded with stones (max 70% from stones) and lab research (Tier 19, wave 50). You cannot equip a module with the same name as the primary module.',
  'Assist module level is separate from the main module; shards unlock sub-stats beyond the first two and higher main effect tiers on the assist copy only.',
  'Quantity sub-stats (e.g. ILM) use floor, not round — ancestral Death Wave +3 quantity needs at least 34% efficiency to add +1 (+0.99 at 33% floors to +0).',
  'Unlocking an assist slot costs 1,000 stones and starts at Epic unique quality with 1% main and sub effect; both can be raised with stones and labs.',
  'As of patch v27.1, all assist module multiplier stats are multiplicative (previously only generator was multiplicative).',
]

export const WORKSHOP_ASSIST_GLOBAL_NOTES: readonly string[] = [
  'Assist effects do not bypass hard caps (98% defense, 90% Chrono Field slow, 150s Wall rebuild, 7s Shockwave frequency, 40% Death Defy, 37s Inner Land Mine CD).',
  'Assist Module Substats and Assist Module Bonus labs add +1% per level each (max 30 per lab, 60% combined per slot when both are maxed).',
]
