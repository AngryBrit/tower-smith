/**
 * Workshop **Wall Health**: stat and marginal coins from `tables/workshop/defense/wall-health.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_WALL_HEALTH_MAX_LEVEL = 1800 as const

export function workshopWallHealthStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Wall Health', completedLevels)!
}

export function workshopWallHealthStatDisplay(completedLevels: number): string {
  const pct = workshopWallHealthStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopDisplayedWallHealthEnhancementMultiplier(
  enhanceWallHealthLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceWallHealthLevel <= 0) return 1
  return workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceWallHealthLevel)),
    'Wall Health +',
  )
}

export function workshopWallHealthNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Wall Health', completedLevels)
}
