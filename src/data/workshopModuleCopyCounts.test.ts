import { describe, expect, it } from 'vitest'
import type { DecodedPlayerSave } from '../playerSave/decodePlayerInfo'
import {
  buildModuleCopyCountsFromPlayerSave,
  isSignificantModuleCopy,
  sortModuleCopyInstances,
  workshopModuleCopySummary,
} from './workshopModuleCopyCounts'
import { defaultWorkshopPersisted } from '../labPresetsStorage'

const ZERO_EFFECTS = [0, 0, 0, 0, 0, 0, 0, 0] as const

function minimalSave(
  partial: Partial<DecodedPlayerSave> = {},
): DecodedPlayerSave {
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
    moduleEquipped: [null, null, null, null],
    moduleInventory: [],
    assistModuleSlots: [],
    assistModulesAvailable: false,
    lastGuildID: '',
    lastGuildSeason: 0,
    guildChestClaimedWeek: 0,
    ...partial,
  }
}

describe('workshopModuleCopyCounts', () => {
  it('counts inventory duplicates and equipped copies', () => {
    const save = minimalSave({
      moduleInventory: [
        { infoIndex: 10, level: 5, rarity: 4, effects: [...ZERO_EFFECTS] },
        { infoIndex: 10, level: 20, rarity: 4, effects: [...ZERO_EFFECTS] },
        { infoIndex: 10, level: 120, rarity: 15, effects: [...ZERO_EFFECTS] },
      ],
      moduleEquipped: [
        { infoIndex: 10, level: 80, rarity: 8, effects: [...ZERO_EFFECTS] },
        null,
        null,
        null,
      ],
    })

    const counts = buildModuleCopyCountsFromPlayerSave(save)
    expect(counts.cannon.astralDeliverance).toMatchObject({ count: 4 })
    expect(counts.cannon.astralDeliverance!.copies).toHaveLength(4)
    expect(counts.cannon.astralDeliverance!.copies[0]).toMatchObject({
      rarity: 'star_5',
      level: 120,
    })
  })

  it('ignores inventory fodder whose substats belong to a different chassis slot', () => {
    const save = minimalSave({
      moduleInventory: [
        ...Array.from({ length: 10 }, () => ({
          infoIndex: 23,
          level: 1,
          rarity: 5,
          effects: [191, 161, 0, 0, 0, 0, 0, 0],
        })),
        {
          infoIndex: 46,
          level: 60,
          rarity: 4,
          effects: [89, 83, 147, 0, 0, 0, 0, 0],
        },
        { infoIndex: 23, level: 1, rarity: 4, effects: [180, 192, 0, 0, 0, 0, 0, 0] },
        { infoIndex: 23, level: 1, rarity: 3, effects: [156, 180, 0, 0, 0, 0, 0, 0] },
        { infoIndex: 23, level: 1, rarity: 2, effects: [161, 167, 0, 0, 0, 0, 0, 0] },
      ],
    })

    expect(buildModuleCopyCountsFromPlayerSave(save).armor.orbitalAugment?.count).toBe(1)
  })

  it('does not double-count equipped modules already listed in inventory', () => {
    const equipped = {
      infoIndex: 23,
      level: 60,
      rarity: 4,
      effects: [92, 149, 86, 139, 0, 0, 0, 0],
    }
    const save = minimalSave({
      moduleInventory: [equipped],
      moduleEquipped: [null, null, null, null],
      assistModuleSlots: [{ unlocked: true, equipped, uniqueEffectEfficiencyLevel: 0, mainEffectEfficiencyLevel: 0, substatEfficiencyLevel: 0 }],
    })

    expect(buildModuleCopyCountsFromPlayerSave(save).armor.orbitalAugment?.count).toBe(1)
  })

  it('counts a level-1 copy when submodule rolls are present', () => {
    expect(
      isSignificantModuleCopy({
        infoIndex: 23,
        level: 1,
        rarity: 4,
        effects: [92, 0, 0, 0, 0, 0, 0, 0],
      }),
    ).toBe(true)
  })

  it('sorts copies by merge tier then level', () => {
    const sorted = sortModuleCopyInstances([
      { rarity: 'epic', level: 99 },
      { rarity: 'star_5', level: 10 },
      { rarity: 'legendary', level: 50 },
    ])
    expect(sorted.map((c) => c.rarity)).toEqual(['star_5', 'legendary', 'epic'])
  })

  it('exposes summary from persisted workshop when imported', () => {
    const ws = defaultWorkshopPersisted()
    ws.moduleInventoryFromPlayerSave = true
    ws.simChassisModuleCopyCounts = buildModuleCopyCountsFromPlayerSave(
      minimalSave({
        moduleInventory: [
          { infoIndex: 10, level: 5, rarity: 4, effects: [...ZERO_EFFECTS] },
          { infoIndex: 10, level: 20, rarity: 4, effects: [...ZERO_EFFECTS] },
        ],
      }),
    )

    expect(workshopModuleCopySummary(ws, 'cannon', 'astralDeliverance')?.count).toBe(2)
    expect(workshopModuleCopySummary(ws, 'cannon', 'missing')).toBeNull()
  })
})
