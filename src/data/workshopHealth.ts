/**
 * Workshop **Health** (defense): stat and marginal coins from `tables/workshop/defense/health.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_HEALTH_MAX_LEVEL = 6000 as const

/** HP **Value** after `completedLevels` workshop purchases (0 … 6000). */
export function workshopHealthStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Health', completedLevels)!
}

export function workshopHealthStatDisplay(completedLevels: number): string {
  return formatCoinAbbrev(workshopHealthStatValue(completedLevels))
}

export function workshopHealthNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Health', completedLevels)
}
