/**
 * Workshop **Super Crit Mult**: stat and marginal coins from `tables/workshop/attack/super-crit-mult.json`.
 * Displayed value: **((Workshop × Lab) + Submodule) × Relics × Enhancement**. The research **lab**
 * scales only the workshop stat; the flat sub-module bonus is added next; then **relics** and the
 * Super Crit Mult + **enhancement** (0…400 levels) multiply the total.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400Multiplier,
} from './workshopEnhanceTier400Ladder'
export const WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL = 120 as const

/** Enhancement × multiplier for displayed super crit mult (1 when locked). */
export function workshopDisplayedSuperCritMultEnhancementMultiplier(
  enhanceSuperCritMultLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceSuperCritMultLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceSuperCritMultLevel)),
    WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  )
  return workshopEnhanceTier400Multiplier(L, 'Super Crit Mult +')
}

/** Multiplier (1.2 … 13.2) after `completedLevels` purchases (0 … 120). */
export function workshopSuperCritMultValue(completedLevels: number): number {
  return workshopToolkitStatValue('Super Crit Mult', completedLevels)!
}

/** Display like in-game workshop card (`×1.20` … `×13.20`). */
export function workshopSuperCritMultStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
  relicMultiplier = 1,
  enhancementMultiplier = 1,
): string {
  const displayed = workshopSuperCritMultDisplayedNumber(
    completedLevels,
    labMultiplier,
    submoduleAdd,
    relicMultiplier,
    enhancementMultiplier,
  )
  return `×${displayed.toFixed(2)}`
}

/** Numeric form of {@link workshopSuperCritMultStatDisplay} (2-decimal truncated). */
export function workshopSuperCritMultDisplayedNumber(
  completedLevels: number,
  labMultiplier?: number,
  submoduleAdd = 0,
  relicMultiplier = 1,
  enhancementMultiplier = 1,
): number {
  let v = workshopSuperCritMultValue(completedLevels)
  if (labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9) {
    v *= labMultiplier
  }
  v += submoduleAdd
  if (relicMultiplier > 1 + 1e-9) v *= relicMultiplier
  if (enhancementMultiplier > 1 + 1e-9) v *= enhancementMultiplier
  return Math.floor(v * 100 + 1e-9) / 100
}


export function workshopSuperCritMultNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Super Crit Mult', completedLevels)
}
