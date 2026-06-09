/**
 * Workshop **Damage**: flat damage per projectile from `tables/workshop/attack/damage.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatCoinAbbrev } from '../labCosts'
import {
  workshopDisplayedDamageFromWorkshopLevel,
  type WorkshopDamageDisplayOpts,
} from './workshopDisplayedDamage'

export type { WorkshopDamageDisplayOpts } from './workshopDisplayedDamage'
export {
  computeWorkshopDisplayedDamage,
  formatWorkshopDisplayedDamageBreakdown,
  workshopDisplayedDamagePerkMultiplier,
} from './workshopDisplayedDamage'

export const WORKSHOP_DAMAGE_MAX_LEVEL = 6000 as const

/** Damage stat after `completedLevels` workshop upgrades (0 … 6000). */
export function workshopDamageStatAtLevel(completedLevels: number): number {
  return workshopToolkitStatValue('Damage', completedLevels)!
}

/**
 * Abbreviated displayed damage (wiki formula when {@link WorkshopDamageDisplayOpts} passed;
 * legacy: a bare `number` is treated as **labMultiplier** only).
 */
export function workshopDamageStatDisplay(
  completedLevels: number,
  opts?: WorkshopDamageDisplayOpts | number,
): string {
  return formatCoinAbbrev(workshopDisplayedDamageFromWorkshopLevel(completedLevels, opts))
}

export function workshopDamageNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Damage', completedLevels)
}
