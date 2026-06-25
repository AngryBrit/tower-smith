/**
 * Wiki **Displayed health** (workshop Health card):
 *
 * **Displayed health** = Workshop × Armor chassis × Health Lab × Health Card × (1 + Relics)
 * × Enhancements × Submodule.
 *
 * **Enhancements** = **Health +** × **Health Regen +** tier multipliers (calibrated: L50/L60
 * **×1.5** × **×1.6** → **×2.40** enhance term).
 *
 * **Submodule** = partial armor sub-module **Health Regen [%]** (calibrated: 200% submodule with
 * the enhance term above → game **870.57B**).
 *
 * **Relics** sums owned **Health** and **Health Regen** relic % (like displayed damage).
 * No rounding until `formatCoinAbbrev`.
 */

import { formatCoinAbbrev } from '../labCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import { workshopHealthStatValue } from './workshopHealth'
import { workshopRelicsDisplayedHealthBonusFraction } from './workshopRelicStats'

export type WorkshopHealthDisplayOpts = {
  armorTowerHealthMultiplier?: number
  healthLabMultiplier?: number
  healthCardMultiplier?: number
  relicsBonus?: number
  healthEnhancementsMultiplier?: number
  /** Armor sub-module **Health Regen [%]** percent points. */
  submoduleHealthRegenPercentBonus?: number
}

/**
 * Share of armor sub-module **Health Regen [%]** in displayed health
 * (calibrated: 200% submodule with Health+ **×1.5** × Health Regen+ **×1.6** → **870.57B**).
 */
export const WORKSHOP_DISPLAYED_HEALTH_REGEN_SUBMODULE_PERCENT_SHARE = 0.02281656 / 200

/** Partial armor sub-module **Health Regen [%]** when equipped on the armor module. */
export function workshopDisplayedHealthSubmoduleMultiplier(
  healthRegenSubmodulePercentBonus?: number,
): number {
  if (
    healthRegenSubmodulePercentBonus == null ||
    !Number.isFinite(healthRegenSubmodulePercentBonus) ||
    healthRegenSubmodulePercentBonus <= 0
  ) {
    return 1
  }
  return (
    1 +
    healthRegenSubmodulePercentBonus *
      WORKSHOP_DISPLAYED_HEALTH_REGEN_SUBMODULE_PERCENT_SHARE
  )
}

/** **Health +** × **Health Regen +** tiers when the Workshop Enhancements lab is unlocked. */
export function workshopDisplayedHealthEnhancementMultiplier(
  enhanceHealthLevel: number,
  enhanceHealthRegenLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked) return 1
  const healthMult =
    enhanceHealthLevel > 0
      ? workshopEnhanceTier400Multiplier(
          Math.max(0, Math.trunc(enhanceHealthLevel)),
          'Health +',
        )
      : 1
  const regenMult =
    enhanceHealthRegenLevel > 0
      ? workshopEnhanceTier400Multiplier(
          Math.max(0, Math.trunc(enhanceHealthRegenLevel)),
          'Health Regen +',
        )
      : 1
  if (healthMult <= 1 + 1e-9 && regenMult <= 1 + 1e-9) return 1
  return healthMult * regenMult
}

export function computeWorkshopDisplayedHealth(
  workshopHealth: number,
  opts: WorkshopHealthDisplayOpts = {},
): number {
  const workshop = workshopHealth * (opts.armorTowerHealthMultiplier ?? 1)
  const lab = opts.healthLabMultiplier ?? 1
  const card = opts.healthCardMultiplier ?? 1
  const relics = 1 + (opts.relicsBonus ?? 0)
  const enhance = opts.healthEnhancementsMultiplier ?? 1
  const submodule = workshopDisplayedHealthSubmoduleMultiplier(
    opts.submoduleHealthRegenPercentBonus,
  )
  return workshop * lab * card * relics * enhance * submodule
}

export function workshopDisplayedHealthFromWorkshopLevel(
  completedLevels: number,
  opts: WorkshopHealthDisplayOpts = {},
): number {
  return computeWorkshopDisplayedHealth(workshopHealthStatValue(completedLevels), opts)
}

export function workshopDisplayedHealthStatDisplay(
  completedLevels: number,
  opts: WorkshopHealthDisplayOpts = {},
): string {
  return formatCoinAbbrev(workshopDisplayedHealthFromWorkshopLevel(completedLevels, opts))
}

export function workshopHealthRelicsBonusFraction(
  ownedIds: ReadonlySet<string>,
): number {
  const fraction = workshopRelicsDisplayedHealthBonusFraction(ownedIds)
  return fraction > 0 ? fraction : 0
}
