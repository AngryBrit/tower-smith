/**
 * Shared constants for **Enemy Attack Level Skip** and **Enemy Health Level Skip**.
 * Unlock **1B** coins after Recovery Packages; max **699** levels.
 */

import { workshopToolkitStatValue } from '../workshopCosts'

export const WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS = 1_000_000_000 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL = 699 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_BASE_PERCENT = 0.05 as const

export const WORKSHOP_ENEMY_LEVEL_SKIP_PERCENT_PER_LEVEL = 0.05 as const

/** @deprecated Use {@link workshopEnemyAttackLevelSkipStatPercent} or health variant. */
export function workshopEnemyLevelSkipStatPercent(completedLevels: number): number {
  return workshopEnemyAttackLevelSkipStatPercent(completedLevels)
}

export function workshopEnemyAttackLevelSkipStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Enemy Attack Level Skip', completedLevels)!
}

export function workshopEnemyHealthLevelSkipStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Enemy Health Level Skip', completedLevels)!
}

export function workshopEnemyAttackLevelSkipStatDisplay(completedLevels: number): string {
  const pct = workshopEnemyAttackLevelSkipStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopEnemyHealthLevelSkipStatDisplay(completedLevels: number): string {
  const pct = workshopEnemyHealthLevelSkipStatPercent(completedLevels)
  return `${pct.toFixed(2)}%`
}

/** @deprecated Use attack/health-specific display helpers. */
export function workshopEnemyLevelSkipStatDisplay(completedLevels: number): string {
  return workshopEnemyAttackLevelSkipStatDisplay(completedLevels)
}

