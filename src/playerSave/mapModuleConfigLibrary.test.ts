import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { workshopModuleConfigEntry } from '../data/workshopModuleConfigLibrary'
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

  it('builds library entries from inventory and equipped modules', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 10, level: 12, rarity: 6, effects: [1, 2, 3, 4] },
        { infoIndex: 22, level: 5, rarity: 5, effects: [] },
      ],
      moduleEquipped: [
        { infoIndex: 6, level: 99, rarity: 9, effects: [10, 11, 12, 13] },
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
      { infoIndex: 6, level: 50, rarity: 8, effects: [0, 1, 2, 3] },
      'main',
      0,
    )
    expect(entry).not.toBeNull()
    expect(entry!.submodules).toBeTruthy()
    expect(gameWorkshopChassisModuleId(6, 'cannon')).toBe('havocBringer')
  })
})
