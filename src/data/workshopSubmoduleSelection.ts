/**
 * Equipped sub-module effect picks per chassis slot (wiki Sub-Module Effects tables).
 * Main and assist modules each have their own sub-effect slots.
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'
import {
  parseSubmoduleCellNumber,
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectId,
} from './workshopSubmoduleCatalog'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'
import type { WorkshopSubmoduleBonusContext } from './workshopAssistSubmoduleScale'
import { scaleAssistSubmoduleValueForSlot } from './workshopAssistSubmoduleScale'

export { submoduleEffectId } from './workshopSubmoduleCatalog'

export const CANNON_ATTACK_SPEED_EFFECT_ID = submoduleEffectId('Attack Speed')

export type WorkshopSubmoduleModuleRole = 'main' | 'assist'

export type WorkshopSubmoduleSelectionMap = Partial<
  Record<string, WorkshopSubmoduleRarity>
>

/** Sub-module picks for one hub slot (primary module + assist copy). */
export type WorkshopSubmoduleSlotSelections = {
  main: WorkshopSubmoduleSelectionMap
  assist: WorkshopSubmoduleSelectionMap
}

export type WorkshopSubmoduleSelections = Record<
  WorkshopAssistModuleSlot,
  WorkshopSubmoduleSlotSelections
>

export function emptySubmoduleSelectionMap(): WorkshopSubmoduleSelectionMap {
  return {}
}

export function defaultWorkshopSubmoduleSlotSelections(): WorkshopSubmoduleSlotSelections {
  return { main: {}, assist: {} }
}

export function defaultWorkshopSubmoduleSelections(): WorkshopSubmoduleSelections {
  return {
    cannon: defaultWorkshopSubmoduleSlotSelections(),
    armor: defaultWorkshopSubmoduleSlotSelections(),
    generator: defaultWorkshopSubmoduleSlotSelections(),
    core: defaultWorkshopSubmoduleSlotSelections(),
  }
}

function isSubmoduleRarity(raw: unknown): raw is WorkshopSubmoduleRarity {
  return (
    raw === 'common' ||
    raw === 'rare' ||
    raw === 'epic' ||
    raw === 'legendary' ||
    raw === 'mythic' ||
    raw === 'ancestral'
  )
}

function isLegacyFlatSelectionMap(
  raw: Record<string, unknown>,
): boolean {
  if ('main' in raw || 'assist' in raw) return false
  return Object.keys(raw).length > 0
}

export function sanitizeSubmoduleSelectionMap(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
): WorkshopSubmoduleSelectionMap {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const validIds = new Set(section.rows.map((row) => submoduleEffectId(row.label)))
  const out: WorkshopSubmoduleSelectionMap = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!validIds.has(key) || !isSubmoduleRarity(value)) continue
    out[key] = value
  }
  return out
}

function sanitizeSubmoduleSlotSelections(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
): WorkshopSubmoduleSlotSelections {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultWorkshopSubmoduleSlotSelections()
  }
  const o = raw as Record<string, unknown>
  if (isLegacyFlatSelectionMap(o)) {
    return {
      main: sanitizeSubmoduleSelectionMap(slot, raw),
      assist: {},
    }
  }
  return {
    main: sanitizeSubmoduleSelectionMap(slot, o.main),
    assist: sanitizeSubmoduleSelectionMap(slot, o.assist),
  }
}

export function sanitizeSubmoduleSelections(raw: unknown): WorkshopSubmoduleSelections {
  const d = defaultWorkshopSubmoduleSelections()
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>
  return {
    cannon: sanitizeSubmoduleSlotSelections('cannon', o.cannon),
    armor: sanitizeSubmoduleSlotSelections('armor', o.armor),
    generator: sanitizeSubmoduleSlotSelections('generator', o.generator),
    core: sanitizeSubmoduleSlotSelections('core', o.core),
  }
}

export function workshopSubmoduleSelections(
  ws: Pick<WorkshopPersistedV1, 'simSubmoduleSelections'>,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole = 'main',
): WorkshopSubmoduleSelectionMap {
  const slotSelections = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  return slotSelections[role] ?? {}
}

export function toggleSubmoduleSelection(
  current: WorkshopSubmoduleSelectionMap,
  effectId: string,
  rarity: WorkshopSubmoduleRarity,
  cellValue: string | null,
): WorkshopSubmoduleSelectionMap {
  if (cellValue == null) return current
  if (current[effectId] === rarity) {
    const { [effectId]: _removed, ...rest } = current
    return rest
  }
  return { ...current, [effectId]: rarity }
}

export function cannonSubmoduleAttackSpeedFromSelections(
  selections: WorkshopSubmoduleSelectionMap,
): number {
  const rarity = selections[CANNON_ATTACK_SPEED_EFFECT_ID]
  if (rarity == null) return 0
  const row = WORKSHOP_SUBMODULE_SECTIONS.cannon.rows[0]
  if (row == null || submoduleEffectId(row.label) !== CANNON_ATTACK_SPEED_EFFECT_ID) {
    return 0
  }
  return parseSubmoduleCellNumber(row.cells[rarity]) ?? 0
}

/** Sum attack-speed sub-effects from main + assist cannon modules. */
export function totalCannonAttackSpeedFromSelections(
  selections: WorkshopSubmoduleSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): number {
  const slot = selections.cannon
  const main = cannonSubmoduleAttackSpeedFromSelections(slot.main)
  const assistRaw = cannonSubmoduleAttackSpeedFromSelections(slot.assist)
  const assist =
    ctx != null
      ? scaleAssistSubmoduleValueForSlot(
          ctx.ws,
          'cannon',
          assistRaw,
          CANNON_ATTACK_SPEED_EFFECT_ID,
          ctx.research,
          ctx.labOverrides,
        )
      : assistRaw
  return main + assist
}

export function workshopPersistedWithSubmoduleSelections(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  roleSelections: WorkshopSubmoduleSelectionMap,
): WorkshopPersistedV1 {
  const prev = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  const nextSlot: WorkshopSubmoduleSlotSelections = {
    main: role === 'main' ? roleSelections : prev.main,
    assist: role === 'assist' ? roleSelections : prev.assist,
  }
  const simSubmoduleSelections: WorkshopSubmoduleSelections = {
    ...ws.simSubmoduleSelections,
    [slot]: nextSlot,
  }
  return {
    ...ws,
    simSubmoduleSelections,
    simAttackSpeedModuleSubEffect: totalCannonAttackSpeedFromSelections(
      simSubmoduleSelections,
    ),
  }
}

export function serializeSubmoduleSelections(
  selections: WorkshopSubmoduleSelections,
): string {
  return JSON.stringify(selections)
}

export function parseSubmoduleSelectionsJson(raw: unknown): WorkshopSubmoduleSelections {
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed === '') return defaultWorkshopSubmoduleSelections()
    try {
      return sanitizeSubmoduleSelections(JSON.parse(trimmed))
    } catch {
      return defaultWorkshopSubmoduleSelections()
    }
  }
  return sanitizeSubmoduleSelections(raw)
}
