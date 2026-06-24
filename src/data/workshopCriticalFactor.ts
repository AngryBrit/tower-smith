/**
 * Workshop **Critical Factor** from `tables/workshop/attack/critical-factor.json`.
 * Displayed value: **((Workshop × Lab) + Submodule) × Relics × Enhancement**. The research **lab**
 * scales only the workshop-derived stat; the flat sub-module bonus is added next; then **relics**
 * and the Critical Factor + **enhancement** (0…400 levels, e.g. ×1.43 at level 43) multiply the total.
 */

import {
  workshopToolkitMarginalCoins,
  workshopToolkitStatValue,
} from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400Multiplier,
} from './workshopEnhanceTier400Ladder'
import { buildWorkshopAttackLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { enrichAttackLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { enrichAttackLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { mergeLabOverridesForDisplayedDamage } from './workshopLabOverridesForDamage'
import type { ResearchData } from '../types/research'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export const WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL = 150 as const

/** Enhancement × multiplier for displayed critical factor (1 when locked). */
export function workshopDisplayedCritFactorEnhancementMultiplier(
  enhanceCritFactorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCritFactorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceCritFactorLevel)),
    WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  )
  return workshopEnhanceTier400Multiplier(L, 'Critical Factor +')
}

/** Multiplier after `completedLevels` workshop upgrades (0 … 150). */
export function workshopCriticalFactorStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Critical Factor', completedLevels)!
}

/**
 * In-game workshop card value: **((Workshop × Lab) + Submodule) × Relics × Enhancement**.
 * The lab scales only the workshop stat; the flat sub-module add comes next; then relics and
 * enhancement multiply the total.
 */
export function workshopCriticalFactorStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
  enhancementMultiplier = 1,
  relicMultiplier = 1,
): string {
  const displayed = workshopCriticalFactorDisplayedNumber(
    completedLevels,
    labMultiplier,
    submoduleAdd,
    enhancementMultiplier,
    relicMultiplier,
  )
  return `×${displayed.toFixed(2)}`
}

/** Numeric form of {@link workshopCriticalFactorStatDisplay} (2-decimal truncated). */
export function workshopCriticalFactorDisplayedNumber(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
  enhancementMultiplier = 1,
  relicMultiplier = 1,
): number {
  let v = workshopCriticalFactorStatValue(completedLevels)
  if (labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9) {
    v *= labMultiplier
  }
  v += submoduleAdd
  if (relicMultiplier > 1 + 1e-9) v *= relicMultiplier
  if (enhancementMultiplier > 1 + 1e-9) v *= enhancementMultiplier
  // In-game workshop card truncates to 2 decimals (does not round half up).
  return Math.floor(v * 100 + 1e-9) / 100
}

export function workshopCriticalFactorNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Critical Factor', completedLevels)
}

/**
 * Displayed **Tower Critical Factor** multiplier from the player's build, matching the
 * in-game / workshop-card value: **((Workshop × Lab) + Submodule) × Relics × Enhancement**.
 * Truncated to 2 decimals. Mirrors the Workshop page's Critical Factor card.
 */
export function workshopDisplayedCriticalFactorValue(
  workshopPersisted: WorkshopPersistedV1,
  researchData: ResearchData | null | undefined,
  labLevelOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
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
  const labMultiplier = enriched?.criticalFactorLabMultiplier
  const relicMultiplier = enriched?.criticalFactorRelicMultiplier ?? 1
  const submoduleAdd = enriched?.submodule?.critFactorAdd ?? 0
  const enhancementMultiplier = workshopDisplayedCritFactorEnhancementMultiplier(
    workshopPersisted.enhanceCritFactorLevel,
    workshopEnhancementsLabUnlocked(researchData, labLevelOverrides),
  )
  return workshopCriticalFactorDisplayedNumber(
    workshopPersisted.critFactorLevel,
    labMultiplier,
    submoduleAdd,
    enhancementMultiplier,
    relicMultiplier,
  )
}
