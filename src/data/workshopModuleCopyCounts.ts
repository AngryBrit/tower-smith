/**
 * Physical copy counts per chassis module (from playerInfo.dat inventory).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { DecodedModuleItem, DecodedPlayerSave } from '../playerSave/decodePlayerInfo'
import { gameModuleRarityToMergeTier } from '../playerSave/gameModuleRarity'
import { resolveModuleItemToWorkshop } from '../playerSave/resolveModuleItem'
import { sanitizeChassisModuleId } from './workshopChassisModuleSelection'
import {
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  sanitizeChassisModuleMergeTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import {
  WORKSHOP_ASSIST_MODULE_SLOTS,
  clampWorkshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from './workshopSimModules'

export type WorkshopModuleCopyInstance = {
  rarity: WorkshopChassisModuleMergeTier
  level: number
}

export type WorkshopModuleCopySummary = {
  count: number
  copies: WorkshopModuleCopyInstance[]
}

export type WorkshopModuleCopyCountsLibrary = Record<
  WorkshopAssistModuleSlot,
  Record<string, WorkshopModuleCopySummary>
>

function mergeTierRank(tier: WorkshopChassisModuleMergeTier): number {
  return WORKSHOP_CHASSIS_MODULE_MERGE_TIERS.indexOf(tier)
}

export function sortModuleCopyInstances(
  copies: WorkshopModuleCopyInstance[],
): WorkshopModuleCopyInstance[] {
  return [...copies].sort((a, b) => {
    const tierDiff = mergeTierRank(b.rarity) - mergeTierRank(a.rarity)
    if (tierDiff !== 0) return tierDiff
    return b.level - a.level
  })
}

export function defaultWorkshopModuleCopyCountsLibrary(): WorkshopModuleCopyCountsLibrary {
  return {
    cannon: {},
    armor: {},
    generator: {},
    core: {},
  }
}

function sanitizeCopyInstance(raw: unknown): WorkshopModuleCopyInstance | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  return {
    rarity: sanitizeChassisModuleMergeTier(o.rarity),
    level: clampWorkshopAssistModuleLevel(Number(o.level)),
  }
}

function sanitizeCopySummary(raw: unknown): WorkshopModuleCopySummary | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const copiesRaw = o.copies
  if (!Array.isArray(copiesRaw)) return null
  const copies = copiesRaw
    .map(sanitizeCopyInstance)
    .filter((c): c is WorkshopModuleCopyInstance => c != null)
  const count = Math.max(0, Math.trunc(Number(o.count)))
  if (copies.length === 0 || count < 1) return null
  return { count: Math.max(count, copies.length), copies: sortModuleCopyInstances(copies) }
}

export function sanitizeWorkshopModuleCopyCounts(raw: unknown): WorkshopModuleCopyCountsLibrary {
  const d = defaultWorkshopModuleCopyCountsLibrary()
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const slotRaw = o[slot]
    if (slotRaw == null || typeof slotRaw !== 'object' || Array.isArray(slotRaw)) continue
    const slotOut: Record<string, WorkshopModuleCopySummary> = {}
    for (const [moduleId, summaryRaw] of Object.entries(slotRaw as Record<string, unknown>)) {
      const sanitizedId = sanitizeChassisModuleId(slot, moduleId)
      if (sanitizedId == null) continue
      const summary = sanitizeCopySummary(summaryRaw)
      if (summary) slotOut[sanitizedId] = summary
    }
    d[slot] = slotOut
  }
  return d
}

/**
 * Real owned copy vs an uninitialized inventory shell (Lv.1 with no submodule rolls).
 * Saves often contain many placeholder `ModuleItem` rows per infoIndex.
 */
export function isSignificantModuleCopy(item: DecodedModuleItem): boolean {
  if (item.level > 1) return true
  return item.effects.some((effect) => effect !== 0)
}

function moduleItemSignature(item: DecodedModuleItem): string {
  return `${item.infoIndex}:${item.rarity}:${item.level}:${item.effects.join(',')}`
}

function copyInstanceFromDecodedItem(item: DecodedModuleItem): WorkshopModuleCopyInstance | null {
  const merge = gameModuleRarityToMergeTier(item.rarity)
  if (!merge) return null
  return {
    rarity: merge,
    level: clampWorkshopAssistModuleLevel(item.level),
  }
}

function addDecodedItem(
  library: WorkshopModuleCopyCountsLibrary,
  item: DecodedModuleItem,
  hubSlot?: WorkshopAssistModuleSlot,
): void {
  const resolved = resolveModuleItemToWorkshop(
    item,
    hubSlot != null ? { hubSlot } : undefined,
  )
  if (!resolved) return
  const instance = copyInstanceFromDecodedItem(item)
  if (!instance) return
  const { slot, moduleId } = resolved
  const prev = library[slot][moduleId]
  if (prev) {
    library[slot][moduleId] = {
      count: prev.count + 1,
      copies: sortModuleCopyInstances([...prev.copies, instance]),
    }
  } else {
    library[slot][moduleId] = { count: 1, copies: [instance] }
  }
}

function collectEquippedItems(
  save: DecodedPlayerSave,
): { item: DecodedModuleItem; hubSlot: WorkshopAssistModuleSlot }[] {
  const out: { item: DecodedModuleItem; hubSlot: WorkshopAssistModuleSlot }[] = []
  for (let i = 0; i < WORKSHOP_ASSIST_MODULE_SLOTS.length; i++) {
    const hubSlot = WORKSHOP_ASSIST_MODULE_SLOTS[i]!
    const item = save.moduleEquipped[i]
    if (item) out.push({ item, hubSlot })
  }
  for (let i = 0; i < save.assistModuleSlots.length; i++) {
    const hubSlot = WORKSHOP_ASSIST_MODULE_SLOTS[i]
    if (!hubSlot) continue
    const item = save.assistModuleSlots[i]?.equipped
    if (item) out.push({ item, hubSlot })
  }
  return out
}

/** Total physical copies (inventory + equipped) per chassis module from a decoded save. */
export function buildModuleCopyCountsFromPlayerSave(
  save: DecodedPlayerSave,
): WorkshopModuleCopyCountsLibrary {
  const library = defaultWorkshopModuleCopyCountsLibrary()
  const inventoryItems = save.moduleInventory.filter(isSignificantModuleCopy)
  const inventorySigCounts = new Map<string, number>()

  for (const item of inventoryItems) {
    const sig = moduleItemSignature(item)
    inventorySigCounts.set(sig, (inventorySigCounts.get(sig) ?? 0) + 1)
    addDecodedItem(library, item)
  }

  for (const { item, hubSlot } of collectEquippedItems(save)) {
    const sig = moduleItemSignature(item)
    const remaining = inventorySigCounts.get(sig) ?? 0
    if (remaining > 0) {
      inventorySigCounts.set(sig, remaining - 1)
      continue
    }
    if (!isSignificantModuleCopy(item)) continue
    addDecodedItem(library, item, hubSlot)
  }

  return library
}

export function workshopModuleCopySummary(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): WorkshopModuleCopySummary | null {
  if (!ws.moduleInventoryFromPlayerSave) return null
  const sanitizedId = sanitizeChassisModuleId(slot, moduleId)
  if (sanitizedId == null) return null
  return ws.simChassisModuleCopyCounts?.[slot]?.[sanitizedId] ?? null
}
