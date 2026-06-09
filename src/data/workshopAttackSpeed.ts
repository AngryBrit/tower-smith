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


/**
 * Coins for the next workshop attack speed upgrade when `completedLevels` purchases are done.
 * `undefined` when maxed (99) or out of range.
 */
export function workshopAttackSpeedNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Attack Speed', completedLevels)
}
