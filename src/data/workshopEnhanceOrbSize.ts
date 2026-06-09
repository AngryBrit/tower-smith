/**
 * Workshop **Orb Size** defense enhancement: **200** levels, **+0.01×** per level → **×3.00**.
 * Dedicated coin ladder (wiki **Coins** at decade milestones, log-linear between).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL = 200 as const


export function workshopEnhanceOrbSizeMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Orb Size', completedLevels)!
}

export function workshopEnhanceOrbSizeStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(workshopEnhanceOrbSizeMultiplier(completedLevels))
}

export function workshopEnhanceOrbSizeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Orb Size', completedLevels)
}
