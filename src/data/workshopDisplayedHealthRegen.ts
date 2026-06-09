/**
 * Wiki **Displayed health regen** (workshop Health Regen card):
 *
 * **Displayed health regen** = Workshop × Health Regen Card × (1 + Relics) × Enhancements.
 *
 * Defense **Health Regen** lab levels affect combat regen but are not shown on this workshop
 * card (calibrated: in-game **31.42B/sec** omits the lab term; **Health** lab still applies to HP).
 *
 * **Relics** sums owned **Health** and **Health Regen** relic % (same as displayed health).
 * **Enhancements** = partial **Health Regen +** tier (calibrated: L60 **×1.6** → **×1.454** enhance term).
 * Armor sub-module **Health Regen [%]** is not folded into this workshop card value.
 *
 * No rounding until `formatCoinAbbrev`.
 */

import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import {
  formatWorkshopHealthRegenPerSec,
  workshopHealthRegenStatValue,
} from './workshopHealthRegen'
import { workshopRelicsDisplayedHealthBonusFraction } from './workshopRelicStats'

export type WorkshopHealthRegenDisplayOpts = {
  healthRegenCardMultiplier?: number
  relicsBonus?: number
  healthRegenEnhancementsMultiplier?: number
}

/**
 * Share of **Health Regen +** enhancement excess in displayed-regen **Enhancements**
 * (calibrated: Regen+ **×1.6** (L60) → **×1.454** with save overlays).
 */
export const WORKSHOP_DISPLAYED_HEALTH_REGEN_REGEN_ENHANCE_EXCESS_FRACTION = 0.45438 / 0.6

/** Partial **Health Regen +** tier when the Workshop Enhancements lab is unlocked. */
export function workshopDisplayedHealthRegenEnhancementMultiplier(
  enhanceHealthRegenLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked) return 1
  const regenMult =
    enhanceHealthRegenLevel > 0
      ? workshopEnhanceTier400Multiplier(
          Math.max(0, Math.trunc(enhanceHealthRegenLevel)),
          'Health Regen +',
        )
      : 1
  if (regenMult <= 1 + 1e-9) return 1
  const regenExcess = Math.max(0, regenMult - 1)
  return 1 + regenExcess * WORKSHOP_DISPLAYED_HEALTH_REGEN_REGEN_ENHANCE_EXCESS_FRACTION
}

export function computeWorkshopDisplayedHealthRegen(
  workshopRegen: number,
  opts: WorkshopHealthRegenDisplayOpts = {},
): number {
  const card = opts.healthRegenCardMultiplier ?? 1
  const relics = 1 + (opts.relicsBonus ?? 0)
  const enhance = opts.healthRegenEnhancementsMultiplier ?? 1
  return workshopRegen * card * relics * enhance
}

export function workshopDisplayedHealthRegenFromWorkshopLevel(
  completedLevels: number,
  opts: WorkshopHealthRegenDisplayOpts = {},
): number {
  return computeWorkshopDisplayedHealthRegen(
    workshopHealthRegenStatValue(completedLevels),
    opts,
  )
}

export function workshopDisplayedHealthRegenStatDisplay(
  completedLevels: number,
  opts: WorkshopHealthRegenDisplayOpts = {},
): string {
  const base = workshopHealthRegenStatValue(completedLevels)
  const card = opts.healthRegenCardMultiplier ?? 1
  const relics = 1 + (opts.relicsBonus ?? 0)
  const enhance = opts.healthRegenEnhancementsMultiplier ?? 1
  const totalMult = card * relics * enhance
  const value = Math.round(base * totalMult)
  const main = formatWorkshopHealthRegenPerSec(value)
  if (base === 0 && totalMult > 1 + 1e-9) {
    return `${main} ×${totalMult.toFixed(2)}`
  }
  return main
}

export function workshopHealthRegenRelicsBonusFraction(
  ownedIds: ReadonlySet<string>,
): number {
  const fraction = workshopRelicsDisplayedHealthBonusFraction(ownedIds)
  return fraction > 0 ? fraction : 0
}
