import type { WorkshopGameCardId } from '../data/workshopGameCards'
import { workshopBotOwnedKey } from '../data/workshopBots'
import { WORKSHOP_BOT_ORDER, WORKSHOP_BOT_SPECIAL_LEVEL_ORDER, WORKSHOP_BOT_UPGRADE_ORDER } from '../data/workshopBotsData'
import {
  ASSIST_CHASSIS_MODULE_ID_KEY,
  ASSIST_CHASSIS_MODULE_RARITY_KEY,
} from '../data/workshopAssistChassisModule'
import {
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_LEVEL_KEY,
  CHASSIS_MODULE_RARITY_KEY,
} from '../data/workshopChassisModuleSelection'
import { workshopUltimateOwnedKey, WORKSHOP_ULTIMATE_UPGRADE_ORDER } from '../data/workshopUltimate'
import { WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER } from '../data/workshopUltimatePlus'
import { WORKSHOP_ULTIMATE_WEAPON_ORDER } from '../data/workshopUltimateData'
import {
  ASSIST_MODULE_LEVEL_KEY,
  WORKSHOP_ASSIST_MODULE_SLOTS,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import {
  workshopSubmoduleOrderedSlots,
  type WorkshopSubmoduleModuleRole,
} from '../data/workshopSubmoduleSelection'
import { cardMasterySectionIndex } from '../data/workshopCardMastery'
import { WORKSHOP_GAME_CARD_ORDER } from '../data/workshopGameCards'
import { patchWorkshopModules } from '../data/workshopModulePresets'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { sanitizeWorkshopPersisted } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import type { CardStateFromSheet } from './cardStateFromSheet'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import { WORKSHOP_EP_ENHANCE_KEYS, WORKSHOP_EP_UPGRADE_KEYS } from './workshopSheetNames'

export function relicOwnedIdsAppliedToPersisted(
  base: WorkshopPersistedV1,
  relicOwnedIds: readonly string[],
): WorkshopPersistedV1 {
  return sanitizeWorkshopPersisted({ ...base, relicOwnedIds: [...relicOwnedIds] })
}

export function workshopLevelsAppliedToPersisted(
  base: WorkshopPersistedV1,
  levels: Readonly<Record<string, number>>,
): WorkshopPersistedV1 {
  const patch: Record<string, number> = {}
  for (const key of WORKSHOP_EP_UPGRADE_KEYS) {
    if (key in levels) patch[key] = levels[key]!
  }
  for (const key of WORKSHOP_EP_ENHANCE_KEYS) {
    if (key in levels) patch[key] = levels[key]!
  }
  return sanitizeWorkshopPersisted({ ...base, ...patch })
}

export function cardStateAppliedToPersisted(
  base: WorkshopPersistedV1,
  cardState: CardStateFromSheet,
): WorkshopPersistedV1 {
  return sanitizeWorkshopPersisted({
    ...base,
    cardStars: { ...base.cardStars, ...cardState.cardStars },
    cardEquipSlots: cardState.cardEquipSlots,
    cardPresetLoadouts: cardState.cardPresetLoadouts,
  })
}

export function labLevelOverridesFromBotLabLevels(
  data: ResearchData,
  labLevels: Readonly<Record<string, number>>,
): Record<string, number> {
  const si = data.sections.findIndex((section) => section.sectionSlug === 'bots')
  if (si < 0) return {}
  const section = data.sections[si]!
  const out: Record<string, number> = {}
  section.items.forEach((item, ii) => {
    const level = labLevels[item.name]
    if (typeof level === 'number' && Number.isFinite(level)) {
      out[`${si}-${ii}`] = Math.max(0, Math.trunc(level))
    }
  })
  return out
}

export function labLevelOverridesFromCardMasteryIds(
  data: ResearchData,
  cardMasteryUnlockedIds: readonly string[],
  existing: Readonly<Record<string, number>>,
): Record<string, number> {
  const si = cardMasterySectionIndex(data)
  if (si < 0) return { ...existing }
  const mastered = new Set(cardMasteryUnlockedIds)
  const out = { ...existing }
  WORKSHOP_GAME_CARD_ORDER.forEach((cardId, ii) => {
    const key = `${si}-${ii}`
    if (mastered.has(cardId)) {
      out[key] = Math.max(out[key] ?? 0, 1)
    } else if (out[key] === 1) {
      out[key] = 0
    }
  })
  return out
}

export function botsEpStateAppliedToPersisted(
  base: WorkshopPersistedV1,
  state: BotsEpSyncState,
): WorkshopPersistedV1 {
  const patch: Record<string, unknown> = { ...base }
  for (const key of WORKSHOP_BOT_UPGRADE_ORDER) {
    if (key in state.levels) patch[key] = state.levels[key]
  }
  for (const key of WORKSHOP_BOT_SPECIAL_LEVEL_ORDER) {
    if (key in state.levels) patch[key] = state.levels[key]
  }
  for (const botId of WORKSHOP_BOT_ORDER) {
    patch[workshopBotOwnedKey(botId)] = state.ownedByBotId[botId] === true
  }
  return sanitizeWorkshopPersisted(patch)
}

export function uwsEpStateAppliedToPersisted(
  base: WorkshopPersistedV1,
  state: UwsEpSyncState,
): WorkshopPersistedV1 {
  const patch: Record<string, unknown> = { ...base }
  for (const key of WORKSHOP_ULTIMATE_UPGRADE_ORDER) {
    if (key in state.levels) patch[key] = state.levels[key]
  }
  for (const key of WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER) {
    if (key in state.levels) patch[key] = state.levels[key]
  }
  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    patch[workshopUltimateOwnedKey(weaponId)] = state.ownedByWeaponId[weaponId] === true
  }
  return sanitizeWorkshopPersisted(patch)
}

function submoduleSelectionsForRole(
  base: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
  substats: ModulesEpSyncState['modules'][number]['substats'],
): WorkshopPersistedV1['simSubmoduleSelections'] {
  const selections = { ...base.simSubmoduleSelections }
  const section = { ...selections[slot] }
  const roleKey = role === 'main' ? 'main' : 'assist'
  const map = { ...(section[roleKey] ?? {}) }
  const ordered = workshopSubmoduleOrderedSlots({ simSubmoduleSelections: selections }, slot, role)

  for (let i = 0; i < ordered.length; i += 1) {
    const pick = ordered[i]
    if (!pick) continue
    delete map[pick.effectId]
  }

  for (const sub of substats) {
    map[sub.effectId] = sub.rarity
  }

  section[roleKey] = map
  selections[slot] = section
  return selections
}

export function modulesEpStateAppliedToPersisted(
  base: WorkshopPersistedV1,
  state: ModulesEpSyncState,
): WorkshopPersistedV1 {
  const patch: WorkshopPersistedV1 = { ...base }

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    patch[CHASSIS_MODULE_ID_KEY[slot]] = ''
    patch[CHASSIS_MODULE_RARITY_KEY[slot]] = 'rare'
    patch[CHASSIS_MODULE_LEVEL_KEY[slot]] = 0
    patch[ASSIST_CHASSIS_MODULE_ID_KEY[slot]] = ''
    patch[ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]] = 'rare'
    patch[ASSIST_MODULE_LEVEL_KEY[slot]] = 0
  }

  patch.simSubmoduleSelections = { ...base.simSubmoduleSelections }

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const levels = state.sectionLevels[slot]
    if (levels) {
      patch[CHASSIS_MODULE_LEVEL_KEY[slot]] = levels.highestPrimaryLevel
      patch[ASSIST_MODULE_LEVEL_KEY[slot]] = levels.highestAssistLevel
    }
  }

  for (const equipped of state.modules) {
    const { hubSlot: slot, role, moduleId, mergeTier, level, substats } = equipped
    if (role === 'main') {
      patch[CHASSIS_MODULE_ID_KEY[slot]] = moduleId
      patch[CHASSIS_MODULE_RARITY_KEY[slot]] = mergeTier
      patch[CHASSIS_MODULE_LEVEL_KEY[slot]] = level
      patch.simSubmoduleSelections = submoduleSelectionsForRole(patch, slot, 'main', substats)
    } else {
      patch[ASSIST_CHASSIS_MODULE_ID_KEY[slot]] = moduleId
      patch[ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]] = mergeTier
      patch[ASSIST_MODULE_LEVEL_KEY[slot]] = level
      patch.simSubmoduleSelections = submoduleSelectionsForRole(patch, slot, 'assist', substats)
    }
  }

  // sanitizeWorkshopPersisted reapplies the active module preset tab over live sim fields;
  // sync the active preset from imported live fields instead (same as WorkshopModulesPanel).
  const sanitizedLive = sanitizeWorkshopPersisted({
    ...patch,
    modulePresetSnapshots: undefined,
  })
  return patchWorkshopModules(sanitizedLive, {})
}

export type { WorkshopGameCardId }
