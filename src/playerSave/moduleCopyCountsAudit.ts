/**
 * Compare strict submodule-slot copy counting vs naive infoIndex-only grouping.
 */

import type { DecodedPlayerSave, DecodedModuleItem } from './decodePlayerInfo'
import { GAME_MODULE_INFO_INDEX_TO_WORKSHOP_ID } from './gameModuleIndex'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import {
  buildModuleCopyCountsFromPlayerSave,
  isSignificantModuleCopy,
} from '../data/workshopModuleCopyCounts'

const MODULE_SLOTS = ['cannon', 'armor', 'generator', 'core'] as const

function naiveResolvedKey(item: {
  infoIndex: number
}): `${(typeof MODULE_SLOTS)[number]}:${string}` | null {
  const id = GAME_MODULE_INFO_INDEX_TO_WORKSHOP_ID[item.infoIndex]
  if (!id) return null
  for (const slot of MODULE_SLOTS) {
    if (gameWorkshopChassisModuleId(item.infoIndex, slot) === id) {
      return `${slot}:${id}`
    }
  }
  return null
}

export type ModuleCopyCountMismatch = {
  slot: (typeof MODULE_SLOTS)[number]
  moduleId: string
  naiveCount: number
  strictCount: number
  filtered: number
}

/** Naive per-module totals using infoIndex mapping only (the inflated baseline). */
export function naiveModuleCopyCountsFromSave(
  save: DecodedPlayerSave,
): Map<string, number> {
  const naive = new Map<string, number>()

  const add = (item: DecodedModuleItem | null | undefined) => {
    if (!item || !isSignificantModuleCopy(item)) return
    const key = naiveResolvedKey(item)
    if (!key) return
    naive.set(key, (naive.get(key) ?? 0) + 1)
  }

  for (const item of save.moduleInventory) add(item)
  for (const item of save.moduleEquipped) add(item)
  for (const row of save.assistModuleSlots) add(row?.equipped)

  return naive
}

/** Modules where strict counting filtered fodder rows that naive infoIndex grouping kept. */
export function moduleCopyCountMismatches(save: DecodedPlayerSave): ModuleCopyCountMismatch[] {
  const naive = naiveModuleCopyCountsFromSave(save)
  const strict = buildModuleCopyCountsFromPlayerSave(save)
  const keys = new Set([...naive.keys()])

  for (const slot of MODULE_SLOTS) {
    for (const moduleId of Object.keys(strict[slot] ?? {})) {
      keys.add(`${slot}:${moduleId}`)
    }
  }

  const mismatches: ModuleCopyCountMismatch[] = []
  for (const key of keys) {
    const [slot, moduleId] = key.split(':') as [(typeof MODULE_SLOTS)[number], string]
    const naiveCount = naive.get(key) ?? 0
    const strictCount = strict[slot]?.[moduleId]?.count ?? 0
    if (naiveCount !== strictCount) {
      mismatches.push({
        slot,
        moduleId,
        naiveCount,
        strictCount,
        filtered: naiveCount - strictCount,
      })
    }
  }

  return mismatches.sort((a, b) => b.filtered - a.filtered)
}

/** Strict counts must never exceed naive infoIndex grouping. */
export function assertCopyCountsNotInflated(save: DecodedPlayerSave): void {
  for (const row of moduleCopyCountMismatches(save)) {
    if (row.strictCount > row.naiveCount) {
      throw new Error(
        `inflated copy count for ${row.slot}/${row.moduleId}: strict ${row.strictCount} > naive ${row.naiveCount}`,
      )
    }
  }
}
