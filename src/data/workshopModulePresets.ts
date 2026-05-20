/**
 * Five module loadout presets (hub levels, chassis, assist, sub-modules).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { clampAssistStoneEfficiency, defaultAssistChassisFields } from './workshopAssistChassisModule'
import {
  sanitizeChassisModuleEffectTier,
  sanitizeChassisModuleMergeTier,
  workshopChassisModuleEffectTier,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

/** @deprecated Use WorkshopChassisModuleMergeTier */
export type WorkshopChassisModuleRarity = WorkshopChassisModuleMergeTier
import {
  cannonSubmoduleAttackSpeedFromSelections,
  defaultWorkshopSubmoduleSelections,
  parseSubmoduleSelectionsJson,
  sanitizeSubmoduleSelections,
  type WorkshopSubmoduleSelections,
} from './workshopSubmoduleSelection'
import {
  clampWorkshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from './workshopSimModules'

export const WORKSHOP_MODULE_PRESET_COUNT = 5 as const

export type WorkshopModulePresetSnapshot = {
  simAssistModuleSlot: WorkshopAssistModuleSlot
  simCannonModuleLevel: number
  simArmorModuleLevel: number
  simGeneratorModuleLevel: number
  simCoreModuleLevel: number
  simCannonChassisModuleId: string
  simArmorChassisModuleId: string
  simGeneratorChassisModuleId: string
  simCoreChassisModuleId: string
  simCannonChassisModuleRarity: WorkshopChassisModuleMergeTier
  simArmorChassisModuleRarity: WorkshopChassisModuleMergeTier
  simGeneratorChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCoreChassisModuleRarity: WorkshopChassisModuleMergeTier
  simSubmoduleSelections: WorkshopSubmoduleSelections
  simAttackSpeedModuleSubEffect: number
  simCannonAssistUnlocked: boolean
  simArmorAssistUnlocked: boolean
  simGeneratorAssistUnlocked: boolean
  simCoreAssistUnlocked: boolean
  simCannonAssistChassisModuleId: string
  simArmorAssistChassisModuleId: string
  simGeneratorAssistChassisModuleId: string
  simCoreAssistChassisModuleId: string
  simCannonAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simArmorAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simGeneratorAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCoreAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCannonAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simArmorAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simGeneratorAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simCoreAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simCannonAssistStoneEfficiency: number
  simArmorAssistStoneEfficiency: number
  simGeneratorAssistStoneEfficiency: number
  simCoreAssistStoneEfficiency: number
  simCannonAssistMainStoneEfficiency: number
  simArmorAssistMainStoneEfficiency: number
  simGeneratorAssistMainStoneEfficiency: number
  simCoreAssistMainStoneEfficiency: number
  simCannonAssistSubStoneEfficiency: number
  simArmorAssistSubStoneEfficiency: number
  simGeneratorAssistSubStoneEfficiency: number
  simCoreAssistSubStoneEfficiency: number
}

export function clampWorkshopModuleActivePresetIndex(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_MODULE_PRESET_COUNT - 1, Math.trunc(n)))
}

function sanitizeAssistModuleSlot(raw: unknown): WorkshopAssistModuleSlot {
  return raw === 'armor' || raw === 'generator' || raw === 'core' ? raw : 'cannon'
}


function attackSpeedFromSubmoduleSelections(
  selections: WorkshopSubmoduleSelections,
): number {
  return cannonSubmoduleAttackSpeedFromSelections(selections.cannon)
}

export function defaultWorkshopModulePresetSnapshot(): WorkshopModulePresetSnapshot {
  const assist = defaultAssistChassisFields()
  return {
    simAssistModuleSlot: 'cannon',
    simCannonModuleLevel: 0,
    simArmorModuleLevel: 0,
    simGeneratorModuleLevel: 0,
    simCoreModuleLevel: 0,
    simCannonChassisModuleId: '',
    simArmorChassisModuleId: '',
    simGeneratorChassisModuleId: '',
    simCoreChassisModuleId: '',
    simCannonChassisModuleRarity: 'epic',
    simArmorChassisModuleRarity: 'epic',
    simGeneratorChassisModuleRarity: 'epic',
    simCoreChassisModuleRarity: 'epic',
    simSubmoduleSelections: defaultWorkshopSubmoduleSelections(),
    simAttackSpeedModuleSubEffect: 0,
    simCannonAssistUnlocked: assist.simCannonAssistUnlocked,
    simArmorAssistUnlocked: assist.simArmorAssistUnlocked,
    simGeneratorAssistUnlocked: assist.simGeneratorAssistUnlocked,
    simCoreAssistUnlocked: assist.simCoreAssistUnlocked,
    simCannonAssistChassisModuleId: assist.simCannonAssistChassisModuleId,
    simArmorAssistChassisModuleId: assist.simArmorAssistChassisModuleId,
    simGeneratorAssistChassisModuleId: assist.simGeneratorAssistChassisModuleId,
    simCoreAssistChassisModuleId: assist.simCoreAssistChassisModuleId,
    simCannonAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      assist.simCannonAssistChassisModuleRarity,
    ),
    simArmorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      assist.simArmorAssistChassisModuleRarity,
    ),
    simGeneratorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      assist.simGeneratorAssistChassisModuleRarity,
    ),
    simCoreAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      assist.simCoreAssistChassisModuleRarity,
    ),
    simCannonAssistUniqueRarity: sanitizeChassisModuleEffectTier(assist.simCannonAssistUniqueRarity),
    simArmorAssistUniqueRarity: sanitizeChassisModuleEffectTier(assist.simArmorAssistUniqueRarity),
    simGeneratorAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      assist.simGeneratorAssistUniqueRarity,
    ),
    simCoreAssistUniqueRarity: sanitizeChassisModuleEffectTier(assist.simCoreAssistUniqueRarity),
    simCannonAssistStoneEfficiency: assist.simCannonAssistStoneEfficiency,
    simArmorAssistStoneEfficiency: assist.simArmorAssistStoneEfficiency,
    simGeneratorAssistStoneEfficiency: assist.simGeneratorAssistStoneEfficiency,
    simCoreAssistStoneEfficiency: assist.simCoreAssistStoneEfficiency,
    simCannonAssistMainStoneEfficiency: assist.simCannonAssistMainStoneEfficiency,
    simArmorAssistMainStoneEfficiency: assist.simArmorAssistMainStoneEfficiency,
    simGeneratorAssistMainStoneEfficiency: assist.simGeneratorAssistMainStoneEfficiency,
    simCoreAssistMainStoneEfficiency: assist.simCoreAssistMainStoneEfficiency,
    simCannonAssistSubStoneEfficiency: assist.simCannonAssistSubStoneEfficiency,
    simArmorAssistSubStoneEfficiency: assist.simArmorAssistSubStoneEfficiency,
    simGeneratorAssistSubStoneEfficiency: assist.simGeneratorAssistSubStoneEfficiency,
    simCoreAssistSubStoneEfficiency: assist.simCoreAssistSubStoneEfficiency,
  }
}

export function defaultModulePresetSnapshots(): WorkshopModulePresetSnapshot[] {
  const empty = defaultWorkshopModulePresetSnapshot()
  return Array.from({ length: WORKSHOP_MODULE_PRESET_COUNT }, () => ({
    ...empty,
    simSubmoduleSelections: defaultWorkshopSubmoduleSelections(),
  }))
}

export function extractWorkshopModulePresetSnapshot(
  ws: WorkshopPersistedV1,
): WorkshopModulePresetSnapshot {
  return {
    simAssistModuleSlot: ws.simAssistModuleSlot,
    simCannonModuleLevel: ws.simCannonModuleLevel,
    simArmorModuleLevel: ws.simArmorModuleLevel,
    simGeneratorModuleLevel: ws.simGeneratorModuleLevel,
    simCoreModuleLevel: ws.simCoreModuleLevel,
    simCannonChassisModuleId: ws.simCannonChassisModuleId,
    simArmorChassisModuleId: ws.simArmorChassisModuleId,
    simGeneratorChassisModuleId: ws.simGeneratorChassisModuleId,
    simCoreChassisModuleId: ws.simCoreChassisModuleId,
    simCannonChassisModuleRarity: ws.simCannonChassisModuleRarity,
    simArmorChassisModuleRarity: ws.simArmorChassisModuleRarity,
    simGeneratorChassisModuleRarity: ws.simGeneratorChassisModuleRarity,
    simCoreChassisModuleRarity: ws.simCoreChassisModuleRarity,
    simSubmoduleSelections: sanitizeSubmoduleSelections(ws.simSubmoduleSelections),
    simAttackSpeedModuleSubEffect: ws.simAttackSpeedModuleSubEffect,
    simCannonAssistUnlocked: ws.simCannonAssistUnlocked,
    simArmorAssistUnlocked: ws.simArmorAssistUnlocked,
    simGeneratorAssistUnlocked: ws.simGeneratorAssistUnlocked,
    simCoreAssistUnlocked: ws.simCoreAssistUnlocked,
    simCannonAssistChassisModuleId: ws.simCannonAssistChassisModuleId,
    simArmorAssistChassisModuleId: ws.simArmorAssistChassisModuleId,
    simGeneratorAssistChassisModuleId: ws.simGeneratorAssistChassisModuleId,
    simCoreAssistChassisModuleId: ws.simCoreAssistChassisModuleId,
    simCannonAssistChassisModuleRarity: ws.simCannonAssistChassisModuleRarity,
    simArmorAssistChassisModuleRarity: ws.simArmorAssistChassisModuleRarity,
    simGeneratorAssistChassisModuleRarity: ws.simGeneratorAssistChassisModuleRarity,
    simCoreAssistChassisModuleRarity: ws.simCoreAssistChassisModuleRarity,
    simCannonAssistUniqueRarity: ws.simCannonAssistUniqueRarity,
    simArmorAssistUniqueRarity: ws.simArmorAssistUniqueRarity,
    simGeneratorAssistUniqueRarity: ws.simGeneratorAssistUniqueRarity,
    simCoreAssistUniqueRarity: ws.simCoreAssistUniqueRarity,
    simCannonAssistStoneEfficiency: ws.simCannonAssistStoneEfficiency,
    simArmorAssistStoneEfficiency: ws.simArmorAssistStoneEfficiency,
    simGeneratorAssistStoneEfficiency: ws.simGeneratorAssistStoneEfficiency,
    simCoreAssistStoneEfficiency: ws.simCoreAssistStoneEfficiency,
    simCannonAssistMainStoneEfficiency: ws.simCannonAssistMainStoneEfficiency,
    simArmorAssistMainStoneEfficiency: ws.simArmorAssistMainStoneEfficiency,
    simGeneratorAssistMainStoneEfficiency: ws.simGeneratorAssistMainStoneEfficiency,
    simCoreAssistMainStoneEfficiency: ws.simCoreAssistMainStoneEfficiency,
    simCannonAssistSubStoneEfficiency: ws.simCannonAssistSubStoneEfficiency,
    simArmorAssistSubStoneEfficiency: ws.simArmorAssistSubStoneEfficiency,
    simGeneratorAssistSubStoneEfficiency: ws.simGeneratorAssistSubStoneEfficiency,
    simCoreAssistSubStoneEfficiency: ws.simCoreAssistSubStoneEfficiency,
  }
}

export function applyWorkshopModulePresetSnapshot(
  ws: WorkshopPersistedV1,
  snap: WorkshopModulePresetSnapshot,
): WorkshopPersistedV1 {
  const simSubmoduleSelections = sanitizeSubmoduleSelections(snap.simSubmoduleSelections)
  const simAttackSpeedModuleSubEffect = attackSpeedFromSubmoduleSelections(
    simSubmoduleSelections,
  )
  return {
    ...ws,
    simAssistModuleSlot: sanitizeAssistModuleSlot(snap.simAssistModuleSlot),
    simCannonModuleLevel: clampWorkshopAssistModuleLevel(snap.simCannonModuleLevel),
    simArmorModuleLevel: clampWorkshopAssistModuleLevel(snap.simArmorModuleLevel),
    simGeneratorModuleLevel: clampWorkshopAssistModuleLevel(snap.simGeneratorModuleLevel),
    simCoreModuleLevel: clampWorkshopAssistModuleLevel(snap.simCoreModuleLevel),
    simCannonChassisModuleId: snap.simCannonChassisModuleId ?? '',
    simArmorChassisModuleId: snap.simArmorChassisModuleId ?? '',
    simGeneratorChassisModuleId: snap.simGeneratorChassisModuleId ?? '',
    simCoreChassisModuleId: snap.simCoreChassisModuleId ?? '',
    simCannonChassisModuleRarity: sanitizeChassisModuleMergeTier(snap.simCannonChassisModuleRarity),
    simArmorChassisModuleRarity: sanitizeChassisModuleMergeTier(snap.simArmorChassisModuleRarity),
    simGeneratorChassisModuleRarity: sanitizeChassisModuleMergeTier(
      snap.simGeneratorChassisModuleRarity,
    ),
    simCoreChassisModuleRarity: sanitizeChassisModuleMergeTier(snap.simCoreChassisModuleRarity),
    simSubmoduleSelections,
    simAttackSpeedModuleSubEffect,
    simCannonAssistUnlocked: snap.simCannonAssistUnlocked === true,
    simArmorAssistUnlocked: snap.simArmorAssistUnlocked === true,
    simGeneratorAssistUnlocked: snap.simGeneratorAssistUnlocked === true,
    simCoreAssistUnlocked: snap.simCoreAssistUnlocked === true,
    simCannonAssistChassisModuleId: snap.simCannonAssistChassisModuleId ?? '',
    simArmorAssistChassisModuleId: snap.simArmorAssistChassisModuleId ?? '',
    simGeneratorAssistChassisModuleId: snap.simGeneratorAssistChassisModuleId ?? '',
    simCoreAssistChassisModuleId: snap.simCoreAssistChassisModuleId ?? '',
    simCannonAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      snap.simCannonAssistChassisModuleRarity,
    ),
    simArmorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      snap.simArmorAssistChassisModuleRarity,
    ),
    simGeneratorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      snap.simGeneratorAssistChassisModuleRarity,
    ),
    simCoreAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      snap.simCoreAssistChassisModuleRarity,
    ),
    simCannonAssistUniqueRarity: sanitizeChassisModuleEffectTier(snap.simCannonAssistUniqueRarity),
    simArmorAssistUniqueRarity: sanitizeChassisModuleEffectTier(snap.simArmorAssistUniqueRarity),
    simGeneratorAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      snap.simGeneratorAssistUniqueRarity,
    ),
    simCoreAssistUniqueRarity: sanitizeChassisModuleEffectTier(snap.simCoreAssistUniqueRarity),
    simCannonAssistStoneEfficiency: clampAssistStoneEfficiency(snap.simCannonAssistStoneEfficiency),
    simArmorAssistStoneEfficiency: clampAssistStoneEfficiency(snap.simArmorAssistStoneEfficiency),
    simGeneratorAssistStoneEfficiency: clampAssistStoneEfficiency(
      snap.simGeneratorAssistStoneEfficiency,
    ),
    simCoreAssistStoneEfficiency: clampAssistStoneEfficiency(snap.simCoreAssistStoneEfficiency),
    simCannonAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      snap.simCannonAssistMainStoneEfficiency ?? snap.simCannonAssistStoneEfficiency,
    ),
    simArmorAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      snap.simArmorAssistMainStoneEfficiency ?? snap.simArmorAssistStoneEfficiency,
    ),
    simGeneratorAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      snap.simGeneratorAssistMainStoneEfficiency ?? snap.simGeneratorAssistStoneEfficiency,
    ),
    simCoreAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      snap.simCoreAssistMainStoneEfficiency ?? snap.simCoreAssistStoneEfficiency,
    ),
    simCannonAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      snap.simCannonAssistSubStoneEfficiency ?? snap.simCannonAssistStoneEfficiency,
    ),
    simArmorAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      snap.simArmorAssistSubStoneEfficiency ?? snap.simArmorAssistStoneEfficiency,
    ),
    simGeneratorAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      snap.simGeneratorAssistSubStoneEfficiency ?? snap.simGeneratorAssistStoneEfficiency,
    ),
    simCoreAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      snap.simCoreAssistSubStoneEfficiency ?? snap.simCoreAssistStoneEfficiency,
    ),
  }
}

function sanitizeSnapshotFromUnknown(raw: unknown): WorkshopModulePresetSnapshot {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultWorkshopModulePresetSnapshot()
  }
  const o = raw as Record<string, unknown>
  const simSubmoduleSelections = parseSubmoduleSelectionsJson(o.simSubmoduleSelections)
  const attackFromSub = attackSpeedFromSubmoduleSelections(simSubmoduleSelections)
  return {
    simAssistModuleSlot: sanitizeAssistModuleSlot(o.simAssistModuleSlot),
    simCannonModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simCannonModuleLevel)),
    simArmorModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simArmorModuleLevel)),
    simGeneratorModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simGeneratorModuleLevel)),
    simCoreModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simCoreModuleLevel)),
    simCannonChassisModuleId:
      typeof o.simCannonChassisModuleId === 'string' ? o.simCannonChassisModuleId : '',
    simArmorChassisModuleId:
      typeof o.simArmorChassisModuleId === 'string' ? o.simArmorChassisModuleId : '',
    simGeneratorChassisModuleId:
      typeof o.simGeneratorChassisModuleId === 'string' ? o.simGeneratorChassisModuleId : '',
    simCoreChassisModuleId:
      typeof o.simCoreChassisModuleId === 'string' ? o.simCoreChassisModuleId : '',
    simCannonChassisModuleRarity: sanitizeChassisModuleMergeTier(o.simCannonChassisModuleRarity),
    simArmorChassisModuleRarity: sanitizeChassisModuleMergeTier(o.simArmorChassisModuleRarity),
    simGeneratorChassisModuleRarity: sanitizeChassisModuleMergeTier(
      o.simGeneratorChassisModuleRarity,
    ),
    simCoreChassisModuleRarity: sanitizeChassisModuleMergeTier(o.simCoreChassisModuleRarity),
    simSubmoduleSelections,
    simAttackSpeedModuleSubEffect:
      attackFromSub > 0 ? attackFromSub : Math.max(0, Number(o.simAttackSpeedModuleSubEffect) || 0),
    simCannonAssistUnlocked: o.simCannonAssistUnlocked === true,
    simArmorAssistUnlocked: o.simArmorAssistUnlocked === true,
    simGeneratorAssistUnlocked: o.simGeneratorAssistUnlocked === true,
    simCoreAssistUnlocked: o.simCoreAssistUnlocked === true,
    simCannonAssistChassisModuleId:
      typeof o.simCannonAssistChassisModuleId === 'string'
        ? o.simCannonAssistChassisModuleId
        : '',
    simArmorAssistChassisModuleId:
      typeof o.simArmorAssistChassisModuleId === 'string' ? o.simArmorAssistChassisModuleId : '',
    simGeneratorAssistChassisModuleId:
      typeof o.simGeneratorAssistChassisModuleId === 'string'
        ? o.simGeneratorAssistChassisModuleId
        : '',
    simCoreAssistChassisModuleId:
      typeof o.simCoreAssistChassisModuleId === 'string' ? o.simCoreAssistChassisModuleId : '',
    simCannonAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      o.simCannonAssistChassisModuleRarity,
    ),
    simArmorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      o.simArmorAssistChassisModuleRarity,
    ),
    simGeneratorAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      o.simGeneratorAssistChassisModuleRarity,
    ),
    simCoreAssistChassisModuleRarity: sanitizeChassisModuleMergeTier(
      o.simCoreAssistChassisModuleRarity,
    ),
    simCannonAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      o.simCannonAssistUniqueRarity ??
        workshopChassisModuleEffectTier(
          sanitizeChassisModuleMergeTier(o.simCannonAssistChassisModuleRarity),
        ),
    ),
    simArmorAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      o.simArmorAssistUniqueRarity ??
        workshopChassisModuleEffectTier(
          sanitizeChassisModuleMergeTier(o.simArmorAssistChassisModuleRarity),
        ),
    ),
    simGeneratorAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      o.simGeneratorAssistUniqueRarity ??
        workshopChassisModuleEffectTier(
          sanitizeChassisModuleMergeTier(o.simGeneratorAssistChassisModuleRarity),
        ),
    ),
    simCoreAssistUniqueRarity: sanitizeChassisModuleEffectTier(
      o.simCoreAssistUniqueRarity ??
        workshopChassisModuleEffectTier(
          sanitizeChassisModuleMergeTier(o.simCoreAssistChassisModuleRarity),
        ),
    ),
    simCannonAssistStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCannonAssistStoneEfficiency),
    ),
    simArmorAssistStoneEfficiency: clampAssistStoneEfficiency(Number(o.simArmorAssistStoneEfficiency)),
    simGeneratorAssistStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simGeneratorAssistStoneEfficiency),
    ),
    simCoreAssistStoneEfficiency: clampAssistStoneEfficiency(Number(o.simCoreAssistStoneEfficiency)),
    simCannonAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCannonAssistMainStoneEfficiency ?? o.simCannonAssistStoneEfficiency),
    ),
    simArmorAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simArmorAssistMainStoneEfficiency ?? o.simArmorAssistStoneEfficiency),
    ),
    simGeneratorAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simGeneratorAssistMainStoneEfficiency ?? o.simGeneratorAssistStoneEfficiency),
    ),
    simCoreAssistMainStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCoreAssistMainStoneEfficiency ?? o.simCoreAssistStoneEfficiency),
    ),
    simCannonAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCannonAssistSubStoneEfficiency ?? o.simCannonAssistStoneEfficiency),
    ),
    simArmorAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simArmorAssistSubStoneEfficiency ?? o.simArmorAssistStoneEfficiency),
    ),
    simGeneratorAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simGeneratorAssistSubStoneEfficiency ?? o.simGeneratorAssistStoneEfficiency),
    ),
    simCoreAssistSubStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCoreAssistSubStoneEfficiency ?? o.simCoreAssistStoneEfficiency),
    ),
  }
}

export function sanitizeModulePresetSnapshots(
  raw: unknown,
  live?: WorkshopPersistedV1,
): WorkshopModulePresetSnapshot[] {
  const fallback = live != null ? extractWorkshopModulePresetSnapshot(live) : defaultWorkshopModulePresetSnapshot()
  const out: WorkshopModulePresetSnapshot[] = []
  if (Array.isArray(raw)) {
    for (let i = 0; i < WORKSHOP_MODULE_PRESET_COUNT; i++) {
      out.push(sanitizeSnapshotFromUnknown(raw[i]))
    }
    return out
  }
  const empty = defaultModulePresetSnapshots()
  empty[0] = fallback
  return empty
}

export function modulePresetSnapshotsFromPersisted(
  ws: WorkshopPersistedV1,
): WorkshopModulePresetSnapshot[] {
  if (ws.modulePresetSnapshots != null && ws.modulePresetSnapshots.length >= WORKSHOP_MODULE_PRESET_COUNT) {
    return sanitizeModulePresetSnapshots(ws.modulePresetSnapshots, ws)
  }
  return sanitizeModulePresetSnapshots(null, ws)
}

/** Merge module sim changes and persist them on the active preset tab. */
export function patchWorkshopModules(
  ws: WorkshopPersistedV1,
  partial: Partial<WorkshopPersistedV1>,
): WorkshopPersistedV1 {
  let next: WorkshopPersistedV1 = { ...ws, ...partial }
  if (partial.simSubmoduleSelections != null) {
    next = {
      ...next,
      simAttackSpeedModuleSubEffect: attackSpeedFromSubmoduleSelections(
        sanitizeSubmoduleSelections(next.simSubmoduleSelections),
      ),
    }
  }
  const activeIndex = clampWorkshopModuleActivePresetIndex(ws.moduleActivePresetIndex)
  const snapshots = modulePresetSnapshotsFromPersisted(ws)
  snapshots[activeIndex] = extractWorkshopModulePresetSnapshot(next)
  return {
    ...next,
    moduleActivePresetIndex: activeIndex,
    modulePresetSnapshots: snapshots,
  }
}

export function selectWorkshopModulePreset(
  ws: WorkshopPersistedV1,
  nextIndex: number,
): WorkshopPersistedV1 {
  const activeIndex = clampWorkshopModuleActivePresetIndex(ws.moduleActivePresetIndex)
  const targetIndex = clampWorkshopModuleActivePresetIndex(nextIndex)
  if (activeIndex === targetIndex) {
    return { ...ws, moduleActivePresetIndex: targetIndex }
  }
  const snapshots = modulePresetSnapshotsFromPersisted(ws)
  snapshots[activeIndex] = extractWorkshopModulePresetSnapshot(ws)
  const snap = snapshots[targetIndex] ?? defaultWorkshopModulePresetSnapshot()
  return {
    ...applyWorkshopModulePresetSnapshot(ws, snap),
    moduleActivePresetIndex: targetIndex,
    modulePresetSnapshots: snapshots,
  }
}

export function workshopPersistedWithModulePresets(
  ws: WorkshopPersistedV1,
  snapshots: WorkshopModulePresetSnapshot[],
  activeIndex: number,
): WorkshopPersistedV1 {
  const idx = clampWorkshopModuleActivePresetIndex(activeIndex)
  const sanitized = sanitizeModulePresetSnapshots(snapshots, ws)
  const snap = sanitized[idx] ?? defaultWorkshopModulePresetSnapshot()
  return {
    ...applyWorkshopModulePresetSnapshot(ws, snap),
    moduleActivePresetIndex: idx,
    modulePresetSnapshots: sanitized,
  }
}

/** Module fields restored by {@link resetWorkshopModules}. */
export function defaultWorkshopModulesPersistedFields(): Pick<
  WorkshopPersistedV1,
  keyof WorkshopModulePresetSnapshot | 'modulePresetSnapshots' | 'moduleActivePresetIndex'
> {
  const snapshots = defaultModulePresetSnapshots()
  const snap = snapshots[0]!
  return {
    ...snap,
    modulePresetSnapshots: snapshots,
    moduleActivePresetIndex: 0,
  }
}
