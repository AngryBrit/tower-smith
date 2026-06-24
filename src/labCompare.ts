import { computeSimulatorCoinAggregates } from './labBudgetAggregates'
import { formatCoinAbbrev } from './labCosts'
import type { ResearchData } from './types/research'
import { getEffectiveLevel, resolveLabsCoinDiscountPercent } from './types/research'

const NO_SEARCH = ''
const NO_HIDE_COMPLETED = false
const NO_COLLAPSED: Record<number, boolean> = {}

export type LabCompareDiffRow = {
  sectionIndex: number
  itemIndex: number
  name: string
  sectionTitle: string
  levelA: number
  levelB: number
}

export type LabCompareResult = {
  diffRows: LabCompareDiffRow[]
  differingCount: number
  spentA: number
  spentB: number
  coinDeltaBMinusA: number
  spentALabel: string
  spentBLabel: string
  coinDeltaLabel: string
}

/** Abbreviated coin with sign (B − A); non-finite → em dash. */
export function formatSignedCoinDelta(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '0'
  const sign = n > 0 ? '+' : '−'
  return `${sign}${formatCoinAbbrev(Math.abs(n))}`
}

/**
 * Diff effective simulated levels and coin “spent” totals (same rules as the budget panel;
 * each side uses its own implied Labs Coin Discount %).
 */
export function compareLabLevelOverrides(
  data: ResearchData,
  overridesA: Record<string, number>,
  overridesB: Record<string, number>,
): LabCompareResult {
  const discountA = resolveLabsCoinDiscountPercent(data, overridesA)
  const discountB = resolveLabsCoinDiscountPercent(data, overridesB)
  const spentA = computeSimulatorCoinAggregates(
    data,
    overridesA,
    discountA,
    NO_SEARCH,
    NO_HIDE_COMPLETED,
    NO_COLLAPSED,
  ).spentAll
  const spentB = computeSimulatorCoinAggregates(
    data,
    overridesB,
    discountB,
    NO_SEARCH,
    NO_HIDE_COMPLETED,
    NO_COLLAPSED,
  ).spentAll
  const coinDeltaBMinusA = spentB - spentA

  const diffRows: LabCompareDiffRow[] = []
  for (let si = 0; si < data.sections.length; si += 1) {
    const section = data.sections[si]
    for (let ii = 0; ii < section.items.length; ii += 1) {
      const item = section.items[ii]
      const effA = getEffectiveLevel(si, ii, item, overridesA)
      const effB = getEffectiveLevel(si, ii, item, overridesB)
      if (effA === effB) continue
      diffRows.push({
        sectionIndex: si,
        itemIndex: ii,
        name: item.name,
        sectionTitle: section.title,
        levelA: effA,
        levelB: effB,
      })
    }
  }

  return {
    diffRows,
    differingCount: diffRows.length,
    spentA,
    spentB,
    coinDeltaBMinusA,
    spentALabel: formatCoinAbbrev(spentA),
    spentBLabel: formatCoinAbbrev(spentB),
    coinDeltaLabel: formatSignedCoinDelta(coinDeltaBMinusA),
  }
}
