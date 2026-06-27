/**
 * Build-level **displayed** attack crit stats — Critical Factor, Super Crit Mult, and Super Crit
 * Chance — assembled from the same lab + submodule + relic + enhancement pipeline the Workshop
 * attack cards use. Mirrors {@link workshopDisplayedCriticalFactorValue} but resolves all three
 * crit stats from a single enriched-opts assembly so callers (e.g. ultimate-weapon damage) stay
 * consistent with the displayed workshop cards.
 */

import { buildWorkshopAttackLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichAttackLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { enrichAttackLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { mergeLabOverridesForDisplayedDamage } from './workshopLabOverridesForDamage'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import {
  workshopCriticalFactorDisplayedNumber,
  workshopDisplayedCritFactorEnhancementMultiplier,
} from './workshopCriticalFactor'
import {
  workshopSuperCritMultDisplayedNumber,
  workshopDisplayedSuperCritMultEnhancementMultiplier,
} from './workshopSuperCritMult'
import { workshopSuperCritChancePercent } from './workshopSuperCritChance'
import type { ResearchData } from '../types/research'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export type WorkshopDisplayedAttackCritStats = {
  /** Displayed Tower Critical Factor (e.g. 87.11 → ×87.11). */
  criticalFactor: number
  /** Displayed Super Crit Mult (e.g. 16.7 → ×16.70). */
  superCritMult: number
  /** Displayed Super Crit Chance as a percent (e.g. 24 → 24.00%). */
  superCritChancePercent: number
}

export function workshopDisplayedAttackCritStats(
  workshopPersisted: WorkshopPersistedV1,
  researchData: ResearchData | null | undefined,
  labLevelOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): WorkshopDisplayedAttackCritStats {
  const mergedOverrides =
    researchData != null
      ? mergeLabOverridesForDisplayedDamage(researchData, labLevelOverrides, gameResearchLevel)
      : labLevelOverrides
  const lab = buildWorkshopAttackLabDisplayOpts(researchData, labLevelOverrides)
  const withSubmodules = enrichAttackLabDisplayOptsWithSubmodules(
    lab,
    workshopPersisted.simSubmoduleSelections,
    { ws: workshopPersisted, research: researchData ?? null, labOverrides: mergedOverrides },
  )
  const enriched = enrichAttackLabDisplayOpts(
    withSubmodules,
    new Set(workshopPersisted.relicOwnedIds),
  )
  const enhancementsUnlocked = workshopEnhancementsLabUnlocked(researchData, labLevelOverrides)

  const criticalFactor = workshopCriticalFactorDisplayedNumber(
    workshopPersisted.critFactorLevel,
    enriched?.criticalFactorLabMultiplier,
    enriched?.submodule?.critFactorAdd ?? 0,
    workshopDisplayedCritFactorEnhancementMultiplier(
      workshopPersisted.enhanceCritFactorLevel,
      enhancementsUnlocked,
    ),
    enriched?.criticalFactorRelicMultiplier ?? 1,
  )

  const superCritMult = workshopSuperCritMultDisplayedNumber(
    workshopPersisted.superCritMultLevel,
    enriched?.superCritMultLabMultiplier,
    enriched?.submodule?.superCritMultAdd ?? 0,
    enriched?.superCritMultRelicMultiplier ?? 1,
    workshopDisplayedSuperCritMultEnhancementMultiplier(
      workshopPersisted.enhanceSuperCritMultLevel,
      enhancementsUnlocked,
    ),
  )

  const superCritChancePercent =
    workshopSuperCritChancePercent(workshopPersisted.superCritChanceLevel) +
    (enriched?.superCritChanceLabPercentPoints ?? 0)

  return { criticalFactor, superCritMult, superCritChancePercent }
}
