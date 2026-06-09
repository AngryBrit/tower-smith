/**
 * Workshop **Land Mine Damage**: stat and marginal coins from `tables/workshop/defense/land-mine-damage.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL = 200 as const

export function workshopLandMineDamageStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Damage', completedLevels)!
}

export function formatWorkshopLandMineDamageMultiplier(mult: number): string {
  return `x${mult.toFixed(1)}`
}

export function workshopLandMineDamageStatDisplay(completedLevels: number): string {
  return formatWorkshopLandMineDamageMultiplier(workshopLandMineDamageStatPercent(completedLevels))
}

export function workshopDisplayedLandMineDamageEnhancementMultiplier(
  enhanceLandMineDamageLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceLandMineDamageLevel <= 0) return 1
  return workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceLandMineDamageLevel)),
    'Land Mine Damage +',
  )
}

export function workshopLandMineDamageNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Damage', completedLevels)
}
