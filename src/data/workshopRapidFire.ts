/**
 * Workshop **Rapid Fire**: shared marginal **Cost** ladder for **Chance** (levels 1…85) and **Duration** (1…99).
 * Rows **1…85** match both wiki tables; rows **86…99** apply to duration only.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL = 85 as const
export const WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL = 99 as const

/** Chance percent (0 … 34) after `completedLevels` purchases (0 … 85). */
export function workshopRapidFireChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Rapid Fire Chance', completedLevels)!
}

/** Two decimals + `%` (e.g. `0.40%`, `34.00%`). */
export function workshopRapidFireChanceStatDisplay(
  completedLevels: number,
  extraPercentPoints = 0,
): string {
  const pct = workshopRapidFireChancePercent(completedLevels) + extraPercentPoints
  return `${pct.toFixed(2)}%`
}


export function workshopRapidFireChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Rapid Fire Chance', completedLevels)
}

/** GOD **Value** stores seconds ×1e21 (import parses trailing `s` as septillion suffix). */
const RAPID_FIRE_DURATION_GOD_VALUE_SCALE = 1e-21

/** Duration in seconds after `completedLevels` purchases (0 … 99). */
export function workshopRapidFireDurationSeconds(completedLevels: number): number {
  const raw =
    workshopToolkitStatValue('Rapid Fire Duration', completedLevels)! *
    RAPID_FIRE_DURATION_GOD_VALUE_SCALE
  return Math.round(raw * 100) / 100
}

/** Display like wiki (`0.65 sec` … `5.55 sec`). */
export function workshopRapidFireDurationStatDisplay(
  completedLevels: number,
  submoduleSecondsAdd = 0,
): string {
  const sec = workshopRapidFireDurationSeconds(completedLevels) + submoduleSecondsAdd
  return `${sec.toFixed(2)} sec`
}

export function workshopRapidFireDurationNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Rapid Fire Duration', completedLevels)
}
