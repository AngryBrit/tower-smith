/**
 * Workshop **Thorn Damage** (Garlic Thorns): wiki **Level** 1…99 (**Value** +1.00% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopPercentDisplay } from './workshopLabDisplayHelpers'
export const WORKSHOP_THORN_DAMAGE_MAX_LEVEL = 99 as const

/** Thorn damage bonus % after `completedLevels` purchases (whole percent points, e.g. 1 for +1.00%). */
export function workshopThornDamageStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Thorns', completedLevels)!
}

export function workshopThornDamageStatDisplay(completedLevels: number): string {
  return formatWorkshopPercentDisplay(workshopThornDamageStatPercentPoints(completedLevels))
}

export function workshopThornDamageNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Thorns', completedLevels)
}
