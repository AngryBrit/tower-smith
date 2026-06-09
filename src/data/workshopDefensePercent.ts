/**
 * Workshop **Defense %** from `tables/workshop/defense/defense-percent.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'

export const WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL = 99 as const

export function workshopDefensePercentStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Defense Percent', completedLevels)!
}

export function workshopDefensePercentStatDisplay(completedLevels: number): string {
  const pct = workshopDefensePercentStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopDefensePercentNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Defense Percent', completedLevels)
}
