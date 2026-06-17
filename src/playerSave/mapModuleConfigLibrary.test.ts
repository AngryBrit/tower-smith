import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { workshopModuleConfigEntry, workshopModuleIsOwned } from '../data/workshopModuleConfigLibrary'
import {
  applyModuleConfigLibraryFromPlayerSave,
  moduleConfigEntryFromDecodedItem,
  workshopSlotForModuleInfoIndex,
} from './mapModuleConfigLibrary'
import type { DecodedPlayerSave } from './decodePlayerInfo'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'

function minimalSave(partial: Partial<DecodedPlayerSave> = {}): DecodedPlayerSave {
  return {
    researchLevel: [],
    upgradeWorkshopLevel: [],
    upgradeWorkshopDefenseLevel: [],
    upgradeWorkshopUtilityLevel: [],
    enhancementLevel: [],
    enhancementDefenseLevel: [],
    enhancementUtilityLevel: [],
    cardLevel: [],
    cardUnlocked: [],
    slotsUnlocked: 0,
    currentCardPreset: 0,
    slotPresetCardInt: [],
    slotPresetCardAssignedBool: [],
    currentWorkshopPreset: 0,
    relicsUnlocked: [],
    towerUnlocked: [],
    backgroundUnlocked: [],
    menuUnlocked: [],
    profileBannerUnlocked: [],
    guardianSkinUnlocked: [],
    trackAvailable: [],
    guardianUnlocked: false,
    guardianSlotsUnlocked: 0,
    guardianChipSlot: [],
    guardianChipUnlocked: [],
    guardianChipLevel: [],
    selectedTower: 0,
    selectedBackground: 0,
    selectedMenu: 0,
    selectedProfileBanner: 0,
    guardianSkinIndex: 0,
    botsUnlocked: [],
    botsActive: [],
    botsLevel: [],
    currentBotPreset: 0,
    botPresets: {},
    flameBotLevelCooldownSelected: 0,
    thunderBotLevelCooldownSelected: 0,
    goldenBotLevelCooldownSelected: 0,
    amplifyBotLevelCooldownSelected: 0,
    botBotLevelCooldownSelected: 0,
    ultimateWeaponLevel: [],
    ultimateWeaponUnlocked: [],
    ultimateWeaponOn: [],
    ultimateWeaponPlusLevel: [],
    ultimateWeaponPlusUnlocked: [],
    moduleEquipped: [],
    moduleInventory: [],
    assistModuleSlots: [],
    assistModulesAvailable: false,
    lastGuildID: '',
    lastGuildSeason: 0,
    guildChestClaimedWeek: 0,
    hasSeenGuildChatDisclaimer: false,
    userName: '',
    fakeUserName: '',
    playfabID: '',
    ...partial,
  }
}

describe('mapModuleConfigLibrary', () => {
  it('resolves workshop slot from infoIndex', () => {
    expect(workshopSlotForModuleInfoIndex(10)).toEqual({
      slot: 'cannon',
      moduleId: 'astralDeliverance',
    })
    expect(workshopSlotForModuleInfoIndex(27)).toEqual({
      slot: 'generator',
      moduleId: 'blackHoleDigestor',
    })
    expect(workshopSlotForModuleInfoIndex(37)).toEqual({
      slot: 'core',
      moduleId: 'multiverseNexus',
    })
  })

  it('imports Wormhole Redirector from infoIndex 18 inventory', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 18, level: 12, rarity: 4, effects: [88, 81, 0, 0, 0, 0, 0, 0] },
      ],
    })
    const ws = defaultWorkshopPersisted()
    applyModuleConfigLibraryFromPlayerSave(ws, save)

    expect(workshopModuleConfigEntry(ws, 'armor', 'main', 'wormholeRedirector')).toMatchObject({
      level: 12,
      rarity: 'epic',
    })
    expect(workshopModuleConfigEntry(ws, 'armor', 'main', 'negativeMassProjector').level).toBe(0)
  })

  it('imports Havoc Bringer library entry from infoIndex 7 inventory', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 6, level: 1, rarity: 5, effects: [59, 40, 0, 0, 0, 0, 0, 0] },
        { infoIndex: 7, level: 1, rarity: 4, effects: [27, 19, 0, 0, 0, 0, 0, 0] },
      ],
    })
    const ws = defaultWorkshopPersisted()
    applyModuleConfigLibraryFromPlayerSave(ws, save)
    ws.moduleInventoryFromPlayerSave = true

    expect(workshopModuleIsOwned(ws, 'cannon', 'havocBringer')).toBe(true)
    const entry = workshopModuleConfigEntry(ws, 'cannon', 'main', 'havocBringer')
    expect(entry.submoduleSlots?.[0]).toMatchObject({
      effectId: 'damage-meter-m',
      rarity: 'epic',
    })
    expect(entry.submoduleSlots?.[1]).toMatchObject({
      effectId: 'attack-range-m',
      rarity: 'common',
    })
  })

  it('builds library entries from inventory and equipped modules', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 10, level: 12, rarity: 6, effects: [1, 2, 3, 4] },
        { infoIndex: 22, level: 5, rarity: 5, effects: [] },
      ],
      moduleEquipped: [
        { infoIndex: 7, level: 99, rarity: 9, effects: [10, 11, 12, 13] },
      ],
    })

    const ws = defaultWorkshopPersisted()
    applyModuleConfigLibraryFromPlayerSave(ws, save)

    expect(workshopModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance')).toMatchObject({
      level: 12,
      rarity: 'legendary',
    })
    expect(workshopModuleConfigEntry(ws, 'cannon', 'main', 'havocBringer')).toMatchObject({
      level: 99,
      rarity: 'mythic_plus',
    })
    expect(workshopModuleConfigEntry(ws, 'armor', 'main', 'sharpFortitude')).toMatchObject({
      level: 5,
      rarity: 'epic_plus',
    })
  })

  it('prefers higher level inventory duplicates for the same module', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 10, level: 5, rarity: 4, effects: [] },
        { infoIndex: 10, level: 20, rarity: 4, effects: [] },
      ],
    })
    const ws = defaultWorkshopPersisted()
    applyModuleConfigLibraryFromPlayerSave(ws, save)

    expect(workshopModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance').level).toBe(20)
  })

  it('maps submodule effects from decoded item', () => {
    const entry = moduleConfigEntryFromDecodedItem(
      'cannon',
      { infoIndex: 7, level: 50, rarity: 8, effects: [0, 1, 2, 3] },
      'main',
      0,
    )
    expect(entry).not.toBeNull()
    expect(entry!.submodules).toBeTruthy()
    expect(gameWorkshopChassisModuleId(7, 'cannon')).toBe('havocBringer')
  })
})
