/**
 * Workshop **Orb Speed**: wiki **Level** 1…38 (**Value** as multiplier, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…38). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_ORB_SPEED_MAX_LEVEL = 38 as const

/** Wiki **Value** (multiplier) after exactly `level` purchases (`level` = 1…38). */
const WIKI_VALUE_AT_LEVEL: readonly number[] = [
  0.55, 0.7, 0.85, 1.0, 1.15, 1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2, 2.35, 2.5, 2.65, 2.8, 2.95, 3.1, 3.25, 3.4,
  3.55, 3.7, 3.85, 4.0, 4.15, 4.3, 4.45, 4.6, 4.75, 4.9, 5.05, 5.2, 5.35, 5.5, 5.65, 5.8, 5.95, 6.1,
]

const MARGINAL_COST_TO_NEXT_LEVEL: readonly number[] = [
  125, 163, 214, 283, 374, 490, 635, 811, 1020, 1270, 1550, 1870, 2240, 2650, 3110, 3610, 4170, 4770, 5430, 6140,
  6910, 7730, 8610, 9560, 10_560, 11_630, 12_760, 13_950, 15_210, 16_540, 17_930, 19_400, 20_940, 22_550, 24_230,
  25_990, 27_820, 29_730,
]

/** Multiplier **Value** after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopOrbSpeedStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Orb Speed', completedLevels)!
}

/** Two-decimal multiplier string for the workshop card (no `x` prefix). */
export function workshopOrbSpeedStatDisplay(completedLevels: number): string {
  const v = workshopOrbSpeedStatMultiplier(completedLevels)
  return v.toFixed(2)
}

export function workshopOrbSpeedNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Orb Speed', completedLevels)
}
