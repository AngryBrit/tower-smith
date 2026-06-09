/**
 * Workshop **Wall Rebuild**: stat and marginal coins from `tables/workshop/defense/wall-rebuild.json`.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_WALL_REBUILD_MAX_LEVEL = 300 as const

/** Rebuild time (seconds) with zero workshop purchases (before wiki level 1). */
export const WORKSHOP_WALL_REBUILD_BASE_SECONDS = 1200 as const

/** Rebuild time in seconds at each anchor level (wiki **Value**). */
/** GOD **Value** stores seconds ×1e21 (import parses trailing `s` as septillion suffix). */
const WALL_REBUILD_GOD_VALUE_SCALE = 1e-21

/** Rebuild time (seconds) after `completedLevels` workshop purchases. */
export function workshopWallRebuildStatSeconds(completedLevels: number): number {
  const raw = workshopToolkitStatValue('Wall Rebuild', completedLevels)! * WALL_REBUILD_GOD_VALUE_SCALE
  return Math.round(raw)
}

export function workshopWallRebuildStatDisplay(completedLevels: number): string {
  const sec = workshopWallRebuildStatSeconds(completedLevels)
  return `${sec}s`
}


export function workshopWallRebuildNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Wall Rebuild', completedLevels)
}
