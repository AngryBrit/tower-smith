/**
 * Workshop **Rend Armor Chance** and **Rend Armor Mult** from `tables/workshop/attack/`.
 *
 * Displayed chance: **(Workshop + Submodule) × Enhancement** (enhancement applies at **half** rate, 0…400 levels).
 * Displayed mult: **((Workshop × Lab) + Submodule) × Relics × Enhancement** (full enhancement, 0…400 levels).
 */

import {
  workshopToolkitMarginalCoins,
  workshopToolkitStatValue,
} from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400Multiplier,
} from './workshopEnhanceTier400Ladder'

export const WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL = 299 as const

/**
 * Enhancement × multiplier for displayed rend armor **chance** (1 when locked).
 * The shared **Rend Armor Max +** enhancement applies to chance at **half** the rate it applies
 * to mult: e.g. level 46 → mult ×1.46, chance ×1.23 (`1 + (×1.46 − 1) / 2`). 0…400 levels.
 */
export function workshopDisplayedRendArmorChanceEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  )
  const fullMultiplier = workshopEnhanceTier400Multiplier(L, 'Rend Armor Max')
  return 1 + (fullMultiplier - 1) / 2
}

export const WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL = 299 as const

/**
 * Enhancement × multiplier for displayed rend armor **mult** (1 when locked).
 * Full **Rend Armor Max +** enhancement (e.g. ×1.46 at level 46), 0…400 levels — same value
 * shown on the enhancement card.
 */
export function workshopDisplayedRendArmorMultEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  )
  return workshopEnhanceTier400Multiplier(L, 'Rend Armor Max')
}

/** Chance percent (0.10 … 30.00) after `completedLevels` purchases (0 … 299). */
export function workshopRendArmorChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Rend Armor Chance', completedLevels)!
}

export function workshopRendArmorChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
  enhancementMultiplier = 1,
): string {
  let pct = workshopRendArmorChancePercent(completedLevels) + extraPercentPoints
  if (enhancementMultiplier > 1 + 1e-9) {
    pct *= enhancementMultiplier
  }
  const displayed = Math.floor(pct * 100 + 1e-9) / 100
  return `${displayed.toFixed(2)}%`
}

/**
 * Extra mult X (0.0010 … 0.3000) after `completedLevels` purchases (0 … 299).
 * GOD `value` is the wiki **Value** column rounded to **2** decimals (`0.00x` … `0.30x`);
 * gameplay uses **0.001 × (level + 1)** (matches L299 **0.3** and per-level **+0.001**).
 */
export function workshopRendArmorMultValue(completedLevels: number): number {
  const L = Math.min(Math.max(0, Math.trunc(completedLevels)), WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL)
  return 0.001 * (L + 1)
}

/** Display like in-game workshop card (`×0.001` … `×0.3`); trims redundant trailing **0** after four decimal places. */
export function workshopRendArmorMultStatDisplay(
  completedLevels: number,
  labMultiplier?: number,
  submodulePercentAdd = 0,
  enhancementMultiplier = 1,
  relicMultiplier = 1,
): string {
  const v = workshopRendArmorMultDisplayedValue(
    completedLevels,
    labMultiplier,
    submodulePercentAdd,
    enhancementMultiplier,
    relicMultiplier,
  )
  return `×${v.toFixed(3)}`
}

/** Numeric mult before formatting (3-decimal rounded for display). */
export function workshopRendArmorMultDisplayedValue(
  completedLevels: number,
  labMultiplier?: number,
  submodulePercentAdd = 0,
  enhancementMultiplier = 1,
  relicMultiplier = 1,
): number {
  let v = workshopRendArmorMultValue(completedLevels)
  if (labMultiplier != null && Number.isFinite(labMultiplier) && labMultiplier > 1 + 1e-9) {
    v = Math.round(v * labMultiplier * 1_000_000) / 1_000_000
  }
  v += submodulePercentAdd / 100
  if (relicMultiplier > 1 + 1e-9) v = Math.round(v * relicMultiplier * 1_000_000) / 1_000_000
  if (enhancementMultiplier > 1 + 1e-9) {
    v = Math.round(v * enhancementMultiplier * 1_000_000) / 1_000_000
  }
  // In-game workshop card rounds to **3** decimals (e.g. **×0.173** at raw **0.172788**).
  return Math.round(v * 1_000) / 1_000
}


export function workshopRendArmorChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Rend Armor Chance', completedLevels)
}

export function workshopRendArmorMultNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Rend Armor Mult', completedLevels)
}
