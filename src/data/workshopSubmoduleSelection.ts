/**
 * Equipped sub-module effect picks per chassis slot (wiki Sub-Module Effects tables).
 * Main and assist modules each have their own sub-effect slots.
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'
import {
  parseSubmoduleCellNumber,
  WORKSHOP_SUBMODULE_SECTIONS,
  WORKSHOP_SUBMODULE_SLOT_COUNT,
  submoduleEffectId,
  workshopSubmoduleSlotUnlocked,
} from './workshopSubmoduleCatalog'
import {
  workshopAssistChassisModuleSelection,
} from './workshopAssistChassisModule'
import {
  workshopChassisModuleLevel,
  workshopChassisModuleSelection,
} from './workshopChassisModuleSelection'
import type { WorkshopChassisModuleMergeTier } from './workshopChassisModuleShared'
import { workshopAssistModuleLevel } from './workshopSimModules'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'
import type { WorkshopSubmoduleBonusContext } from './workshopAssistSubmoduleScale'
import { scaleAssistSubmoduleValueForSlot } from './workshopAssistSubmoduleScale'

export { submoduleEffectId } from './workshopSubmoduleCatalog'

export const CANNON_ATTACK_SPEED_EFFECT_ID = submoduleEffectId('Attack Speed')

export type WorkshopSubmoduleModuleRole = 'main' | 'assist'

export type WorkshopSubmoduleSelectionMap = Partial<
  Record<string, WorkshopSubmoduleRarity>
>

export type WorkshopSubmoduleEffectPick = {
  effectId: string
  rarity: WorkshopSubmoduleRarity
}

/** In-game sub-effect slot order (8 positions; null = empty). */
export type WorkshopSubmoduleOrderedSlots = (WorkshopSubmoduleEffectPick | null)[]

/** Sub-module picks for one hub slot (primary module + assist copy). */
export type WorkshopSubmoduleSlotSelections = {
  main: WorkshopSubmoduleSelectionMap
  assist: WorkshopSubmoduleSelectionMap
  /** Save slot order for main module picker (optional; legacy maps compact into slot 0…n). */
  mainSlots?: WorkshopSubmoduleOrderedSlots
  /** Save slot order for assist module picker. */
  assistSlots?: WorkshopSubmoduleOrderedSlots
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

export function emptySubmoduleOrderedSlots(): WorkshopSubmoduleOrderedSlots {
  return Array.from({ length: WORKSHOP_SUBMODULE_SLOT_COUNT }, () => null)
}

export function selectionMapFromOrderedSlots(
  ordered: WorkshopSubmoduleOrderedSlots,
): WorkshopSubmoduleSelectionMap {
  const out: WorkshopSubmoduleSelectionMap = {}
  for (const pick of ordered) {
    if (pick == null) continue
    out[pick.effectId] = pick.rarity
  }
  return out
}

/** Slot index (0-based) for an equipped sub-effect, or null if not found. */
export function submoduleEffectSlotIndex(
  orderedSlots: WorkshopSubmoduleOrderedSlots | undefined,
  map: WorkshopSubmoduleSelectionMap,
  effectId: string,
): number | null {
  const ordered = orderedSlots ?? orderedSlotsFromSelectionMap(map)
  for (let i = 0; i < ordered.length; i++) {
    if (ordered[i]?.effectId === effectId) return i
  }
  return null
}

/** Whether an equipped sub-effect counts at `moduleLevel` (slot unlock + rarity cap). */
export function submoduleEffectActiveAtModuleLevel(
  slotSelections: WorkshopSubmoduleSlotSelections,
  _slot: WorkshopAssistModuleSlot,
  effectId: string,
  role: WorkshopSubmoduleModuleRole,
  moduleLevel: number,
  moduleRarity: WorkshopChassisModuleMergeTier,
): boolean {
  const map = role === 'main' ? slotSelections.main : slotSelections.assist
  if (map[effectId] == null) return false
  const ordered = role === 'main' ? slotSelections.mainSlots : slotSelections.assistSlots
  const slotIndex = submoduleEffectSlotIndex(ordered, map, effectId)
  if (slotIndex == null) return true
  return workshopSubmoduleSlotUnlocked(slotIndex, moduleLevel, moduleRarity)
}

/** Legacy flat map → first N picker slots (no gaps). */
export function orderedSlotsFromSelectionMap(
  map: WorkshopSubmoduleSelectionMap,
): WorkshopSubmoduleOrderedSlots {
  const out = emptySubmoduleOrderedSlots()
  let i = 0
  for (const [effectId, rarity] of Object.entries(map)) {
    if (rarity == null || i >= out.length) break
    out[i++] = { effectId, rarity }
  }
  return out
}

function sanitizeOrderedSlots(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
  _map: WorkshopSubmoduleSelectionMap,
): WorkshopSubmoduleOrderedSlots | undefined {
  if (!Array.isArray(raw)) return undefined
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const validIds = new Set(section.rows.map((row) => submoduleEffectId(row.label)))
  const out = emptySubmoduleOrderedSlots()
  let any = false
  for (let i = 0; i < Math.min(raw.length, out.length); i++) {
    const el = raw[i]
    if (el == null || typeof el !== 'object' || Array.isArray(el)) continue
    const effectId = (el as { effectId?: unknown }).effectId
    const rarity = (el as { rarity?: unknown }).rarity
    if (typeof effectId !== 'string' || !validIds.has(effectId) || !isSubmoduleRarity(rarity)) {
      continue
    }
    out[i] = { effectId, rarity }
    any = true
  }
  return any ? out : undefined
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
  const main = sanitizeSubmoduleSelectionMap(slot, o.main)
  const assist = sanitizeSubmoduleSelectionMap(slot, o.assist)
  return {
    main,
    assist,
    mainSlots: sanitizeOrderedSlots(slot, o.mainSlots, main),
    assistSlots: sanitizeOrderedSlots(slot, o.assistSlots, assist),
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

export function workshopSubmoduleOrderedSlots(
  ws: Pick<WorkshopPersistedV1, 'simSubmoduleSelections'>,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole = 'main',
): WorkshopSubmoduleOrderedSlots {
  const slotSelections = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  const map = slotSelections[role] ?? {}
  const ordered =
    role === 'main' ? slotSelections.mainSlots : slotSelections.assistSlots
  return ordered ?? orderedSlotsFromSelectionMap(map)
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
  let main = cannonSubmoduleAttackSpeedFromSelections(slot.main)
  if (ctx != null && main !== 0) {
    if (
      !submoduleEffectActiveAtModuleLevel(
        slot,
        'cannon',
        CANNON_ATTACK_SPEED_EFFECT_ID,
        'main',
        workshopChassisModuleLevel(ctx.ws, 'cannon'),
        workshopChassisModuleSelection(ctx.ws, 'cannon').rarity,
      )
    ) {
      main = 0
    }
  }
  let assistRaw = cannonSubmoduleAttackSpeedFromSelections(slot.assist)
  if (ctx != null) {
    if (
      assistRaw !== 0 &&
      !submoduleEffectActiveAtModuleLevel(
        slot,
        'cannon',
        CANNON_ATTACK_SPEED_EFFECT_ID,
        'assist',
        workshopAssistModuleLevel(ctx.ws, 'cannon'),
        workshopAssistChassisModuleSelection(ctx.ws, 'cannon').rarity,
      )
    ) {
      assistRaw = 0
    }
    assistRaw = scaleAssistSubmoduleValueForSlot(
      ctx.ws,
      'cannon',
      assistRaw,
      CANNON_ATTACK_SPEED_EFFECT_ID,
      ctx.research,
      ctx.labOverrides,
    )
  }
  return main + assistRaw
}

function orderedSlotsAfterToggle(
  prevOrdered: WorkshopSubmoduleOrderedSlots | undefined,
  prevMap: WorkshopSubmoduleSelectionMap,
  nextMap: WorkshopSubmoduleSelectionMap,
  toggledEffectId: string,
): WorkshopSubmoduleOrderedSlots {
  const ordered = prevOrdered ?? orderedSlotsFromSelectionMap(prevMap)
  const next = emptySubmoduleOrderedSlots()
  for (let i = 0; i < ordered.length; i++) {
    const pick = ordered[i]
    if (pick == null) continue
    const rarity = nextMap[pick.effectId]
    if (rarity != null) next[i] = { effectId: pick.effectId, rarity }
  }
  if (nextMap[toggledEffectId] != null) {
    const already = next.some((pick) => pick?.effectId === toggledEffectId)
    if (!already) {
      const idx = next.findIndex((pick) => pick == null)
      if (idx >= 0) {
        next[idx] = { effectId: toggledEffectId, rarity: nextMap[toggledEffectId]! }
      }
    }
  }
  return next
}

export function toggleSubmoduleSelectionWithOrder(
  current: WorkshopSubmoduleSelectionMap,
  ordered: WorkshopSubmoduleOrderedSlots | undefined,
  effectId: string,
  rarity: WorkshopSubmoduleRarity,
  cellValue: string | null,
): {
  selections: WorkshopSubmoduleSelectionMap
  orderedSlots: WorkshopSubmoduleOrderedSlots
} {
  const selections = toggleSubmoduleSelection(current, effectId, rarity, cellValue)
  return {
    selections,
    orderedSlots: orderedSlotsAfterToggle(ordered, current, selections, effectId),
  }
}

export function workshopPersistedWithSubmoduleSelections(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  roleSelections: WorkshopSubmoduleSelectionMap,
  toggledEffectId?: string,
  orderedSlotsOverride?: WorkshopSubmoduleOrderedSlots,
): WorkshopPersistedV1 {
  const prev = ws.simSubmoduleSelections[slot] ?? defaultWorkshopSubmoduleSlotSelections()
  const nextSlot: WorkshopSubmoduleSlotSelections = {
    main: role === 'main' ? roleSelections : prev.main,
    assist: role === 'assist' ? roleSelections : prev.assist,
    mainSlots:
      role === 'main'
        ? orderedSlotsOverride ??
          (toggledEffectId != null
            ? orderedSlotsAfterToggle(prev.mainSlots, prev.main, roleSelections, toggledEffectId)
            : prev.mainSlots)
        : prev.mainSlots,
    assistSlots:
      role === 'assist'
        ? orderedSlotsOverride ??
          (toggledEffectId != null
            ? orderedSlotsAfterToggle(prev.assistSlots, prev.assist, roleSelections, toggledEffectId)
            : prev.assistSlots)
        : prev.assistSlots,
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
