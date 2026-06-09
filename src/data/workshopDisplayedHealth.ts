/**
 * Wiki **Displayed health** (workshop Health card):
 *
 * **Displayed health** = Workshop × Armor chassis × Health Lab × Health Card × (1 + Relics)
 * × Enhancements.
 *
 * **Enhancements** = **Health +** lab tier + a fraction of **Health Regen +** excess
 * (calibrated: Health+ **×1.5** + Health Regen+ **×1.6** → **×1.687** enhance term).
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
}

/**
 * Share of **Health Regen +** enhancement excess in displayed-health **Enhancements**
 * (calibrated: Health+ **×1.5** + Health Regen+ **×1.6** → **×1.687**).
 */
export const WORKSHOP_DISPLAYED_HEALTH_REGEN_ENHANCE_EXCESS_FRACTION = 0.18675 / 0.6

/** **Health +** tier plus partial **Health Regen +** excess when unlocked. */
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
  const regenExcess = Math.max(0, regenMult - 1)
  return (
    healthMult +
    regenExcess * WORKSHOP_DISPLAYED_HEALTH_REGEN_ENHANCE_EXCESS_FRACTION
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
  return workshop * lab * card * relics * enhance
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
