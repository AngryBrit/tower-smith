import {
  defaultWorkshopPersisted,
  sanitizeWorkshopPersisted,
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { levelOverrideKey, type ResearchData } from '../types/research'
import { clampWorkshopCardEquipSlots } from '../data/workshopGameCardWiki'
import { mapCardStarsFromSave } from './cardSaveSlotMap'
import {
  WORKSHOP_BOT_ACTIVE_ORDER,
  WORKSHOP_BOT_OWNED_ORDER,
  WORKSHOP_BOT_UPGRADE_ORDER,
  workshopBotActiveKey,
  workshopBotOwnedKey,
} from '../data/workshopBots'
import {
  WORKSHOP_BOT_WEAPON_STATS,
  type WorkshopBotId,
} from '../data/workshopBotsData'
import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  botSaveLevelIndex,
} from './gameBotPresetMapping'
import { workshopRelicIdAtGameIndex } from './gameRelicMapping'
import { mapUltimateWeaponsFromSave } from './gameUltimateWeaponMapping'
import { clampWorkshopAssistModuleLevel } from '../data/workshopSimModules'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'
import {
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_RARITY_KEY,
} from '../data/workshopChassisModuleSelection'
import {
  GAME_ENHANCE_ATTACK_LEVEL_KEYS,
  GAME_ENHANCE_DEFENSE_LEVEL_KEYS,
  GAME_ENHANCE_UTILITY_LEVEL_KEYS,
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
} from './gameWorkshopMapping'
import { ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameAttackResearchMapping'
import { DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameDefenseResearchMapping'
import { MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameMainResearchMapping'
import { MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameModulesResearchMapping'
import { UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameUtilityResearchMapping'
import { ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME } from './gameUltimateResearchMapping'
import {
  BOT_COOLDOWN_LAB_SAVE_FIELD,
  BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME,
  BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME,
  type BotCooldownLabName,
  type BotResearchLabName,
} from './gameBotLabMapping'
import { gameResearchIdForManifest } from './gameResearchIndex'
import { gameModuleRarityToMergeTier } from './gameModuleRarity'
import {
  gameThemeIdAtIndex,
  gameThemeOwnedIdsFromUnlockArrays,
} from './gameThemeIndex'
import type { DecodedPlayerSave, DecodedUserBotData } from './decodePlayerInfo'
import { sanitizeThemeOwnedIds, type TowerThemesSnapshot } from '../towerDataThemes'
import type { ThemeSelectionState } from '../themeSelectionStorage'

const RELIC_UNLOCKED = 2

const MODULE_SLOTS: readonly WorkshopAssistModuleSlot[] = [
  'cannon',
  'armor',
  'generator',
  'core',
]

function mapArrayToWorkshop(
  levels: number[],
  keys: readonly (keyof WorkshopPersistedV1)[],
  ws: WorkshopPersistedV1,
): void {
  const patch: Partial<WorkshopPersistedV1> = {}
  const n = Math.min(levels.length, keys.length)
  for (let i = 0; i < n; i++) {
    const key = keys[i]!
    const level = levels[i]
    if (typeof level === 'number' && Number.isFinite(level)) {
      patch[key] = Math.max(0, Math.trunc(level)) as never
    }
  }
  Object.assign(ws, patch)
}

function mapBoolArrayToWorkshop(
  flags: boolean[],
  keys: readonly (keyof WorkshopPersistedV1)[],
  ws: WorkshopPersistedV1,
): void {
  const patch: Partial<WorkshopPersistedV1> = {}
  const n = Math.min(flags.length, keys.length)
  for (let i = 0; i < n; i++) {
    patch[keys[i]!] = (flags[i] === true) as never
  }
  Object.assign(ws, patch)
}

/** Lab sections that do not use `researchLevel[]` in the game save. */
const RESEARCH_LEVEL_IMPORT_SKIP_SLUGS = new Set(['card-mastery'])

function findSectionIndex(data: ResearchData, slug: string): number {
  return data.sections.findIndex((s) => s.sectionSlug === slug)
}

function findItemIndex(section: ResearchData['sections'][number], name: string): number {
  return section.items.findIndex((item) => item.name === name)
}

/** Map attack labs with confirmed `researchLevel[id]` anchors (see gameAttackResearchMapping.ts). */
export function attackLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'attack-research')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map main labs with confirmed `researchLevel[id]` anchors (see gameMainResearchMapping.ts). */
export function mainLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'main-research')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map modules labs with confirmed `researchLevel[id]` anchors (see gameModulesResearchMapping.ts). */
export function modulesLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'modules')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map ultimate weapon labs with confirmed `researchLevel[id]` anchors. */
export function ultimateLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'ultimate-weapon-research')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map utility labs with confirmed `researchLevel[id]` anchors (see gameUtilityResearchMapping.ts). */
export function utilityLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'utility-research')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map defense labs with confirmed `researchLevel[id]` anchors (see gameDefenseResearchMapping.ts). */
export function defenseLabsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'defense-research')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, researchId] of Object.entries(DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    keyof typeof DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map BOTS lab section from dedicated cooldown fields + bot `researchLevel` ids. */
export function botLabsToOverrides(
  data: ResearchData,
  save: DecodedPlayerSave,
): Record<string, number> {
  const overrides: Record<string, number> = {}
  const si = findSectionIndex(data, 'bots')
  if (si < 0) return overrides
  const section = data.sections[si]!

  for (const [name, field] of Object.entries(BOT_COOLDOWN_LAB_SAVE_FIELD) as [
    BotCooldownLabName,
    keyof DecodedPlayerSave,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const researchId = BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME[name]
    const fromField = save[field]
    const fromResearch =
      researchId != null ? save.researchLevel[researchId] : undefined
    let level = 0
    if (typeof fromField === 'number' && Number.isFinite(fromField)) {
      level = Math.trunc(fromField)
    }
    if (typeof fromResearch === 'number' && Number.isFinite(fromResearch)) {
      level = Math.max(level, Math.trunc(fromResearch))
    }
    if (level > 0) {
      overrides[levelOverrideKey(si, ii)] = level
    }
  }

  for (const [name, researchId] of Object.entries(BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME) as [
    BotResearchLabName,
    number,
  ][]) {
    const ii = findItemIndex(section, name)
    if (ii < 0) continue
    const level = save.researchLevel[researchId]
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
    }
  }

  return overrides
}

/** Map game `researchLevel[researchId]` → TowerSmith `sectionIndex-itemIndex` overrides. */
export function researchLevelsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  for (let si = 0; si < data.sections.length; si++) {
    const section = data.sections[si]!
    if (
      section.sectionSlug === 'bots' ||
      section.sectionSlug === 'main-research' ||
      section.sectionSlug === 'attack-research' ||
      section.sectionSlug === 'defense-research' ||
      section.sectionSlug === 'utility-research' ||
      section.sectionSlug === 'ultimate-weapon-research' ||
      section.sectionSlug === 'modules'
    ) {
      continue
    }
    if (section.sectionSlug && RESEARCH_LEVEL_IMPORT_SKIP_SLUGS.has(section.sectionSlug)) {
      continue
    }
    for (let ii = 0; ii < section.items.length; ii++) {
      const researchId = gameResearchIdForManifest(data, si, ii)
      if (researchId == null) continue
      const level = researchLevel[researchId]
      if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
        overrides[levelOverrideKey(si, ii)] = Math.trunc(level)
      }
    }
  }
  return overrides
}

function activeBotPresetSlot(
  save: DecodedPlayerSave,
  botId: WorkshopBotId,
): DecodedUserBotData | null {
  const presets = save.botPresets[botId]
  if (!presets?.length) return null
  const idx = Math.max(0, Math.min(save.currentBotPreset, presets.length - 1))
  return presets[idx] ?? presets.find((p) => p.active) ?? presets[0] ?? null
}

/** Medal bot upgrades from `*BotPresets` lists (v28+); overrides legacy `botsLevel` / `botsUnlocked`. */
export function applyBotPresetsToWorkshop(
  save: DecodedPlayerSave,
  ws: WorkshopPersistedV1,
): void {
  const hasPresets = WORKSHOP_BOT_ORDER.some((id) => (save.botPresets[id]?.length ?? 0) > 0)
  if (!hasPresets) return

  for (const botId of WORKSHOP_BOT_ORDER) {
    const slot = activeBotPresetSlot(save, botId)
    if (!slot) continue

    ws[workshopBotOwnedKey(botId)] = slot.unlocked as never
    ws[workshopBotActiveKey(botId)] = slot.active as never

    const levelRow =
      slot.selectedLevels.length >= WORKSHOP_BOT_WEAPON_STATS[botId].length
        ? slot.selectedLevels
        : slot.levels

    WORKSHOP_BOT_WEAPON_STATS[botId].forEach((stat, statIndex) => {
      const saveIndex = botSaveLevelIndex(botId, stat.key, statIndex)
      const level = levelRow[saveIndex]
      if (typeof level === 'number' && Number.isFinite(level)) {
        ws[stat.key] = Math.max(0, Math.trunc(level)) as never
      }
    })

    const specialKey = WORKSHOP_BOT_SPECIAL_BY_BOT[botId]
    const specialLevelKey = WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT[botId]
    ws[specialKey] = slot.plusUnlocked as never
    if (slot.plusUnlocked && slot.plusLevel > 0) {
      ws[specialLevelKey] = Math.trunc(slot.plusLevel) as never
    }
  }
}

export function relicIndicesToOwnedIds(relicsUnlocked: number[]): string[] {
  const owned: string[] = []
  const seen = new Set<string>()
  for (let i = 0; i < relicsUnlocked.length; i++) {
    if (relicsUnlocked[i] !== RELIC_UNLOCKED) continue
    const id = workshopRelicIdAtGameIndex(i)
    if (!id || seen.has(id)) continue
    seen.add(id)
    owned.push(id)
  }
  return owned
}

export function playerSaveToThemes(save: DecodedPlayerSave): TowerThemesSnapshot {
  const ownedIds = gameThemeOwnedIdsFromUnlockArrays(save)
  const partial: Partial<ThemeSelectionState> = {}
  const tower = gameThemeIdAtIndex('tower', save.selectedTower)
  const background = gameThemeIdAtIndex('background', save.selectedBackground)
  const menus = gameThemeIdAtIndex('menus', save.selectedMenu)
  const banners = gameThemeIdAtIndex('banners', save.selectedProfileBanner)
  const guardian = gameThemeIdAtIndex('guardian', save.guardianSkinIndex)
  if (tower) partial.tower = tower
  if (background) partial.background = background
  if (menus) partial.menus = menus
  if (banners) partial.banners = banners
  if (guardian) partial.guardian = guardian
  const hasSelection = Object.keys(partial).length > 0
  return {
    ownedIds: sanitizeThemeOwnedIds(ownedIds),
    ...(hasSelection ? { selection: partial as ThemeSelectionState } : {}),
  }
}

function setModuleLevel(ws: WorkshopPersistedV1, slot: WorkshopAssistModuleSlot, level: number): void {
  const v = clampWorkshopAssistModuleLevel(level)
  switch (slot) {
    case 'cannon':
      ws.simCannonModuleLevel = v
      break
    case 'armor':
      ws.simArmorModuleLevel = v
      break
    case 'generator':
      ws.simGeneratorModuleLevel = v
      break
    case 'core':
      ws.simCoreModuleLevel = v
      break
  }
}

function applyModuleEquipped(
  ws: WorkshopPersistedV1,
  equipped: DecodedPlayerSave['moduleEquipped'],
): void {
  for (let i = 0; i < MODULE_SLOTS.length; i++) {
    const slot = MODULE_SLOTS[i]!
    const item = equipped[i]
    if (!item) continue
    setModuleLevel(ws, slot, item.level)
    const merge = gameModuleRarityToMergeTier(item.rarity)
    if (merge) {
      ws[CHASSIS_MODULE_RARITY_KEY[slot]] = merge
    }
    void CHASSIS_MODULE_ID_KEY[slot]
    void item.infoIndex // chassis id mapping not yet implemented
  }
}

export function playerSaveToWorkshop(save: DecodedPlayerSave): WorkshopPersistedV1 {
  const ws = defaultWorkshopPersisted()
  mapArrayToWorkshop(save.upgradeWorkshopLevel, GAME_WORKSHOP_ATTACK_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.upgradeWorkshopDefenseLevel, GAME_WORKSHOP_DEFENSE_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.upgradeWorkshopUtilityLevel, GAME_WORKSHOP_UTILITY_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.enhancementLevel, GAME_ENHANCE_ATTACK_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.enhancementDefenseLevel, GAME_ENHANCE_DEFENSE_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.enhancementUtilityLevel, GAME_ENHANCE_UTILITY_LEVEL_KEYS, ws)

  mapArrayToWorkshop(save.botsLevel, WORKSHOP_BOT_UPGRADE_ORDER, ws)
  mapBoolArrayToWorkshop(save.botsUnlocked, WORKSHOP_BOT_OWNED_ORDER, ws)
  mapBoolArrayToWorkshop(save.botsActive, WORKSHOP_BOT_ACTIVE_ORDER, ws)
  applyBotPresetsToWorkshop(save, ws)

  mapUltimateWeaponsFromSave(save, ws)

  ws.cardStars = mapCardStarsFromSave(save.cardLevel, save.cardUnlocked)
  ws.cardEquipSlots = clampWorkshopCardEquipSlots(save.slotsUnlocked)

  ws.relicOwnedIds = relicIndicesToOwnedIds(save.relicsUnlocked)

  applyModuleEquipped(ws, save.moduleEquipped)

  return sanitizeWorkshopPersisted(ws)
}

export function mapPlayerSaveToTower(
  data: ResearchData,
  save: DecodedPlayerSave,
): {
  overrides: Record<string, number>
  workshop: WorkshopPersistedV1
  themes: TowerThemesSnapshot
} {
  const overrides = {
    ...researchLevelsToOverrides(data, save.researchLevel),
    ...mainLabsToOverrides(data, save.researchLevel),
    ...attackLabsToOverrides(data, save.researchLevel),
    ...defenseLabsToOverrides(data, save.researchLevel),
    ...utilityLabsToOverrides(data, save.researchLevel),
    ...ultimateLabsToOverrides(data, save.researchLevel),
    ...modulesLabsToOverrides(data, save.researchLevel),
    ...botLabsToOverrides(data, save),
  }
  return {
    overrides,
    workshop: playerSaveToWorkshop(save),
    themes: playerSaveToThemes(save),
  }
}
