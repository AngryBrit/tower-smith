import { describe, expect, it } from 'vitest'
import type { DecodedPlayerSave } from './decodePlayerInfo'
import { playerSaveToWorkshop } from './mapPlayerDataToTower'

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
    currentWorkshopPreset: 0,
    relicsUnlocked: [],
    towerUnlocked: [],
    backgroundUnlocked: [],
    menuUnlocked: [],
    profileBannerUnlocked: [],
    selectedTower: 0,
    selectedBackground: 0,
    selectedMenu: 0,
    selectedProfileBanner: 0,
    botsUnlocked: [],
    botsActive: [],
    botsLevel: [],
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

describe('playerSaveToWorkshop', () => {
  it('maps defense enhancements from enhancementDefenseLevel (not upgradeDefenseLevel)', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        enhancementDefenseLevel: [49, 49, 27, 34, 49, 0],
        // Legacy workshop defense array — must not be used for enhancements.
        upgradeWorkshopDefenseLevel: [5600, 5900, 99, 5000, 99, 80],
      }),
    )
    expect(ws.enhanceHealthLevel).toBe(49)
    expect(ws.enhanceHealthRegenLevel).toBe(49)
    expect(ws.enhanceDefenseAbsoluteLevel).toBe(27)
    expect(ws.enhanceLandMineDamageLevel).toBe(34)
    expect(ws.enhanceWallHealthLevel).toBe(49)
    expect(ws.enhanceOrbSizeLevel).toBe(0)
    expect(ws.healthLevel).toBe(5600)
    expect(ws.healthRegenLevel).toBe(5900)
  })

  it('maps attack enhancements from enhancementLevel', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        enhancementLevel: [49, 49, 44, 44, 0, 0],
      }),
    )
    expect(ws.enhanceDamageLevel).toBe(49)
    expect(ws.enhanceRendArmorLevel).toBe(49)
    expect(ws.enhanceCritFactorLevel).toBe(44)
    expect(ws.enhanceDamagePerMeterLevel).toBe(44)
    expect(ws.enhanceSuperCritMultLevel).toBe(0)
  })
})
