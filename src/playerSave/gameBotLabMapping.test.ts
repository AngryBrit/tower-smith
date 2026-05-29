import { describe, expect, it } from 'vitest'
import { botLabsToOverrides } from './mapPlayerDataToTower'
import type { DecodedPlayerSave } from './decodePlayerInfo'
import type { ResearchData } from '../types/research'

function botsResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'BOTS',
        sectionSlug: 'bots',
        items: [
          { name: 'Flame Bot - Cooldown', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Thunder Bot - Cooldown', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Golden Bot - Cooldown', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Amplify Bot - Cooldown', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Bot Bot - Cooldown', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Flame Bot - Burn Stack', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Thunder Bot - Linger Time', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Golden Bot - Duration', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Amplify Bot - Duration', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Bot Bot - Duration', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

function minimalSave(partial: Partial<DecodedPlayerSave> = {}): DecodedPlayerSave {
  const researchLevel = Array.from({ length: 250 }, () => 0)
  return {
    researchLevel,
    upgradeWorkshopLevel: [],
    upgradeWorkshopDefenseLevel: [],
    upgradeWorkshopUtilityLevel: [],
    enhancementLevel: [],
    enhancementDefenseLevel: [],
    enhancementUtilityLevel: [],
    cardLevel: [],
    currentWorkshopPreset: 0,
    relicsUnlocked: [],
    towerUnlocked: [],
    backgroundUnlocked: [],
    menuUnlocked: [],
    profileBannerUnlocked: [],
    guardianSkinUnlocked: [],
    guardianUnlocked: false,
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

describe('botLabsToOverrides', () => {
  it('maps Golden Bot - Cooldown from goldenBotLevelCooldownSelected', () => {
    const data = botsResearchData()
    const overrides = botLabsToOverrides(
      data,
      minimalSave({ goldenBotLevelCooldownSelected: 2 }),
    )
    expect(overrides['0-2']).toBe(2)
  })

  it('maps Golden Bot - Cooldown from researchLevel[104]', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[104] = 2
    const overrides = botLabsToOverrides(
      botsResearchData(),
      minimalSave({ researchLevel, goldenBotLevelCooldownSelected: 0 }),
    )
    expect(overrides['0-2']).toBe(2)
  })

  it('maps secondary bot labs from researchLevel ids 107–111', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[107] = 1
    researchLevel[108] = 10
    researchLevel[110] = 20
    researchLevel[111] = 19
    const overrides = botLabsToOverrides(botsResearchData(), minimalSave({ researchLevel }))
    expect(overrides['0-5']).toBe(1)
    expect(overrides['0-6']).toBe(10)
    expect(overrides['0-8']).toBe(20)
    expect(overrides['0-9']).toBe(19)
    expect(overrides['0-7']).toBeUndefined()
  })
})
