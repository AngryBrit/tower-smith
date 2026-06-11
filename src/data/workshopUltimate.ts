/**
 * Workshop **ultimate weapon** upgrades (power stones, wiki Basic Upgrades tables).
 */

import {
  WORKSHOP_ULTIMATE_DAMAGE_UPGRADE_KEYS,
  WORKSHOP_ULTIMATE_TRACKS,
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from './workshopUltimateData'
import {
  formatWorkshopUltimateValue,
  workshopUltimateTrackClampLevel,
  workshopUltimateTrackMaxLevel,
  workshopUltimateTrackNextMarginalStones,
  workshopUltimateTrackStatDisplay,
  workshopUltimateTrackStatValue,
  workshopUltimateTrackTotalStonesToMax,
} from './workshopUltimateTable'

export {
  WORKSHOP_ULTIMATE_TRACKS,
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
}

export function workshopUltimateMaxLevel(key: WorkshopUltimateUpgradeKey): number {
  return workshopUltimateTrackMaxLevel(WORKSHOP_ULTIMATE_TRACKS[key])
}

export function workshopUltimateClampLevel(
  key: WorkshopUltimateUpgradeKey,
  level: number,
): number {
  return workshopUltimateTrackClampLevel(WORKSHOP_ULTIMATE_TRACKS[key], level)
}

export function workshopUltimateNextMarginalStones(
  key: WorkshopUltimateUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopUltimateTrackNextMarginalStones(
    WORKSHOP_ULTIMATE_TRACKS[key],
    completedLevels,
  )
}

export function workshopUltimateStatDisplay(
  key: WorkshopUltimateUpgradeKey,
  completedLevels: number,
  submoduleAdd = 0,
  coreUltimateDamageMultiplier = 1,
): string {
  const track = WORKSHOP_ULTIMATE_TRACKS[key]
  let value = workshopUltimateTrackStatValue(track, completedLevels) + submoduleAdd
  if (
    WORKSHOP_ULTIMATE_DAMAGE_UPGRADE_KEYS.has(key) &&
    coreUltimateDamageMultiplier > 1 + 1e-9
  ) {
    value *= coreUltimateDamageMultiplier
  }
  if (submoduleAdd === 0 && coreUltimateDamageMultiplier <= 1 + 1e-9) {
    return workshopUltimateTrackStatDisplay(track, completedLevels)
  }
  return formatWorkshopUltimateValue(track.valueKind, value)
}

export function workshopUltimateTotalStonesToMaxFrom(
  key: WorkshopUltimateUpgradeKey,
  fromLevel: number,
): number {
  return workshopUltimateTrackTotalStonesToMax(
    WORKSHOP_ULTIMATE_TRACKS[key],
    fromLevel,
  )
}

export function workshopUltimateWeaponUpgradeKeys(
  weaponId: WorkshopUltimateWeaponId,
): readonly WorkshopUltimateUpgradeKey[] {
  return WORKSHOP_ULTIMATE_WEAPON_STATS[weaponId].map((s) => s.key)
}

export function workshopUltimateWeaponAllMaxed(
  levels: Record<WorkshopUltimateUpgradeKey, number>,
  weaponId: WorkshopUltimateWeaponId,
): boolean {
  return workshopUltimateWeaponUpgradeKeys(weaponId).every(
    (key) => levels[key] >= workshopUltimateMaxLevel(key),
  )
}

/** Marginal stone cost to buy the Nth ultimate weapon (1st … 9th). */
export const WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_COSTS = [
  5, 50, 150, 300, 800, 1250, 1750, 2400, 3000,
] as const

export const WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_TOTAL = 9705

export type WorkshopUltimateOwnedKey = `${WorkshopUltimateWeaponId}Owned`

export const WORKSHOP_ULTIMATE_OWNED_ORDER = WORKSHOP_ULTIMATE_WEAPON_ORDER.map(
  (id) => `${id}Owned` as WorkshopUltimateOwnedKey,
)

export function workshopUltimateOwnedKey(
  weaponId: WorkshopUltimateWeaponId,
): WorkshopUltimateOwnedKey {
  return `${weaponId}Owned`
}

function workshopUltimateWeaponHasLegacyPurchase(
  levels: Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  weaponId: WorkshopUltimateWeaponId,
): boolean {
  return workshopUltimateWeaponUpgradeKeys(weaponId).some(
    (key) => Number(levels[key] ?? 0) > 0,
  )
}

/** Whether this ultimate weapon has been bought with power stones. */
export function workshopUltimateWeaponIsOwned(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>> &
    Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  weaponId: WorkshopUltimateWeaponId,
): boolean {
  if (ws[workshopUltimateOwnedKey(weaponId)] === true) return true
  return workshopUltimateWeaponHasLegacyPurchase(ws, weaponId)
}

/** @deprecated Use {@link workshopUltimateWeaponIsOwned}. */
export function workshopUltimateWeaponIsPurchased(
  levels: Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  weaponId: WorkshopUltimateWeaponId,
): boolean {
  return workshopUltimateWeaponIsOwned(levels, weaponId)
}

export function workshopUltimateOwnedCount(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>> &
    Partial<Record<WorkshopUltimateUpgradeKey, number>>,
): number {
  return WORKSHOP_ULTIMATE_WEAPON_ORDER.filter((id) =>
    workshopUltimateWeaponIsOwned(ws, id),
  ).length
}

/** Weapons bought via the unlock button (excludes legacy upgrade-only saves). */
export function workshopUltimateExplicitOwnedCount(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>>,
): number {
  return WORKSHOP_ULTIMATE_WEAPON_ORDER.filter(
    (id) => ws[workshopUltimateOwnedKey(id)] === true,
  ).length
}

/** Stone cost for the next ultimate weapon purchase (null when all 9 owned). */
export function workshopUltimateNextUnlockCost(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>> &
    Partial<Record<WorkshopUltimateUpgradeKey, number>>,
): number | null {
  const count = workshopUltimateOwnedCount(ws)
  if (count >= WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_COSTS.length) return null
  return WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_COSTS[count]!
}

/** Unlock cost for this weapon (null if already owned). */
export function workshopUltimateUnlockCostForWeapon(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>> &
    Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  weaponId: WorkshopUltimateWeaponId,
): number | null {
  if (workshopUltimateWeaponIsOwned(ws, weaponId)) return null
  return workshopUltimateNextUnlockCost(ws)
}

export function workshopUltimateUnlockSpentStones(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>>,
): number {
  const count = workshopUltimateExplicitOwnedCount(ws)
  return WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_COSTS.slice(0, count).reduce(
    (sum, cost) => sum + cost,
    0,
  )
}

export function workshopUltimateUnlockToMaxStones(
  ws: Partial<Record<WorkshopUltimateOwnedKey, boolean>> &
    Partial<Record<WorkshopUltimateUpgradeKey, number>>,
): number {
  const count = workshopUltimateOwnedCount(ws)
  return WORKSHOP_ULTIMATE_WEAPON_UNLOCK_STONE_COSTS.slice(count).reduce(
    (sum, cost) => sum + cost,
    0,
  )
}

export type WorkshopUltimateActiveKey = `${WorkshopUltimateWeaponId}Active`

export const WORKSHOP_ULTIMATE_ACTIVE_ORDER = WORKSHOP_ULTIMATE_WEAPON_ORDER.map(
  (id) => `${id}Active` as WorkshopUltimateActiveKey,
)

export function workshopUltimateActiveKey(
  weaponId: WorkshopUltimateWeaponId,
): WorkshopUltimateActiveKey {
  return `${weaponId}Active`
}

/** Whether this ultimate weapon is toggled on for a run (defaults to active). */
export function workshopUltimateIsActive(
  ws: Partial<Record<WorkshopUltimateActiveKey, boolean>>,
  weaponId: WorkshopUltimateWeaponId,
): boolean {
  return ws[workshopUltimateActiveKey(weaponId)] !== false
}
