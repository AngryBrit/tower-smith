import { formatCoinAbbrev } from './labCosts'
import type { ResearchData } from './types/research'
import {
  getEffectiveLevel,
  getLevelBounds,
  levelOverrideKey,
  rawDiscountedMarginalCoinAtCurrentLevel,
} from './types/research'

export type SimulatorCoinAggregates = {
  /** Sum of discounted coin costs for upgrades already “bought” in the simulator (all coin labs). */
  spentAll: number
  /** Sum of discounted coin costs from current simulated level to max (labs with a finite max only). */
  toMaxAll: number
  /** Sum of next single-upgrade coin costs for rows that match search, hide-completed, and are not section-collapsed. */
  nextUpgradeVisibleSum: number
}

/**
 * Coin-only budgeting totals from GOD / toolkit marginal costs and the current simulator state.
 * Labs without coin data contribute `0` for missing steps (same gaps as the per-card “—” cost line).
 */
export function computeSimulatorCoinAggregates(
  data: ResearchData,
  levelOverrides: Record<string, number>,
  labsCoinDiscountPercent: number,
  searchQuery: string,
  hideCompleted: boolean,
  collapsed: Record<number, boolean>,
): SimulatorCoinAggregates {
  const q = searchQuery.trim().toLowerCase()

  let spentAll = 0
  let toMaxAll = 0
  let nextUpgradeVisibleSum = 0

  for (let si = 0; si < data.sections.length; si += 1) {
    const sectionCollapsed = Boolean(collapsed[si])
    const section = data.sections[si]
    for (let ii = 0; ii < section.items.length; ii += 1) {
      const item = section.items[ii]

      const bounds = getLevelBounds(item)
      const eff = getEffectiveLevel(si, ii, item, levelOverrides)
      const max = bounds.max

      const matchesSearch =
        q.length === 0 || item.name.toLowerCase().includes(q)
      const effectivelyMaxed = max > 0 && eff >= max
      const passesCompleted = !hideCompleted || !effectivelyMaxed
      const rowMatchesFilters = matchesSearch && passesCompleted
      const visibleForNextSum = rowMatchesFilters && !sectionCollapsed

      const cappedEff = max > 0 ? Math.min(Math.max(0, eff), max) : Math.max(0, eff)

      for (let i = 0; i < cappedEff; i += 1) {
        const c = rawDiscountedMarginalCoinAtCurrentLevel(
          item,
          i,
          max,
          labsCoinDiscountPercent,
        )
        if (c != null) spentAll += c
      }

      if (max > 0) {
        const from = Math.min(Math.max(0, eff), max)
        for (let j = from; j < max; j += 1) {
          const c = rawDiscountedMarginalCoinAtCurrentLevel(
            item,
            j,
            max,
            labsCoinDiscountPercent,
          )
          if (c != null) toMaxAll += c
        }
      }

      if (visibleForNextSum && max > 0 && eff < max) {
        const n = rawDiscountedMarginalCoinAtCurrentLevel(
          item,
          eff,
          max,
          labsCoinDiscountPercent,
        )
        if (n != null) nextUpgradeVisibleSum += n
      }
    }
  }

  return { spentAll, toMaxAll, nextUpgradeVisibleSum }
}

export function formatSimulatorCoinAggregates(a: SimulatorCoinAggregates): {
  spentLabel: string
  toMaxLabel: string
  nextVisibleLabel: string
} {
  return {
    spentLabel: formatCoinAbbrev(a.spentAll),
    toMaxLabel: formatCoinAbbrev(a.toMaxAll),
    nextVisibleLabel: formatCoinAbbrev(a.nextUpgradeVisibleSum),
  }
}

/** Set every visible coin lab row (search / hide-completed / section filters) to its max level. */
export function maxVisibleLabLevels(
  data: ResearchData,
  levelOverrides: Record<string, number>,
  searchQuery: string,
  hideCompleted: boolean,
  collapsed: Record<number, boolean>,
): Record<string, number> {
  const q = searchQuery.trim().toLowerCase()
  const next = { ...levelOverrides }

  for (let si = 0; si < data.sections.length; si += 1) {
    if (collapsed[si]) continue
    const section = data.sections[si]
    for (let ii = 0; ii < section.items.length; ii += 1) {
      const item = section.items[ii]

      const bounds = getLevelBounds(item)
      const max = bounds.max
      if (max <= 0) continue

      const eff = getEffectiveLevel(si, ii, item, levelOverrides)
      const matchesSearch =
        q.length === 0 || item.name.toLowerCase().includes(q)
      const effectivelyMaxed = eff >= max
      const passesCompleted = !hideCompleted || !effectivelyMaxed
      if (!matchesSearch || !passesCompleted) continue

      next[levelOverrideKey(si, ii)] = max
    }
  }

  return next
}
