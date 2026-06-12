/**
 * Second chassis module (assist) per hub slot — weaker copy of main module effects.
 */

import {
  sanitizeChassisModuleEffectTier,
  sanitizeChassisModuleMergeTier,
  workshopChassisModuleEffectTier,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import {
  sanitizeChassisModuleId,
  workshopChassisModuleDefForSlot,
  workshopChassisModuleSelection,
  type WorkshopChassisModulePersisted,
  type WorkshopChassisModuleSelection,
} from './workshopChassisModuleSelection'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

/** Max stone efficiency from upgrades (display %). */
export const ASSIST_STONE_EFFICIENCY_MAX = 70
/** Max game level for main/sub stone efficiency (70% → level 69; 1% is free at level 0). */
export const ASSIST_STONE_EFFICIENCY_MAX_LEVEL = ASSIST_STONE_EFFICIENCY_MAX - 1
/** Sub stone (70%) + Assist Module Substats lab (30%). */
export const ASSIST_SUBMODULE_EFFICIENCY_MAX = 100
/** Default game level (1% stone efficiency is free). */
export const ASSIST_STONE_EFFICIENCY_DEFAULT = 0

export const ASSIST_CHASSIS_UNLOCKED_KEY = {
  cannon: 'simCannonAssistUnlocked',
  armor: 'simArmorAssistUnlocked',
  generator: 'simGeneratorAssistUnlocked',
  core: 'simCoreAssistUnlocked',
} as const

export const ASSIST_CHASSIS_MODULE_ID_KEY = {
  cannon: 'simCannonAssistChassisModuleId',
  armor: 'simArmorAssistChassisModuleId',
  generator: 'simGeneratorAssistChassisModuleId',
  core: 'simCoreAssistChassisModuleId',
} as const

export const ASSIST_CHASSIS_MODULE_RARITY_KEY = {
  cannon: 'simCannonAssistChassisModuleRarity',
  armor: 'simArmorAssistChassisModuleRarity',
  generator: 'simGeneratorAssistChassisModuleRarity',
  core: 'simCoreAssistChassisModuleRarity',
} as const

/** Unique-effect tier (unlock panel); separate from equipped module tier on the hub. */
export const ASSIST_UNIQUE_RARITY_KEY = {
  cannon: 'simCannonAssistUniqueRarity',
  armor: 'simArmorAssistUniqueRarity',
  generator: 'simGeneratorAssistUniqueRarity',
  core: 'simCoreAssistUniqueRarity',
} as const

/** @deprecated Legacy single track; migrated to main/sub on read. */
export const ASSIST_STONE_EFFICIENCY_KEY = {
  cannon: 'simCannonAssistStoneEfficiency',
  armor: 'simArmorAssistStoneEfficiency',
  generator: 'simGeneratorAssistStoneEfficiency',
  core: 'simCoreAssistStoneEfficiency',
} as const

export const ASSIST_MAIN_STONE_EFFICIENCY_KEY = {
  cannon: 'simCannonAssistMainStoneEfficiency',
  armor: 'simArmorAssistMainStoneEfficiency',
  generator: 'simGeneratorAssistMainStoneEfficiency',
  core: 'simCoreAssistMainStoneEfficiency',
} as const

export const ASSIST_SUB_STONE_EFFICIENCY_KEY = {
  cannon: 'simCannonAssistSubStoneEfficiency',
  armor: 'simArmorAssistSubStoneEfficiency',
  generator: 'simGeneratorAssistSubStoneEfficiency',
  core: 'simCoreAssistSubStoneEfficiency',
} as const

export type WorkshopAssistChassisPersisted = {
  [K in (typeof ASSIST_CHASSIS_UNLOCKED_KEY)[WorkshopAssistModuleSlot]]: boolean
} & {
  [K in (typeof ASSIST_CHASSIS_MODULE_ID_KEY)[WorkshopAssistModuleSlot]]: string
} & {
  [K in (typeof ASSIST_CHASSIS_MODULE_RARITY_KEY)[WorkshopAssistModuleSlot]]: WorkshopChassisModuleMergeTier
} & {
  [K in (typeof ASSIST_UNIQUE_RARITY_KEY)[WorkshopAssistModuleSlot]]: WorkshopChassisModuleEffectTier
} & {
  [K in (typeof ASSIST_STONE_EFFICIENCY_KEY)[WorkshopAssistModuleSlot]]: number
} & {
  [K in (typeof ASSIST_MAIN_STONE_EFFICIENCY_KEY)[WorkshopAssistModuleSlot]]: number
} & {
  [K in (typeof ASSIST_SUB_STONE_EFFICIENCY_KEY)[WorkshopAssistModuleSlot]]: number
}

/** Assist fields plus main chassis module ids (for duplicate-name checks). */
export type WorkshopAssistChassisModulePersisted = WorkshopAssistChassisPersisted &
  WorkshopChassisModulePersisted

/** Clamp persisted stone-efficiency **level** (0…69). Display % = level + 1. */
export function clampAssistStoneEfficiency(n: number): number {
  if (!Number.isFinite(n)) return ASSIST_STONE_EFFICIENCY_DEFAULT
  return Math.max(0, Math.min(ASSIST_STONE_EFFICIENCY_MAX_LEVEL, Math.trunc(n)))
}

/** Display / scaling percent from persisted game level (first 1% is free at level 0). */
export function assistStoneEfficiencyPercentFromLevel(level: number): number {
  return clampAssistStoneEfficiency(level) + 1
}

/** Sub stone % plus Assist Module Substats lab % (wiki combined cap 100%). */
export function clampAssistSubmoduleEfficiencyPercent(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(ASSIST_SUBMODULE_EFFICIENCY_MAX, Math.trunc(n)))
}

function assistStoneEfficiencyLevelFromLegacyPercent(raw: unknown): number {
  const legacy = Math.trunc(Number(raw))
  if (!Number.isFinite(legacy)) return ASSIST_STONE_EFFICIENCY_DEFAULT
  // Pre-level storage saved display percent (1–70); game level = percent − 1.
  return clampAssistStoneEfficiency(legacy > 0 ? legacy - 1 : 0)
}

export function assistMainStoneEfficiencyFromPersisted(
  ws: WorkshopAssistChassisPersisted,
  slot: WorkshopAssistModuleSlot,
): number {
  const mainKey = ASSIST_MAIN_STONE_EFFICIENCY_KEY[slot]
  const legacyKey = ASSIST_STONE_EFFICIENCY_KEY[slot]
  const rawMain = (ws as Record<string, unknown>)[mainKey]
  if (rawMain != null) {
    return clampAssistStoneEfficiency(Number(rawMain))
  }
  return assistStoneEfficiencyLevelFromLegacyPercent(
    (ws as Record<string, unknown>)[legacyKey],
  )
}

export function assistSubStoneEfficiencyFromPersisted(
  ws: WorkshopAssistChassisPersisted,
  slot: WorkshopAssistModuleSlot,
): number {
  const subKey = ASSIST_SUB_STONE_EFFICIENCY_KEY[slot]
  const legacyKey = ASSIST_STONE_EFFICIENCY_KEY[slot]
  const rawSub = (ws as Record<string, unknown>)[subKey]
  if (rawSub != null) {
    return clampAssistStoneEfficiency(Number(rawSub))
  }
  return assistStoneEfficiencyLevelFromLegacyPercent(
    (ws as Record<string, unknown>)[legacyKey],
  )
}

export function assistUniqueRarityFromPersisted(
  ws: WorkshopAssistChassisPersisted,
  slot: WorkshopAssistModuleSlot,
): WorkshopChassisModuleEffectTier {
  const uniqueKey = ASSIST_UNIQUE_RARITY_KEY[slot]
  const moduleKey = ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]
  const rawUnique = (ws as Record<string, unknown>)[uniqueKey]
  if (rawUnique != null) {
    return sanitizeChassisModuleEffectTier(rawUnique)
  }
  return workshopChassisModuleEffectTier(
    sanitizeChassisModuleMergeTier((ws as Record<string, unknown>)[moduleKey]),
  )
}

export function workshopAssistChassisModuleSelection(
  ws: WorkshopAssistChassisModulePersisted,
  slot: WorkshopAssistModuleSlot,
): WorkshopChassisModuleSelection & {
  unlocked: boolean
  uniqueRarity: WorkshopChassisModuleEffectTier
  /** Persisted game level (0…69); display % = level + 1. */
  mainStoneEfficiency: number
  subStoneEfficiency: number
  mainStoneEfficiencyPercent: number
  subStoneEfficiencyPercent: number
  /** @deprecated Use mainStoneEfficiency */
  stoneEfficiency: number
} {
  const idKey = ASSIST_CHASSIS_MODULE_ID_KEY[slot]
  const rKey = ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]
  const unlocked = ws[ASSIST_CHASSIS_UNLOCKED_KEY[slot]] === true
  const mainStoneEfficiency = assistMainStoneEfficiencyFromPersisted(ws, slot)
  const subStoneEfficiency = assistSubStoneEfficiencyFromPersisted(ws, slot)
  const mainStoneEfficiencyPercent = assistStoneEfficiencyPercentFromLevel(mainStoneEfficiency)
  const subStoneEfficiencyPercent = assistStoneEfficiencyPercentFromLevel(subStoneEfficiency)
  return {
    unlocked,
    uniqueRarity: assistUniqueRarityFromPersisted(ws, slot),
    mainStoneEfficiency,
    subStoneEfficiency,
    mainStoneEfficiencyPercent,
    subStoneEfficiencyPercent,
    stoneEfficiency: mainStoneEfficiency,
    moduleId: unlocked
      ? sanitizeAssistModuleIdAgainstMain(
          ws,
          slot,
          sanitizeChassisModuleId(slot, ws[idKey]),
        )
      : null,
    rarity: sanitizeChassisModuleMergeTier(ws[rKey]),
  }
}

/** True when assist cannot share the same module id as the main chassis module on this slot. */
export function sanitizeAssistModuleIdAgainstMain(
  ws: WorkshopAssistChassisModulePersisted,
  slot: WorkshopAssistModuleSlot,
  assistModuleId: string | null,
): string | null {
  if (assistModuleId == null || assistModuleId === '') return assistModuleId
  if (assistModuleConflictsWithMain(slot, ws, assistModuleId)) return null
  return assistModuleId
}

export function assistModuleConflictsWithMain(
  slot: WorkshopAssistModuleSlot,
  ws: WorkshopAssistChassisModulePersisted,
  assistModuleId: string,
): boolean {
  if (assistModuleId === '') return false
  const main = workshopChassisModuleSelection(ws, slot)
  return main.moduleId != null && main.moduleId === assistModuleId
}

/** True when main selection would duplicate the equipped assist module on this slot. */
export function mainModuleConflictsWithAssist(
  slot: WorkshopAssistModuleSlot,
  ws: WorkshopAssistChassisModulePersisted,
  mainModuleId: string,
): boolean {
  if (mainModuleId === '') return false
  const assist = workshopAssistChassisModuleSelection(ws, slot)
  return assist.unlocked && assist.moduleId != null && assist.moduleId === mainModuleId
}

export function defaultAssistChassisFields(): WorkshopAssistChassisPersisted {
  return {
    simCannonAssistUnlocked: false,
    simArmorAssistUnlocked: false,
    simGeneratorAssistUnlocked: false,
    simCoreAssistUnlocked: false,
    simCannonAssistChassisModuleId: '',
    simArmorAssistChassisModuleId: '',
    simGeneratorAssistChassisModuleId: '',
    simCoreAssistChassisModuleId: '',
    simCannonAssistChassisModuleRarity: 'epic',
    simArmorAssistChassisModuleRarity: 'epic',
    simGeneratorAssistChassisModuleRarity: 'epic',
    simCoreAssistChassisModuleRarity: 'epic',
    simCannonAssistUniqueRarity: 'epic',
    simArmorAssistUniqueRarity: 'epic',
    simGeneratorAssistUniqueRarity: 'epic',
    simCoreAssistUniqueRarity: 'epic',
    simCannonAssistStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simArmorAssistStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simGeneratorAssistStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simCoreAssistStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simCannonAssistMainStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simArmorAssistMainStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simGeneratorAssistMainStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simCoreAssistMainStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simCannonAssistSubStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simArmorAssistSubStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simGeneratorAssistSubStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
    simCoreAssistSubStoneEfficiency: ASSIST_STONE_EFFICIENCY_DEFAULT,
  }
}

export function assistStoneEfficiencyPatch(
  slot: WorkshopAssistModuleSlot,
  track: 'main' | 'sub',
  value: number,
): Partial<WorkshopAssistChassisPersisted> {
  const clamped = clampAssistStoneEfficiency(value)
  const key =
    track === 'main'
      ? ASSIST_MAIN_STONE_EFFICIENCY_KEY[slot]
      : ASSIST_SUB_STONE_EFFICIENCY_KEY[slot]
  const legacyKey = ASSIST_STONE_EFFICIENCY_KEY[slot]
  return {
    [key]: clamped,
    ...(track === 'main' ? { [legacyKey]: clamped } : {}),
  } as Partial<WorkshopAssistChassisPersisted>
}

/** Assist unique-effect efficiency as a fraction (1% → 0.01). */
export function assistChassisEfficiencyFraction(stoneEfficiencyLevel: number): number {
  return assistStoneEfficiencyPercentFromLevel(stoneEfficiencyLevel) / 100
}

export function formatAssistChassisModuleLabel(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
  rarity: WorkshopChassisModuleMergeTier,
): string {
  const def = workshopChassisModuleDefForSlot(slot, moduleId)
  return `${def.name} (${rarity})`
}
