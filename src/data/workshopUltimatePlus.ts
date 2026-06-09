/**
 * Ultimate Weapon Plus — unlock order and per-ability upgrade tracks.
 */

import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  type WorkshopUltimateWeaponId,
} from './workshopUltimateData'
import {
  workshopUltimateTrackClampLevel,
  workshopUltimateTrackMaxLevel,
  workshopUltimateTrackNextMarginalStones,
  workshopUltimateTrackStatDisplay,
  workshopUltimateTrackTotalStonesToMax,
} from './workshopUltimateTable'
import { workshopUltimateWeaponIsOwned } from './workshopUltimate'
import {
  ULTIMATE_PLUS_LEVEL_LOCKED,
  ULTIMATE_PLUS_MAX_LEVEL,
  ULTIMATE_PLUS_UNLOCK_COSTS,
  WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER,
  WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON,
  WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER,
  WORKSHOP_ULTIMATE_PLUS_TRACKS,
  WORKSHOP_ULTIMATE_PLUS_WEAPON,
  workshopUltimatePlusLevelKey,
  type WorkshopUltimatePlusAbilityId,
  type WorkshopUltimatePlusLevelKey,
} from './workshopUltimatePlusData'

export {
  ULTIMATE_PLUS_LEVEL_LOCKED,
  ULTIMATE_PLUS_MAX_LEVEL,
  ULTIMATE_PLUS_UNLOCK_COSTS,
  WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON,
  WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER,
  WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER,
  WORKSHOP_ULTIMATE_PLUS_TRACKS,
  WORKSHOP_ULTIMATE_PLUS_WEAPON,
  workshopUltimatePlusLevelKey,
  type WorkshopUltimatePlusAbilityId,
  type WorkshopUltimatePlusLevelKey,
}

export function workshopUltimatePlusAbilityForWeapon(
  weaponId: WorkshopUltimateWeaponId,
): WorkshopUltimatePlusAbilityId {
  return WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON[weaponId]
}

export function workshopUltimatePlusMaxLevel(abilityId: WorkshopUltimatePlusAbilityId): number {
  return workshopUltimateTrackMaxLevel(WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId])
}

export function workshopUltimatePlusClampLevel(
  abilityId: WorkshopUltimatePlusAbilityId,
  level: number,
): number {
  if (!Number.isFinite(level)) return ULTIMATE_PLUS_LEVEL_LOCKED
  const n = Math.trunc(level)
  if (n <= ULTIMATE_PLUS_LEVEL_LOCKED) return ULTIMATE_PLUS_LEVEL_LOCKED
  return Math.max(0, Math.min(workshopUltimatePlusMaxLevel(abilityId), n))
}

export function workshopUltimatePlusIsUnlocked(level: number): boolean {
  return level >= 0
}

export function workshopUltimatePlusUnlockedCount(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
): number {
  let n = 0
  for (const key of WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER) {
    if (workshopUltimatePlusIsUnlocked(Number(levels[key] ?? ULTIMATE_PLUS_LEVEL_LOCKED))) {
      n += 1
    }
  }
  return n
}

export function workshopUltimatePlusNextUnlockCost(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
): number | null {
  const count = workshopUltimatePlusUnlockedCount(levels)
  if (count >= ULTIMATE_PLUS_UNLOCK_COSTS.length) return null
  return ULTIMATE_PLUS_UNLOCK_COSTS[count]!
}

/** All 9 ultimate weapons bought (wiki: unlocked), not necessarily maxed. */
export function workshopAllUltimateWeaponsReadyForPlus(
  ws: Parameters<typeof workshopUltimateWeaponIsOwned>[0],
): boolean {
  return WORKSHOP_ULTIMATE_WEAPON_ORDER.every((weaponId) =>
    workshopUltimateWeaponIsOwned(ws, weaponId),
  )
}

export function workshopUltimatePlusStatLabelId(abilityId: WorkshopUltimatePlusAbilityId): string {
  const weaponId = WORKSHOP_ULTIMATE_PLUS_WEAPON[abilityId]
  return WORKSHOP_ULTIMATE_WEAPON_STATS[weaponId][0]!.stat
}

export function workshopUltimatePlusStatDisplay(
  abilityId: WorkshopUltimatePlusAbilityId,
  level: number,
): string {
  const track = WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId]
  const L = workshopUltimateTrackClampLevel(track, level)
  return workshopUltimateTrackStatDisplay(track, L)
}

export function workshopUltimatePlusNextMarginalStones(
  abilityId: WorkshopUltimatePlusAbilityId,
  level: number,
): number | undefined {
  if (level < 0) return undefined
  const track = WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId]
  const L = workshopUltimateTrackClampLevel(track, level)
  if (L >= workshopUltimatePlusMaxLevel(abilityId)) return undefined
  return workshopUltimateTrackNextMarginalStones(track, L)
}

export function workshopUltimatePlusUnlockSpentStones(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
): number {
  const count = workshopUltimatePlusUnlockedCount(levels)
  let sum = 0
  for (let i = 0; i < count; i++) {
    sum += ULTIMATE_PLUS_UNLOCK_COSTS[i] ?? 0
  }
  return sum
}

export function workshopUltimatePlusUnlockToMaxStones(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
): number {
  const count = workshopUltimatePlusUnlockedCount(levels)
  let sum = 0
  for (let i = count; i < ULTIMATE_PLUS_UNLOCK_COSTS.length; i++) {
    sum += ULTIMATE_PLUS_UNLOCK_COSTS[i] ?? 0
  }
  return sum
}

export function workshopUltimatePlusUpgradeSpentStones(
  abilityId: WorkshopUltimatePlusAbilityId,
  level: number,
): number {
  if (level < 0) return 0
  const track = WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId]
  const L = workshopUltimateTrackClampLevel(track, level)
  const all = workshopUltimateTrackTotalStonesToMax(track, 0)
  const remaining = workshopUltimateTrackTotalStonesToMax(track, L)
  return all - remaining
}

export function workshopUltimatePlusUnlockCostForAbility(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
  abilityId: WorkshopUltimatePlusAbilityId,
): number | null {
  const key = workshopUltimatePlusLevelKey(abilityId)
  if (workshopUltimatePlusIsUnlocked(Number(levels[key] ?? ULTIMATE_PLUS_LEVEL_LOCKED))) {
    return null
  }
  return workshopUltimatePlusNextUnlockCost(levels)
}

export function workshopUltimatePlusTotalStonesToMaxFrom(
  abilityId: WorkshopUltimatePlusAbilityId,
  fromLevel: number,
): number {
  if (fromLevel < 0) return 0
  const track = WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId]
  return workshopUltimateTrackTotalStonesToMax(track, fromLevel)
}

export function workshopUltimatePlusStonesToMaxFromLocked(
  levels: Partial<Record<WorkshopUltimatePlusLevelKey, number>>,
  abilityId: WorkshopUltimatePlusAbilityId,
): number {
  const key = workshopUltimatePlusLevelKey(abilityId)
  const level = Number(levels[key] ?? ULTIMATE_PLUS_LEVEL_LOCKED)
  if (workshopUltimatePlusIsUnlocked(level)) {
    return workshopUltimatePlusTotalStonesToMaxFrom(abilityId, level)
  }
  const unlock = workshopUltimatePlusNextUnlockCost(levels) ?? 0
  return unlock + workshopUltimatePlusTotalStonesToMaxFrom(abilityId, 0)
}

export function defaultUltimatePlusLevels(): Record<WorkshopUltimatePlusLevelKey, number> {
  return Object.fromEntries(
    WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER.map((key) => [key, ULTIMATE_PLUS_LEVEL_LOCKED]),
  ) as Record<WorkshopUltimatePlusLevelKey, number>
}

export function sanitizeUltimatePlusLevel(
  abilityId: WorkshopUltimatePlusAbilityId,
  raw: unknown,
): number {
  return workshopUltimatePlusClampLevel(abilityId, Number(raw))
}

export function workshopUltimatePlusLevelsFromPersisted(
  o: Record<string, unknown>,
): Record<WorkshopUltimatePlusLevelKey, number> {
  const out = defaultUltimatePlusLevels()
  for (const abilityId of WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER) {
    const key = workshopUltimatePlusLevelKey(abilityId)
    if (key in o) {
      out[key] = sanitizeUltimatePlusLevel(abilityId, o[key])
    }
  }
  return out
}
