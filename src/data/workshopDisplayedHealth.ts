/**
 * Wiki **Displayed health** (workshop Health card):
 *
 * **Displayed health** = Workshop × Armor chassis × Health Lab × Health Card × (1 + Relics)
 * × **Health +** enhancement × Submodule.
 *
 * **Health Regen does not affect this card**: workshop **Health Regen** levels, **Health Regen +**
 * enhancement tiers, and **Health Regen +** on the regen card are separate. Relics still sum
 * owned **Health** and **Health Regen** relic % into **(1 + Relics)** (in-game: +67% health
 * + +30% health-regen relics → **×1.97**).
 *
 * **Enhancements** = **Health +** tier only (calibrated: L50 **×1.5**).
 *
 * **Submodule** = partial armor sub-module **Health Regen [%]** (calibrated: 200% submodule with
 * Health+ **×1.5** → game **599.77B** equipped / **138.20B** without chassis).
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
 * (calibrated: 200% submodule with Health+ **×1.5** → **599.77B** / **138.20B** without chassis).
 */
export const WORKSHOP_DISPLAYED_HEALTH_REGEN_SUBMODULE_PERCENT_SHARE = 0.127454363 / 200

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

/** **Health +** tier when the Workshop Enhancements lab is unlocked. **Health Regen +** is omitted. */
export function workshopDisplayedHealthEnhancementMultiplier(
  enhanceHealthLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked) return 1
  if (enhanceHealthLevel <= 0) return 1
  return workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceHealthLevel)),
    'Health +',
  )
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
