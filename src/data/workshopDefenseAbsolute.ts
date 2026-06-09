/**
 * Workshop **Defense Absolute**: stat and marginal coins from `tables/workshop/defense/defense-absolute.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL = 5000 as const

export function workshopDefenseAbsoluteStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Defense Absolute', completedLevels)!
}

export function workshopDefenseAbsoluteStatDisplay(completedLevels: number): string {
  return formatCoinAbbrev(workshopDefenseAbsoluteStatValue(completedLevels))
}

export function workshopDefenseAbsoluteNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Defense Absolute', completedLevels)
}
