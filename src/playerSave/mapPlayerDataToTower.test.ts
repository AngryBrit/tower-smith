import { describe, expect, it } from 'vitest'
import type { DecodedPlayerSave } from './decodePlayerInfo'
import {
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
} from './gameWorkshopMapping'
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

/** Sample save `upgradeWorkshopLevel` head (player-save-field-dump.json). */
const SAMPLE_ATTACK_WORKSHOP = [
  5660, 99, 79, 150, 79, 170, 99, 7, 85, 99, 85, 7, 60, 90, 95, 110, 110, 0, 0, 0,
] as const

/** Sample save `upgradeWorkshopDefenseLevel` (player-save-field-dump.json). */
const SAMPLE_DEFENSE_WORKSHOP = [
  5600, 5900, 99, 5000, 99, 80, 80, 40, 38, 4, 35, 40, 50, 160, 50, 75, 1210, 280, 0, 0,
] as const

/** Sample save `upgradeWorkshopUtilityLevel` (player-save-field-dump.json). */
const SAMPLE_UTILITY_WORKSHOP = [
  149, 149, 149, 149, 99, 99, 99, 99, 300, 500, 60, 240, 240, 0, 0, 0, 0, 0, 0, 0,
] as const

describe('playerSaveToWorkshop', () => {
  it('maps attack workshop upgrades from upgradeWorkshopLevel', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        upgradeWorkshopLevel: [...SAMPLE_ATTACK_WORKSHOP],
      }),
    )
    GAME_WORKSHOP_ATTACK_LEVEL_KEYS.forEach((key, i) => {
      expect(ws[key]).toBe(SAMPLE_ATTACK_WORKSHOP[i])
    })
    expect(ws.damageLevel).toBe(5660)
    expect(ws.attackSpeedLevel).toBe(99)
    expect(ws.critChanceLevel).toBe(79)
    expect(ws.critFactorLevel).toBe(150)
    expect(ws.attackRangeLevel).toBe(79)
    expect(ws.damagePerMeterLevel).toBe(170)
    expect(ws.rendArmorMultLevel).toBe(110)
  })

  it('maps defense workshop upgrades from upgradeWorkshopDefenseLevel', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        upgradeWorkshopDefenseLevel: [...SAMPLE_DEFENSE_WORKSHOP],
      }),
    )
    GAME_WORKSHOP_DEFENSE_LEVEL_KEYS.forEach((key, i) => {
      expect(ws[key]).toBe(SAMPLE_DEFENSE_WORKSHOP[i])
    })
    expect(ws.healthLevel).toBe(5600)
    expect(ws.healthRegenLevel).toBe(5900)
    expect(ws.defenseAbsoluteLevel).toBe(5000)
    expect(ws.landMineDamageLevel).toBe(160)
    expect(ws.wallHealthLevel).toBe(1210)
    expect(ws.wallRebuildLevel).toBe(280)
  })

  it('maps utility workshop upgrades from upgradeWorkshopUtilityLevel', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        upgradeWorkshopUtilityLevel: [...SAMPLE_UTILITY_WORKSHOP],
      }),
    )
    GAME_WORKSHOP_UTILITY_LEVEL_KEYS.forEach((key, i) => {
      expect(ws[key]).toBe(SAMPLE_UTILITY_WORKSHOP[i])
    })
    expect(ws.cashBonusLevel).toBe(149)
    expect(ws.freeUtilityUpgradeLevel).toBe(99)
    expect(ws.recoveryAmountLevel).toBe(300)
    expect(ws.maxRecoveryLevel).toBe(500)
    expect(ws.packageChanceLevel).toBe(60)
    expect(ws.enemyHealthLevelSkipLevel).toBe(240)
  })

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

  it('maps Golden Bot medal levels from goldenBotPresets preset 0', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        currentBotPreset: 0,
        botPresets: {
          golden: [
            {
              unlocked: true,
              active: true,
              levels: [6, 6, 6, 20],
              selectedLevels: [6, 6, 6, 20],
              plusUnlocked: false,
              plusLevel: 0,
            },
            {
              unlocked: false,
              active: false,
              levels: [0, 0, 0, 0],
              selectedLevels: [0, 0, 0, 0],
              plusUnlocked: false,
              plusLevel: 0,
            },
          ],
        },
      }),
    )
    expect(ws.goldenOwned).toBe(true)
    expect(ws.goldenBotActive).toBe(true)
    expect(ws.goldenBotDurationLevel).toBe(20)
    expect(ws.goldenBotCooldownLevel).toBe(6)
    expect(ws.goldenBotBonusLevel).toBe(6)
    expect(ws.goldenBotRangeLevel).toBe(6)
  })
})
