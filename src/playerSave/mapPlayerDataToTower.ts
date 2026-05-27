import {
  defaultWorkshopPersisted,
  sanitizeWorkshopPersisted,
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { levelOverrideKey, type ResearchData } from '../types/research'
import { WORKSHOP_GAME_CARD_ORDER } from '../data/workshopGameCards'
import {
  WORKSHOP_BOT_ACTIVE_ORDER,
  WORKSHOP_BOT_OWNED_ORDER,
  WORKSHOP_BOT_UPGRADE_ORDER,
} from '../data/workshopBots'
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
import { gameResearchIdForManifest } from './gameResearchIndex'
import { gameModuleRarityToMergeTier } from './gameModuleRarity'
import {
  gameThemeIdAtIndex,
  gameThemeOwnedIdsFromUnlockArrays,
} from './gameThemeIndex'
import type { DecodedPlayerSave } from './decodePlayerInfo'
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

/** Map game `researchLevel[researchId]` → TowerSmith `sectionIndex-itemIndex` overrides. */
export function researchLevelsToOverrides(
  data: ResearchData,
  researchLevel: number[],
): Record<string, number> {
  const overrides: Record<string, number> = {}
  for (let si = 0; si < data.sections.length; si++) {
    const section = data.sections[si]!
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
  if (tower) partial.tower = tower
  if (background) partial.background = background
  if (menus) partial.menus = menus
  if (banners) partial.banners = banners
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
  mapArrayToWorkshop(save.upgradeLevel, GAME_ENHANCE_ATTACK_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.upgradeDefenseLevel, GAME_ENHANCE_DEFENSE_LEVEL_KEYS, ws)
  mapArrayToWorkshop(save.upgradeUtilityLevel, GAME_ENHANCE_UTILITY_LEVEL_KEYS, ws)

  mapArrayToWorkshop(save.botsLevel, WORKSHOP_BOT_UPGRADE_ORDER, ws)
  mapBoolArrayToWorkshop(save.botsUnlocked, WORKSHOP_BOT_OWNED_ORDER, ws)
  mapBoolArrayToWorkshop(save.botsActive, WORKSHOP_BOT_ACTIVE_ORDER, ws)

  mapUltimateWeaponsFromSave(save, ws)

  const stars = { ...ws.cardStars }
  for (let i = 0; i < WORKSHOP_GAME_CARD_ORDER.length; i++) {
    const cardId = WORKSHOP_GAME_CARD_ORDER[i]!
    const level = save.cardLevel[i]
    if (typeof level === 'number' && Number.isFinite(level)) {
      stars[cardId] = Math.max(0, Math.trunc(level))
    }
  }
  ws.cardStars = stars

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
  return {
    overrides: researchLevelsToOverrides(data, save.researchLevel),
    workshop: playerSaveToWorkshop(save),
    themes: playerSaveToThemes(save),
  }
}
