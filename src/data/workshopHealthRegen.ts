/**
 * Workshop **Health Regen** (defense): stat and marginal coins from `tables/workshop/defense/health-regen.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'

export const WORKSHOP_HEALTH_REGEN_MAX_LEVEL = 6000 as const

export function workshopHealthRegenStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Health Regen', completedLevels)!
}

/** Workshop card **Value** (HP regen per second; in-game uses a `/sec` suffix). */
export function formatWorkshopHealthRegenPerSec(n: number): string {
  return `${formatCoinAbbrev(n)}/sec`
}

export function workshopHealthRegenStatDisplay(
  completedLevels: number,
  dissonanceMultiplier = 1,
): string {
  const base = workshopHealthRegenStatValue(completedLevels)
  const scaled =
    dissonanceMultiplier !== 1 && Number.isFinite(dissonanceMultiplier)
      ? Math.round(base * dissonanceMultiplier)
      : base
  return formatWorkshopHealthRegenPerSec(scaled)
}

export function workshopHealthRegenNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Health Regen', completedLevels)
}
