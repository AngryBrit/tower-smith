/**
 * Workshop **Free Attack Upgrade**: wiki **Level** 1…99 (**Value** +0.50% per level, marginal **Cost** per row).
 * `completedLevels` = finished purchases (0…99). Next purchase cost is the wiki **Cost** for workshop level `completedLevels + 1`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL = 99 as const

/** Free attack upgrade chance (percent points, e.g. 0.5 for +0.50%) after `completedLevels` purchases. */
export function workshopFreeAttackUpgradeStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Free Attack Upgrade', completedLevels)!
}

export function workshopFreeAttackUpgradeStatDisplay(completedLevels: number): string {
  const pct = workshopFreeAttackUpgradeStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopFreeAttackUpgradeNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Attack Upgrade', completedLevels)
}
