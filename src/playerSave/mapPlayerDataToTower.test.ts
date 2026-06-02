import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile, type DecodedPlayerSave } from './decodePlayerInfo'
import {
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
} from './gameWorkshopMapping'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import { playerSaveToWorkshop } from './mapPlayerDataToTower'

const SAMPLE_SAVE = 'h:/The Tower/playerInfo.dat'
const FUDGYRELLA_SAVE = 'h:/The Tower/Fudgyrella.dat'

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

  it('maps Golden Bot range before bonus in save array (regression)', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        currentBotPreset: 0,
        botPresets: {
          golden: [
            {
              unlocked: true,
              active: true,
              levels: [5, 13, 5, 6],
              selectedLevels: [5, 13, 5, 6],
              plusUnlocked: false,
              plusLevel: 0,
            },
          ],
        },
      }),
    )
    expect(ws.goldenBotCooldownLevel).toBe(5)
    expect(ws.goldenBotRangeLevel).toBe(13)
    expect(ws.goldenBotBonusLevel).toBe(5)
    expect(ws.goldenBotDurationLevel).toBe(6)
  })

  it('maps slotsUnlocked to cardEquipSlots', () => {
    const ws = playerSaveToWorkshop(minimalSave({ slotsUnlocked: 18 }))
    expect(ws.cardEquipSlots).toBe(18)
  })

  it('maps card preset loadouts from slotPresetCardInt when present', async () => {
    const slotPresetCardInt = new Array(140).fill(0)
    const slotPresetCardAssignedBool = new Array(140).fill(false)
    const preset0Slots = [15, 6, 19, 2, 12, 1, 11, 20, 16, 22, 23, 31, 7, 3, 0, 26, 25, 18]
    preset0Slots.forEach((saveIndex, slot) => {
      slotPresetCardInt[slot] = saveIndex
      slotPresetCardAssignedBool[slot] = true
    })

    const ws = playerSaveToWorkshop(
      minimalSave({
        slotsUnlocked: 18,
        currentCardPreset: 0,
        slotPresetCardInt,
        slotPresetCardAssignedBool,
      }),
    )
    expect(ws.cardActivePresetIndex).toBe(0)
    expect(ws.cardPresetLoadouts[0]).toContain('damage')
    expect(ws.cardPresetLoadouts[0]).toContain('plasmaCannon')
    expect(ws.cardPresetLoadouts[0]).toHaveLength(18)
  })

  it('imports card presets from sample playerInfo.dat', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    expect(save.slotPresetCardInt.length).toBe(140)
    expect(save.slotPresetCardAssignedBool.length).toBe(140)
    expect(save.currentCardPreset).toBe(0)
    const ws = playerSaveToWorkshop(save)
    expect(ws.cardPresetLoadouts[0]).toContain('damage')
    expect(ws.cardPresetLoadouts[0]).toHaveLength(18)
    expect(ws.cardPresetLoadouts[1]?.length).toBeGreaterThan(0)
  })

  it('imports equipped module levels, merge tiers, and chassis ids from sample save', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    expect(save.moduleEquipped).toHaveLength(4)
    const ws = playerSaveToWorkshop(save)
    expect(ws.simCannonModuleLevel).toBe(save.moduleEquipped[0]!.level)
    expect(ws.simArmorModuleLevel).toBe(save.moduleEquipped[1]!.level)
    expect(ws.simGeneratorModuleLevel).toBe(save.moduleEquipped[2]!.level)
    expect(ws.simCoreModuleLevel).toBe(save.moduleEquipped[3]!.level)
    expect(ws.simCannonChassisModuleRarity).toBe('mythic_plus')
    expect(ws.simArmorChassisModuleRarity).toBe('legendary')
    expect(ws.simGeneratorChassisModuleRarity).toBe('epic')
    expect(ws.simCoreChassisModuleRarity).toBe('legendary_plus')
    expect(ws.simCannonChassisModuleId).toBe(
      gameWorkshopChassisModuleId(save.moduleEquipped[0]!.infoIndex, 'cannon'),
    )
    expect(ws.simArmorChassisModuleId).toBe(
      gameWorkshopChassisModuleId(save.moduleEquipped[1]!.infoIndex, 'armor'),
    )
    expect(ws.simGeneratorChassisModuleId).toBe(
      gameWorkshopChassisModuleId(save.moduleEquipped[2]!.infoIndex, 'generator'),
    )
    expect(ws.simCoreChassisModuleId).toBe(
      gameWorkshopChassisModuleId(save.moduleEquipped[3]!.infoIndex, 'core'),
    )
    expect(save.moduleEquipped[0]!.effects.length).toBeGreaterThan(0)
    expect(ws.simSubmoduleSelections.cannon.main).toEqual({
      'attack-speed': 'legendary',
      'crit-chance': 'legendary',
      'crit-factor': 'legendary',
      'multishot-chance': 'legendary',
    })
    expect(ws.simAttackSpeedModuleSubEffect).toBe(1)
    expect(ws.simSubmoduleSelections.armor.main).toEqual({
      'health-regen': 'legendary',
      defense: 'legendary',
      'wall-health': 'legendary',
    })
    expect(ws.simSubmoduleSelections.generator.main).toEqual({
      'free-attack-upgrade': 'epic',
      'free-defense-upgrade': 'epic',
      'free-utility-upgrade': 'epic',
    })
    expect(ws.simSubmoduleSelections.core.main).toEqual({
      'chain-lightning-damage-x': 'legendary',
      'death-wave-quantity': 'legendary',
      'golden-tower-bonus': 'legendary',
      'black-hole-duration-s': 'legendary',
    })
  })

  it('imports Fudgyrella core submodule effects from sample save', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(FUDGYRELLA_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simSubmoduleSelections.core.main).toEqual({
      'death-wave-damage-x': 'legendary',
      'spotlight-bonus': 'mythic',
      'golden-tower-bonus': 'mythic',
      'chain-lightning-damage-x': 'mythic',
    })
  })

  it('imports Fudgyrella generator submodule effects from sample save', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(FUDGYRELLA_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simGeneratorChassisModuleId).toBe('galaxyCompressor')
    expect(ws.simSubmoduleSelections.generator.main).toEqual({
      'recovery-amount': 'mythic',
      'package-chance': 'mythic',
      'cash-wave': 'mythic',
      'max-recovery': 'mythic',
    })
  })
})
