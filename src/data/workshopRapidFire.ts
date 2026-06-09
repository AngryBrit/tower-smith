/**
 * Workshop **Rapid Fire**: shared marginal **Cost** ladder for **Chance** (levels 1…85) and **Duration** (1…99).
 * Rows **1…85** match both wiki tables; rows **86…99** apply to duration only.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL = 85 as const
export const WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL = 99 as const

/** Marginal coins for upgrade ending at workshop level L (1…99). Rows 1…85 are shared with Rapid Fire Chance. */
const MARGINAL_COINS: readonly number[] = [
  120, 183, 257, 343, 444, 560, 693, 845, 1010, 1200, 1410, 1650, 1900, 2170, 2470, 2790, 3140, 3510, 3900,
  4320, 4760, 5230, 5730, 6250, 6810, 7380, 7990, 8630, 9290, 9980, 10700, 11450, 12240, 13050, 13890, 14760,
  15660, 16600, 17560, 18560, 19590, 20650, 21750, 22870, 24030, 25230, 26460, 27720, 29010, 30340, 32650,
  34090, 35570, 37080, 38630, 40210, 41830, 43490, 45190, 46920, 48690, 50500, 52340, 54230, 56150, 58110,
  60110, 62150, 64220, 66340, 68500, 70690, 72930, 75200, 77520, 83860, 86380, 88940, 91540, 94180, 96870,
  99600, 102370, 105190, 108050, 110950, 113900, 116900, 119930, 123020, 126140, 129310, 132530, 135790,
  139100, 142450, 145850, 149300, 152790,
]

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

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
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

/** Display like wiki (`0.65s` … `5.55s`). */
export function workshopRapidFireDurationStatDisplay(
  completedLevels: number,
  submoduleSecondsAdd = 0,
): string {
  const sec = workshopRapidFireDurationSeconds(completedLevels) + submoduleSecondsAdd
  return `${sec.toFixed(2)}s`
}

export function workshopRapidFireDurationNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Rapid Fire Duration', completedLevels)
}
