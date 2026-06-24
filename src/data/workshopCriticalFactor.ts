/**
 * Workshop **Critical Factor** from `tables/workshop/attack/critical-factor.json`.
 * Displayed value: **(Workshop + Submodule) × Lab × Enhancement** (full Critical Factor +
 * enhancement, 0…400 levels, e.g. ×1.43 at level 43 — same multiplier as the enhancement card).
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

export function workshopCriticalFactorNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Critical Factor', completedLevels)
}

/**
 * Displayed **Tower Critical Factor** multiplier from the player's build, matching the
 * in-game / workshop-card value: workshop card level (+ submodule add) × Critical Factor
 * lab × relics × enhancement (caps at ×1.25, first 25 levels). Truncated to 2 decimals.
 * Mirrors the pipeline used by the Workshop page's Critical Factor card.
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
  const submoduleAdd = enriched?.submodule?.critFactorAdd ?? 0
  const enhancementMultiplier = workshopDisplayedCritFactorEnhancementMultiplier(
    workshopPersisted.enhanceCritFactorLevel,
    workshopEnhancementsLabUnlocked(researchData, labLevelOverrides),
  )
  const base = workshopCriticalFactorStatValue(workshopPersisted.critFactorLevel) + submoduleAdd
  let v =
    labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9
      ? base * labMultiplier
      : base
  if (enhancementMultiplier > 1 + 1e-9) {
    v *= enhancementMultiplier
  }
  return Math.floor(v * 100 + 1e-9) / 100
}
