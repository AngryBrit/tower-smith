/**
 * Shared **400-level** enhancement helpers. Stat values and marginal coins from
 * `tables/workshop/enhancements/`. Decade checkpoints for tests: `workshopEnhanceTier400WikiDecades.ts`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'

export const WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL = 400 as const

export function workshopEnhanceTier400Multiplier(
  completedLevels: number,
  godName: string,
): number {
  return workshopToolkitStatValue(godName, completedLevels)!
}

export function formatWorkshopEnhanceMultiplierDisplay(multiplier: number): string {
  return `x${multiplier.toFixed(2)}`
}

export function workshopEnhanceTier400StatDisplay(
  completedLevels: number,
  godName: string,
): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceTier400Multiplier(completedLevels, godName),
  )
}

export function workshopEnhanceTier400NextMarginalCoins(
  completedLevels: number,
  godName: string,
): number | undefined {
  return workshopToolkitMarginalCoins(godName, completedLevels)
}
