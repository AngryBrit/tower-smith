/**
 * Utility **Coin Bonus +** / **Cells/Kill Bonus**: stat from `tables/workshop/enhancements/utility/`.
 */

import { workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL = 200 as const

export function workshopEnhanceUtilityTier200Multiplier(
  completedLevels: number,
  godName: string,
): number {
  return workshopToolkitStatValue(godName, completedLevels)!
}

export function workshopEnhanceUtilityTier200StatDisplay(
  completedLevels: number,
  godName: string,
): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceUtilityTier200Multiplier(completedLevels, godName),
  )
}

