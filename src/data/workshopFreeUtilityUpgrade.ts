/**
 * Workshop **Free Utility Upgrade**: wiki **Level** 1…99 (**Value** +0.50% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL = 99 as const


/** Free utility upgrade chance (percent points, e.g. 0.5 for +0.50%) after `completedLevels` purchases. */
export function workshopFreeUtilityUpgradeStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Free Utility Upgrade', completedLevels)!
}

export function workshopFreeUtilityUpgradeStatDisplay(completedLevels: number): string {
  const pct = workshopFreeUtilityUpgradeStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopFreeUtilityUpgradeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Utility Upgrade', completedLevels)
}
