/**
 * Workshop **Attack speed**: base **1.00**, **+0.05** per level, **99** levels → **5.95**.
 * Marginal coin costs from the published ladder (levels **1…99**).
 * Displayed value uses {@link workshopDisplayedAttackSpeedFromWorkshopLevel} when sim opts are passed.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import {
  workshopDisplayedAttackSpeedFromWorkshopLevel,
  type WorkshopAttackSpeedDisplayOpts,
} from './workshopDisplayedAttackSpeed'

export type { WorkshopAttackSpeedDisplayOpts } from './workshopDisplayedAttackSpeed'
export { computeWorkshopDisplayedAttackSpeed } from './workshopDisplayedAttackSpeed'

export const WORKSHOP_ATTACK_SPEED_MAX_LEVEL = 99 as const

/** Marginal coins for the upgrade that ends at level L (1…99), i.e. wiki **Cost** on row L. */
const MARGINAL_COINS: readonly number[] = [
  30, 56, 92, 140, 200, 274, 363, 467, 588, 725, 879, 1050, 1240, 1450, 1680, 1920, 2190, 2470, 2780,
  3110, 3450, 3820, 4210, 4620, 5060, 5510, 5990, 6490, 7010, 7560, 8130, 8720, 9340, 9980, 10640, 11330,
  12050, 12780, 13550, 14330, 15150, 15980, 16850, 17730, 18650, 19590, 20560, 21550, 22570, 23610, 25430,
  26560, 27720, 28900, 30120, 31360, 32630, 33930, 35260, 36620, 38010, 39420, 40870, 42340, 43840, 45370,
  46940, 48530, 50150, 51800, 53480, 55190, 56930, 58700, 60500, 65450, 67410, 69400, 71420, 73470, 75560,
  77680, 79830, 82010, 84230, 86480, 88760, 91080, 93430, 95810, 98230, 100680, 103170, 105690, 108240,
  110830, 113450, 116110, 118800,
]

/** Multiplier value after `completedLevels` workshop upgrades (0 … 99). */
export function workshopAttackSpeedStatValue(completedLevels: number): number {
  return workshopToolkitStatValue('Attack Speed', completedLevels)!
}

/**
 * Two-decimal display (e.g. `1.05`, `5.95`).
 * With {@link WorkshopAttackSpeedDisplayOpts}, uses the wiki displayed-attack-speed formula.
 */
export function workshopAttackSpeedStatDisplay(
  completedLevels: number,
  opts?: WorkshopAttackSpeedDisplayOpts | number,
): string {
  return workshopDisplayedAttackSpeedFromWorkshopLevel(completedLevels, opts).toFixed(
    2,
  )
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_ATTACK_SPEED_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

/**
 * Coins for the next workshop attack speed upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (99) or out of range.
 */
export function workshopAttackSpeedNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Attack Speed', completedLevels)
}
