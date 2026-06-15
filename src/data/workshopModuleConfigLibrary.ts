/**
 * Per-module chassis configuration (rarity, level, sub-modules) independent of equip state.
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  ASSIST_CHASSIS_MODULE_ID_KEY,
  ASSIST_CHASSIS_MODULE_RARITY_KEY,
  ASSIST_UNIQUE_RARITY_KEY,
  workshopAssistChassisModuleSelection,
} from './workshopAssistChassisModule'
import {
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_LEVEL_KEY,
  CHASSIS_MODULE_RARITY_KEY,
  CHASSIS_MODULE_ORDERS,
  sanitizeChassisModuleId,
  workshopChassisModuleLevel,
  workshopChassisModuleSelection,
} from './workshopChassisModuleSelection'
import {
  sanitizeChassisModuleEffectTier,
  sanitizeChassisModuleMergeTier,
  workshopChassisModuleEffectTier,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import {
  ASSIST_MODULE_LEVEL_KEY,
  clampWorkshopAssistModuleLevel,
  workshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from './workshopSimModules'
import {
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectId,
} from './workshopSubmoduleCatalog'
import {
  defaultWorkshopSubmoduleSlotSelections,
  emptySubmoduleOrderedSlots,
  orderedSlotsFromSelectionMap,
  sanitizeSubmoduleSelectionMap,
  toggleSubmoduleSelectionWithOrder,
  totalCannonAttackSpeedFromSelections,
  type WorkshopSubmoduleModuleRole,
  type WorkshopSubmoduleOrderedSlots,
  type WorkshopSubmoduleSelectionMap,
  type WorkshopSubmoduleSelections,
} from './workshopSubmoduleSelection'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'

export type WorkshopModuleConfigEntry = {
  rarity: WorkshopChassisModuleMergeTier
  level: number
  submodules: WorkshopSubmoduleSelectionMap
  submoduleSlots?: WorkshopSubmoduleOrderedSlots
  uniqueEffectRarity?: WorkshopChassisModuleEffectTier
}

export type WorkshopModuleSlotConfigLibrary = {
  main: Record<string, WorkshopModuleConfigEntry>
  assist: Record<string, WorkshopModuleConfigEntry>
}

export type WorkshopModuleConfigLibrary = Record<
  WorkshopAssistModuleSlot,
  WorkshopModuleSlotConfigLibrary
>

export function defaultWorkshopModuleConfigEntry(): WorkshopModuleConfigEntry {
  return {
    rarity: 'epic',
    level: 0,
    submodules: {},
    submoduleSlots: emptySubmoduleOrderedSlots(),
  }
}

export function defaultWorkshopModuleSlotConfigLibrary(): WorkshopModuleSlotConfigLibrary {
  return { main: {}, assist: {} }
}

export function defaultWorkshopModuleConfigLibrary(): WorkshopModuleConfigLibrary {
  return {
    cannon: defaultWorkshopModuleSlotConfigLibrary(),
    armor: defaultWorkshopModuleSlotConfigLibrary(),
    generator: defaultWorkshopModuleSlotConfigLibrary(),
    core: defaultWorkshopModuleSlotConfigLibrary(),
  }
}

function sanitizeModuleConfigEntry(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
): WorkshopModuleConfigEntry {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultWorkshopModuleConfigEntry()
  }
  const o = raw as Record<string, unknown>
  const submodules = sanitizeSubmoduleSelectionMap(slot, o.submodules)
  const submoduleSlots = sanitizeSubmoduleSlots(slot, o.submoduleSlots, submodules)
  return {
    rarity: sanitizeChassisModuleMergeTier(o.rarity),
    level: clampWorkshopAssistModuleLevel(Number(o.level)),
    submodules,
    submoduleSlots,
    uniqueEffectRarity:
      o.uniqueEffectRarity != null
        ? sanitizeChassisModuleEffectTier(o.uniqueEffectRarity)
        : undefined,
  }
}

function sanitizeSubmoduleSlots(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
  map: WorkshopSubmoduleSelectionMap,
): WorkshopSubmoduleOrderedSlots | undefined {
  if (!Array.isArray(raw)) return orderedSlotsFromSelectionMap(map)
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const validIds = new Set(section.rows.map((row) => submoduleEffectId(row.label)))
  const out = emptySubmoduleOrderedSlots()
  let any = false
  for (let i = 0; i < Math.min(raw.length, out.length); i++) {
    const el = raw[i]
    if (el == null || typeof el !== 'object' || Array.isArray(el)) continue
    const effectId = (el as { effectId?: unknown }).effectId
    if (typeof effectId !== 'string' || !validIds.has(effectId) || map[effectId] == null) {
      continue
    }
    out[i] = { effectId, rarity: map[effectId]! }
    any = true
  }
  return any ? out : orderedSlotsFromSelectionMap(map)
}

function sanitizeRoleMap(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
): Record<string, WorkshopModuleConfigEntry> {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, WorkshopModuleConfigEntry> = {}
  for (const [moduleId, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!CHASSIS_MODULE_ORDERS[slot].includes(moduleId)) continue
    out[moduleId] = sanitizeModuleConfigEntry(slot, entry)
  }
  return out
}

export function sanitizeWorkshopModuleConfigLibrary(raw: unknown): WorkshopModuleConfigLibrary {
  const d = defaultWorkshopModuleConfigLibrary()
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>
  return {
    cannon: {
      main: sanitizeRoleMap('cannon', (o.cannon as WorkshopModuleSlotConfigLibrary | undefined)?.main),
      assist: sanitizeRoleMap(
        'cannon',
        (o.cannon as WorkshopModuleSlotConfigLibrary | undefined)?.assist,
      ),
    },
    armor: {
      main: sanitizeRoleMap('armor', (o.armor as WorkshopModuleSlotConfigLibrary | undefined)?.main),
      assist: sanitizeRoleMap(
        'armor',
        (o.armor as WorkshopModuleSlotConfigLibrary | undefined)?.assist,
      ),
    },
    generator: {
      main: sanitizeRoleMap(
        'generator',
        (o.generator as WorkshopModuleSlotConfigLibrary | undefined)?.main,
      ),
      assist: sanitizeRoleMap(
        'generator',
        (o.generator as WorkshopModuleSlotConfigLibrary | undefined)?.assist,
      ),
    },
    core: {
      main: sanitizeRoleMap('core', (o.core as WorkshopModuleSlotConfigLibrary | undefined)?.main),
      assist: sanitizeRoleMap(
        'core',
        (o.core as WorkshopModuleSlotConfigLibrary | undefined)?.assist,
      ),
    },
  }
}

function equippedModuleConfigFromSlot(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): WorkshopModuleConfigEntry | null {
  if (role === 'main') {
    const sel = workshopChassisModuleSelection(ws, slot)
    if (sel.moduleId !== moduleId) return null
    const slotSubs = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
    return {
      rarity: sel.rarity,
      level: workshopChassisModuleLevel(ws, slot),
      submodules: slotSubs.main,
      submoduleSlots: slotSubs.mainSlots ?? orderedSlotsFromSelectionMap(slotSubs.main),
    }
  }
  const sel = workshopAssistChassisModuleSelection(ws, slot)
  if (sel.moduleId !== moduleId) return null
  const slotSubs = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  return {
    rarity: sel.rarity,
    level: workshopAssistModuleLevel(ws, slot),
    submodules: slotSubs.assist,
    submoduleSlots: slotSubs.assistSlots ?? orderedSlotsFromSelectionMap(slotSubs.assist),
    uniqueEffectRarity: sel.uniqueRarity,
  }
}

export function workshopModuleConfigEntry(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): WorkshopModuleConfigEntry {
  const sanitizedId = sanitizeChassisModuleId(slot, moduleId)
  if (sanitizedId == null) return defaultWorkshopModuleConfigEntry()

  const stored = ws.simChassisModuleConfigs?.[slot]?.[role]?.[sanitizedId]
  if (stored != null) return stored

  const fromEquipped = equippedModuleConfigFromSlot(ws, slot, role, sanitizedId)
  if (fromEquipped != null) return fromEquipped

  return defaultWorkshopModuleConfigEntry()
}

function withUpdatedLibrary(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
  entry: WorkshopModuleConfigEntry,
): WorkshopPersistedV1 {
  const library = sanitizeWorkshopModuleConfigLibrary(ws.simChassisModuleConfigs)
  const slotLib = library[slot] ?? defaultWorkshopModuleSlotConfigLibrary()
  return {
    ...ws,
    simChassisModuleConfigs: {
      ...library,
      [slot]: {
        ...slotLib,
        [role]: {
          ...slotLib[role],
          [moduleId]: entry,
        },
      },
    },
  }
}

function isModuleEquipped(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): boolean {
  if (role === 'main') {
    return workshopChassisModuleSelection(ws, slot).moduleId === moduleId
  }
  return workshopAssistChassisModuleSelection(ws, slot).moduleId === moduleId
}

function syncEquippedSlotFromEntry(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
  entry: WorkshopModuleConfigEntry,
): WorkshopPersistedV1 {
  let next = ws
  const slotSubs = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  const nextSlotSubs = {
    ...slotSubs,
    ...(role === 'main'
      ? {
          main: entry.submodules,
          mainSlots: entry.submoduleSlots ?? orderedSlotsFromSelectionMap(entry.submodules),
        }
      : {
          assist: entry.submodules,
          assistSlots: entry.submoduleSlots ?? orderedSlotsFromSelectionMap(entry.submodules),
        }),
  }
  const simSubmoduleSelections: WorkshopSubmoduleSelections = {
    ...ws.simSubmoduleSelections,
    [slot]: nextSlotSubs,
  }
  next = {
    ...next,
    simSubmoduleSelections,
    simAttackSpeedModuleSubEffect: totalCannonAttackSpeedFromSelections(simSubmoduleSelections),
  }

  if (role === 'main') {
    next = {
      ...next,
      [CHASSIS_MODULE_ID_KEY[slot]]: moduleId,
      [CHASSIS_MODULE_RARITY_KEY[slot]]: entry.rarity,
      [CHASSIS_MODULE_LEVEL_KEY[slot]]: entry.level,
    }
    return next
  }

  next = {
    ...next,
    [ASSIST_CHASSIS_MODULE_ID_KEY[slot]]: moduleId,
    [ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]]: entry.rarity,
    [ASSIST_MODULE_LEVEL_KEY[slot]]: entry.level,
    ...(entry.uniqueEffectRarity != null
      ? { [ASSIST_UNIQUE_RARITY_KEY[slot]]: entry.uniqueEffectRarity }
      : {}),
  }
  return next
}

export function workshopPersistedWithModuleConfigEntry(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
  patch: Partial<WorkshopModuleConfigEntry>,
): WorkshopPersistedV1 {
  const sanitizedId = sanitizeChassisModuleId(slot, moduleId)
  if (sanitizedId == null) return ws

  const current = workshopModuleConfigEntry(ws, slot, role, sanitizedId)
  const entry: WorkshopModuleConfigEntry = {
    ...current,
    ...patch,
    submodules: patch.submodules ?? current.submodules,
    submoduleSlots:
      patch.submoduleSlots ??
      (patch.submodules != null
        ? orderedSlotsFromSelectionMap(patch.submodules)
        : current.submoduleSlots),
    uniqueEffectRarity:
      patch.uniqueEffectRarity ??
      current.uniqueEffectRarity ??
      workshopChassisModuleEffectTier(patch.rarity ?? current.rarity),
  }

  let next = withUpdatedLibrary(ws, slot, role, sanitizedId, entry)
  if (isModuleEquipped(next, slot, role, sanitizedId)) {
    next = syncEquippedSlotFromEntry(next, slot, role, sanitizedId, entry)
  }
  return next
}

export function workshopPersistedEquipModuleFromLibrary(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): WorkshopPersistedV1 {
  const sanitizedId = sanitizeChassisModuleId(slot, moduleId)
  if (sanitizedId == null) return ws
  const entry = workshopModuleConfigEntry(ws, slot, role, sanitizedId)
  const withLibrary = withUpdatedLibrary(ws, slot, role, sanitizedId, entry)
  return syncEquippedSlotFromEntry(withLibrary, slot, role, sanitizedId, entry)
}

export function workshopPersistedUnequipModule(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
): WorkshopPersistedV1 {
  if (role === 'main') {
    return { ...ws, [CHASSIS_MODULE_ID_KEY[slot]]: '' }
  }
  return { ...ws, [ASSIST_CHASSIS_MODULE_ID_KEY[slot]]: '' }
}

export function workshopModuleConfigSubmoduleSelections(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): WorkshopSubmoduleSelectionMap {
  return workshopModuleConfigEntry(ws, slot, role, moduleId).submodules
}

export function workshopModuleConfigSubmoduleOrderedSlots(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
): WorkshopSubmoduleOrderedSlots {
  const entry = workshopModuleConfigEntry(ws, slot, role, moduleId)
  return entry.submoduleSlots ?? orderedSlotsFromSelectionMap(entry.submodules)
}

export function workshopPersistedWithModuleConfigEffectToggle(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  moduleId: string,
  effectId: string,
  rarity: WorkshopSubmoduleRarity,
  cellValue: string | null,
): WorkshopPersistedV1 {
  const entry = workshopModuleConfigEntry(ws, slot, role, moduleId)
  const next = toggleSubmoduleSelectionWithOrder(
    entry.submodules,
    entry.submoduleSlots,
    effectId,
    rarity,
    cellValue,
  )
  return workshopPersistedWithModuleConfigEntry(ws, slot, role, moduleId, {
    submodules: next.selections,
    submoduleSlots: next.orderedSlots,
  })
}

/** Seed library entries from currently equipped modules when loading legacy saves. */
export function seedWorkshopModuleConfigLibrary(ws: WorkshopPersistedV1): WorkshopPersistedV1 {
  let next = ws
  const slots: WorkshopAssistModuleSlot[] = ['cannon', 'armor', 'generator', 'core']
  for (const slot of slots) {
    for (const role of ['main', 'assist'] as const) {
      const moduleId =
        role === 'main'
          ? workshopChassisModuleSelection(ws, slot).moduleId
          : workshopAssistChassisModuleSelection(ws, slot).moduleId
      if (moduleId == null) continue
      const entry = equippedModuleConfigFromSlot(ws, slot, role, moduleId)
      if (entry == null) continue
      const existing = ws.simChassisModuleConfigs?.[slot]?.[role]?.[moduleId]
      if (existing != null) continue
      next = withUpdatedLibrary(next, slot, role, moduleId, entry)
    }
  }
  return next
}
