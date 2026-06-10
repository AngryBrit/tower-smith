import { formatCoinAbbrev } from './labCosts'
import { compareLabLevelOverrides, formatSignedCoinDelta } from './labCompare'
import type { LabCompareDiffRow } from './labCompare'
import { workshopDisplayedDamageFromPersisted } from './data/workshopDisplayedDamage'
import { workshopEnhancementsLabUnlocked } from './data/workshopEnhanceResearch'
import type { WorkshopPersistedV1 } from './labPresetsStorage'
import type { ResearchData } from './types/research'
import {
  resolveEnhancementAttackDiscountPercent,
  resolveEnhancementDefenseDiscountPercent,
  resolveEnhancementUtilityDiscountPercent,
  resolveWorkshopAttackDiscountPercent,
  resolveWorkshopDefenseDiscountPercent,
  resolveWorkshopUtilityDiscountPercent,
} from './types/research'
import type { TowerThemesSnapshot } from './towerDataThemes'
import {
  computeWorkshopCoinAggregates,
  type WorkshopCoinDiscountOpts,
} from './workshopBudgetAggregates'

export const BUILD_COMPARE_TOP_LAB_DIFFS = 8

export type BuildCompareSummary = {
  displayedDamageA: number
  displayedDamageB: number
  displayedDamageALabel: string
  displayedDamageBLabel: string
  displayedDamageDeltaLabel: string
  workshopSpentA: number
  workshopSpentB: number
  workshopSpentALabel: string
  workshopSpentBLabel: string
  workshopCoinDeltaLabel: string
  topLabDiffs: LabCompareDiffRow[]
  relicsOnlyA: string[]
  relicsOnlyB: string[]
  themesOnlyA: string[]
  themesOnlyB: string[]
}

function workshopCoinDiscountOptsFromLabs(
  data: ResearchData,
  labOverrides: Record<string, number>,
): WorkshopCoinDiscountOpts {
  const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
  return {
    attackDiscountPercent: resolveWorkshopAttackDiscountPercent(data, labOverrides),
    defenseDiscountPercent: resolveWorkshopDefenseDiscountPercent(data, labOverrides),
    utilityDiscountPercent: resolveWorkshopUtilityDiscountPercent(data, labOverrides),
    enhancementAttackDiscountPercent: resolveEnhancementAttackDiscountPercent(
      data,
      labOverrides,
    ),
    enhancementDefenseDiscountPercent: resolveEnhancementDefenseDiscountPercent(
      data,
      labOverrides,
    ),
    enhancementUtilityDiscountPercent: resolveEnhancementUtilityDiscountPercent(
      data,
      labOverrides,
    ),
    workshopEnhancementsLabUnlocked: enhancementsUnlocked,
  }
}

function symmetricSetDiff(a: readonly string[], b: readonly string[]): {
  onlyA: string[]
  onlyB: string[]
} {
  const setA = new Set(a)
  const setB = new Set(b)
  const onlyA: string[] = []
  const onlyB: string[] = []
  for (const id of setA) {
    if (!setB.has(id)) onlyA.push(id)
  }
  for (const id of setB) {
    if (!setA.has(id)) onlyB.push(id)
  }
  onlyA.sort()
  onlyB.sort()
  return { onlyA, onlyB }
}

/** Signed percent change (B − A) / A; non-finite → em dash label. */
export function formatBuildStatPercentDelta(a: number, b: number): string {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return '—'
  if (a === 0 && b === 0) return '0%'
  if (a === 0) return b > 0 ? '+∞' : '0%'
  const pct = ((b - a) / a) * 100
  if (Math.abs(pct) < 0.05) return '0%'
  const sign = pct > 0 ? '+' : '−'
  return `${sign}${Math.abs(pct).toFixed(1)}%`
}

export function computeBuildCompareSummary(
  data: ResearchData,
  overridesA: Record<string, number>,
  workshopA: WorkshopPersistedV1,
  overridesB: Record<string, number>,
  workshopB: WorkshopPersistedV1,
  themesA?: TowerThemesSnapshot,
  themesB?: TowerThemesSnapshot,
): BuildCompareSummary {
  const lab = compareLabLevelOverrides(data, overridesA, overridesB)
  const wsSpentA = computeWorkshopCoinAggregates(
    workshopA,
    workshopCoinDiscountOptsFromLabs(data, overridesA),
  ).spentAll
  const wsSpentB = computeWorkshopCoinAggregates(
    workshopB,
    workshopCoinDiscountOptsFromLabs(data, overridesB),
  ).spentAll

  const displayedDamageA = workshopDisplayedDamageFromPersisted(
    workshopA,
    data,
    overridesA,
  )
  const displayedDamageB = workshopDisplayedDamageFromPersisted(
    workshopB,
    data,
    overridesB,
  )

  const topLabDiffs = [...lab.diffRows]
    .sort(
      (x, y) =>
        Math.abs(y.levelB - y.levelA) - Math.abs(x.levelB - x.levelA) ||
        x.sectionIndex - y.sectionIndex ||
        x.itemIndex - y.itemIndex,
    )
    .slice(0, BUILD_COMPARE_TOP_LAB_DIFFS)

  const relicDiff = symmetricSetDiff(
    workshopA.relicOwnedIds ?? [],
    workshopB.relicOwnedIds ?? [],
  )
  const themeDiff = symmetricSetDiff(
    themesA?.ownedIds ?? [],
    themesB?.ownedIds ?? [],
  )

  return {
    displayedDamageA,
    displayedDamageB,
    displayedDamageALabel: formatCoinAbbrev(displayedDamageA),
    displayedDamageBLabel: formatCoinAbbrev(displayedDamageB),
    displayedDamageDeltaLabel: formatBuildStatPercentDelta(
      displayedDamageA,
      displayedDamageB,
    ),
    workshopSpentA: wsSpentA,
    workshopSpentB: wsSpentB,
    workshopSpentALabel: formatCoinAbbrev(wsSpentA),
    workshopSpentBLabel: formatCoinAbbrev(wsSpentB),
    workshopCoinDeltaLabel: formatSignedCoinDelta(wsSpentB - wsSpentA),
    topLabDiffs,
    relicsOnlyA: relicDiff.onlyA,
    relicsOnlyB: relicDiff.onlyB,
    themesOnlyA: themeDiff.onlyA,
    themesOnlyB: themeDiff.onlyB,
  }
}
