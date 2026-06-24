/**
 * Workshop **Rend Armor Chance** and **Rend Armor Mult** from `tables/workshop/attack/`.
 *
 * Displayed chance: **(Workshop + Submodule) × Enhancement** (enhance caps at **×1.20**, first **20** levels).
 * Displayed mult: **((Workshop × Lab) + Submodule) × Relics × Enhancement** (enhance caps at **×1.40**, first **40** levels).
 */

import {
  workshopToolkitMarginalCoins,
  workshopToolkitStatValue,
} from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL = 299 as const

/** Enhancement levels counted on the workshop Rend Armor Chance card (caps at **×1.20**). */
export const WORKSHOP_DISPLAYED_REND_ARMOR_CHANCE_ENHANCE_LEVEL_CAP = 20 as const

/** Enhancement × multiplier for displayed rend armor chance (1 when locked). */
export function workshopDisplayedRendArmorChanceEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_DISPLAYED_REND_ARMOR_CHANCE_ENHANCE_LEVEL_CAP,
  )
  return workshopEnhanceTier400Multiplier(L, 'Rend Armor Max')
}

export const WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL = 299 as const

/** Enhancement levels counted on the workshop Rend Armor Mult card (caps at **×1.40**). */
export const WORKSHOP_DISPLAYED_REND_ARMOR_MULT_ENHANCE_LEVEL_CAP = 40 as const

/** Enhancement × multiplier for displayed rend armor mult (1 when locked). */
export function workshopDisplayedRendArmorMultEnhancementMultiplier(
  enhanceRendArmorLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceRendArmorLevel <= 0) return 1
  const L = Math.min(
    Math.max(0, Math.trunc(enhanceRendArmorLevel)),
    WORKSHOP_DISPLAYED_REND_ARMOR_MULT_ENHANCE_LEVEL_CAP,
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
  const s =
    v > 0 && v < 0.01
      ? v.toFixed(3)
      : v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `×${s}`
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
