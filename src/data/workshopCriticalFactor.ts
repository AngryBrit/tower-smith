/**
 * Workshop **Critical Factor** from `tables/workshop/attack/critical-factor.json`.
 * Displayed value: **(Workshop + Submodule) × Lab × Enhancement** (enhance caps at **×1.25**, first **25** levels).
 */

import {
  workshopToolkitMarginalCoins,
  workshopToolkitStatValue,
} from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL = 150 as const

/** Enhancement levels counted on the workshop Critical Factor card (caps at **×1.25**). */
export const WORKSHOP_DISPLAYED_CRIT_FACTOR_ENHANCE_LEVEL_CAP = 25 as const

/** Enhancement × multiplier for displayed critical factor (0 when locked). */
export function workshopDisplayedCritFactorEnhancementMultiplier(
  enhanceCritFactorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceCritFactorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceCritFactorLevel)),
    WORKSHOP_DISPLAYED_CRIT_FACTOR_ENHANCE_LEVEL_CAP,
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
