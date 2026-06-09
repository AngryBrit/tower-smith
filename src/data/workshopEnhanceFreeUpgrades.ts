/**
 * Utility **Free Upgrades +**: **100** levels, +0.01x per level to x2.00.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL = 100 as const

export function workshopEnhanceFreeUpgradesMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Free Upgrades +', completedLevels)!
}

export function workshopEnhanceFreeUpgradesStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceFreeUpgradesMultiplier(completedLevels),
  )
}

export function workshopEnhanceFreeUpgradesNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Upgrades +', completedLevels)
}
