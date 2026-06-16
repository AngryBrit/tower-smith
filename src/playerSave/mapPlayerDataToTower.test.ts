import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile, type DecodedPlayerSave } from './decodePlayerInfo'
import {
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
} from './gameWorkshopMapping'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import { gameSubmoduleImportFromEffectIndices } from './gameModuleEffectIndex'
import { gameModuleRarityToMergeTier } from './gameModuleRarity'
import { playerSaveToWorkshop } from './mapPlayerDataToTower'
import { workshopModuleConfigEntry } from '../data/workshopModuleConfigLibrary'

const SAMPLE_SAVE = 'h:/The Tower/playerInfo.dat'
const FUDGYRELLA_SAVE = 'h:/The Tower/Fudgyrella.dat'
const PETETHERED_SAVE = 'h:/The Tower/petethered.dat'
const JAMES_WRIGHT_SAVE = 'h:/The Tower/James Wright.dat'

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

const HUB_MODULE_SLOTS = ['cannon', 'armor', 'generator', 'core'] as const

function workshopChassisFields(
  ws: ReturnType<typeof playerSaveToWorkshop>,
  slot: (typeof HUB_MODULE_SLOTS)[number],
) {
  switch (slot) {
    case 'cannon':
      return {
        level: ws.simCannonChassisModuleLevel,
        id: ws.simCannonChassisModuleId,
        rarity: ws.simCannonChassisModuleRarity,
        mainSubmodules: ws.simSubmoduleSelections.cannon.main,
      }
    case 'armor':
      return {
        level: ws.simArmorChassisModuleLevel,
        id: ws.simArmorChassisModuleId,
        rarity: ws.simArmorChassisModuleRarity,
        mainSubmodules: ws.simSubmoduleSelections.armor.main,
      }
    case 'generator':
      return {
        level: ws.simGeneratorChassisModuleLevel,
        id: ws.simGeneratorChassisModuleId,
        rarity: ws.simGeneratorChassisModuleRarity,
        mainSubmodules: ws.simSubmoduleSelections.generator.main,
      }
    case 'core':
      return {
        level: ws.simCoreChassisModuleLevel,
        id: ws.simCoreChassisModuleId,
        rarity: ws.simCoreChassisModuleRarity,
        mainSubmodules: ws.simSubmoduleSelections.core.main,
      }
  }
}

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

  it('maps Amplify Bot range before bonus in save array (regression)', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        currentBotPreset: 0,
        botPresets: {
          amplify: [
            {
              unlocked: true,
              active: true,
              levels: [4, 10, 7, 12],
              selectedLevels: [4, 10, 7, 12],
              plusUnlocked: false,
              plusLevel: 0,
            },
          ],
        },
      }),
    )
    expect(ws.amplifyBotCooldownLevel).toBe(4)
    expect(ws.amplifyBotRangeLevel).toBe(10)
    expect(ws.amplifyBotBonusLevel).toBe(7)
    expect(ws.amplifyBotDurationLevel).toBe(12)
  })

  it('maps Flame Bot range before damage reduction in save array (regression)', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        currentBotPreset: 0,
        botPresets: {
          flame: [
            {
              unlocked: true,
              active: true,
              levels: [3, 8, 5, 10],
              selectedLevels: [3, 8, 5, 10],
              plusUnlocked: false,
              plusLevel: 0,
            },
          ],
        },
      }),
    )
    expect(ws.flameBotCooldownLevel).toBe(3)
    expect(ws.flameBotRangeLevel).toBe(8)
    expect(ws.flameBotDamageLevel).toBe(5)
    expect(ws.flameBotDamageReductionLevel).toBe(10)
  })

  it('maps purchased Golden Bot bonus from levels[] not selectedLevels[] (regression)', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        currentBotPreset: 0,
        botPresets: {
          golden: [
            {
              unlocked: true,
              active: true,
              levels: [15, 20, 30, 30],
              selectedLevels: [15, 20, 15, 30],
              plusUnlocked: false,
              plusLevel: 0,
            },
          ],
        },
      }),
    )
    expect(ws.goldenBotCooldownLevel).toBe(15)
    expect(ws.goldenBotRangeLevel).toBe(20)
    expect(ws.goldenBotBonusLevel).toBe(30)
    expect(ws.goldenBotDurationLevel).toBe(30)
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

  it('keeps equipped module slot positions when an earlier hub slot is empty', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        moduleEquipped: [
          null,
          { infoIndex: 42, level: 60, rarity: 4, effects: [187, 181, 193, 0, 0, 0, 0, 0] },
          { infoIndex: 27, level: 101, rarity: 7, effects: [220, 252, 282, 311, 0, 0, 0, 0] },
          { infoIndex: 48, level: 138, rarity: 10, effects: [231, 225, 324, 315, 0, 0, 0, 0] },
        ],
      }),
    )
    expect(ws.simCannonChassisModuleId).toBe('')
    expect(ws.simCannonChassisModuleLevel).toBe(0)
    expect(ws.simArmorChassisModuleId).toBe('sharpFortitude')
    expect(ws.simArmorChassisModuleLevel).toBe(60)
    expect(ws.simGeneratorChassisModuleId).toBe('blackHoleDigestor')
    expect(ws.simGeneratorChassisModuleLevel).toBe(101)
    expect(ws.simCoreChassisModuleId).toBe('primordialCollapse')
    expect(ws.simCoreChassisModuleLevel).toBe(138)
  })

  it('imports card presets from sample playerInfo.dat', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    expect(save.slotPresetCardInt.length).toBe(140)
    expect(save.slotPresetCardAssignedBool.length).toBe(140)
    const ws = playerSaveToWorkshop(save)
    expect(ws.cardActivePresetIndex).toBe(save.currentCardPreset)
    const activePreset = ws.cardPresetLoadouts[save.currentCardPreset] ?? []
    expect(activePreset.length).toBeGreaterThan(0)
    expect(ws.cardPresetLoadouts.some((loadout) => loadout.includes('damage'))).toBe(true)
  })

  it('imports equipped module levels, merge tiers, and chassis ids from sample save', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    expect(save.moduleEquipped).toHaveLength(4)
    const ws = playerSaveToWorkshop(save)

    for (let i = 0; i < HUB_MODULE_SLOTS.length; i++) {
      const slot = HUB_MODULE_SLOTS[i]!
      const item = save.moduleEquipped[i]
      const fields = workshopChassisFields(ws, slot)
      if (!item) {
        expect(fields.id).toBe('')
        expect(fields.level).toBe(0)
        continue
      }
      expect(fields.level).toBe(item.level)
      expect(fields.id).toBe(gameWorkshopChassisModuleId(item.infoIndex, slot))
      const merge = gameModuleRarityToMergeTier(item.rarity)
      if (merge) expect(fields.rarity).toBe(merge)
      if (item.effects.some((v) => v !== 0)) {
        expect(fields.mainSubmodules).toEqual(
          gameSubmoduleImportFromEffectIndices(
            slot,
            item.effects,
            item.level,
            0,
            merge,
          ).map,
        )
      }
    }
  })

  it('imports per-module config library from inventory and equipped modules', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    expect(save.moduleInventory.length).toBeGreaterThan(4)
    const ws = playerSaveToWorkshop(save)

    const equippedBySlot = {
      cannon: ws.simCannonChassisModuleId,
      armor: ws.simArmorChassisModuleId,
      generator: ws.simGeneratorChassisModuleId,
      core: ws.simCoreChassisModuleId,
    } as const

    const levelBySlot = {
      cannon: ws.simCannonChassisModuleLevel,
      armor: ws.simArmorChassisModuleLevel,
      generator: ws.simGeneratorChassisModuleLevel,
      core: ws.simCoreChassisModuleLevel,
    } as const

    for (const slot of ['cannon', 'armor', 'generator', 'core'] as const) {
      const moduleId = equippedBySlot[slot]
      if (!moduleId) continue
      expect(workshopModuleConfigEntry(ws, slot, 'main', moduleId)).toMatchObject({
        level: levelBySlot[slot],
      })
    }

    let foundUnequipped = false
    for (const item of save.moduleInventory) {
      for (const slot of ['cannon', 'armor', 'generator', 'core'] as const) {
        const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
        if (!moduleId || moduleId === equippedBySlot[slot]) continue
        const entry = workshopModuleConfigEntry(ws, slot, 'main', moduleId)
        expect(entry.level).toBeGreaterThanOrEqual(0)
        foundUnequipped = true
        break
      }
      if (foundUnequipped) break
    }
    expect(foundUnequipped).toBe(true)
  })

  it('imports Fudgyrella core submodule effects from sample save', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(FUDGYRELLA_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simSubmoduleSelections.core.main).toEqual({
      'death-wave-damage-x': 'mythic',
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

  it('imports Sharp Fortitude armor main submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simArmorChassisModuleId).toBe('sharpFortitude')
    expect(ws.simArmorChassisModuleRarity).toBe('ancestral')
    expect(ws.simSubmoduleSelections.armor.main).toEqual({
      defense: 'ancestral',
      'wall-health': 'ancestral',
      'health-regen': 'ancestral',
      'thorns-damage': 'mythic',
    })
  })

  it('imports Orbital Augment armor assist submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simArmorAssistChassisModuleId).toBe('orbitalAugment')
    expect(ws.simSubmoduleSelections.armor.assist).toEqual({
      defense: 'ancestral',
      'wall-health': 'mythic',
      'health-regen': 'ancestral',
      'land-mine-radius': 'rare',
    })
  })

  it('imports Black Hole Digestor generator main submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simGeneratorChassisModuleId).toBe('blackHoleDigestor')
    expect(ws.simSubmoduleSelections.generator.main).toEqual({
      'package-chance': 'mythic',
      'coins-kill-bonus': 'mythic',
      'free-utility-upgrade': 'epic',
      'enemy-attack-level-skip': 'mythic',
    })
  })

  it('imports Singularity Harness generator assist submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simGeneratorAssistChassisModuleId).toBe('singularityHarness')
    expect(ws.simSubmoduleSelections.generator.assist).toEqual({
      'enemy-attack-level-skip': 'mythic',
      'free-utility-upgrade': 'mythic',
      'package-chance': 'mythic',
      'cash-wave': 'rare',
    })
  })

  it('imports Primordial Collapse core main submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simCoreChassisModuleId).toBe('primordialCollapse')
    expect(ws.simCoreChassisModuleRarity).toBe('star_1')
    expect(ws.simSubmoduleSelections.core.main).toEqual({
      'black-hole-cooldown-s': 'mythic',
      'golden-tower-bonus': 'ancestral',
      'spotlight-angle': 'ancestral',
      'poison-swamp-cooldown-s': 'mythic',
    })
  })

  it('imports Harmony Conductor core assist submodule effects from petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PETETHERED_SAVE)))
    const ws = playerSaveToWorkshop(save)
    expect(ws.simCoreAssistChassisModuleId).toBe('harmonyConductor')
    expect(ws.simSubmoduleSelections.core.assist).toEqual({
      'golden-tower-duration-s': 'mythic',
      'golden-tower-bonus': 'ancestral',
      'spotlight-angle': 'ancestral',
      'black-hole-size-m': 'epic',
    })
  })

  it('imports assist unlocks when assistModuleSlots has data even if assistModulesAvailable is false', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        moduleEquipped: [
          { infoIndex: 41, level: 136, rarity: 14, effects: [0, 0, 0, 0, 0, 0, 0, 0] },
          { infoIndex: 46, level: 130, rarity: 10, effects: [92, 149, 86, 139, 0, 0, 0, 0] },
          { infoIndex: 43, level: 134, rarity: 13, effects: [0, 0, 0, 0, 0, 0, 0, 0] },
          { infoIndex: 38, level: 138, rarity: 10, effects: [231, 225, 324, 315, 0, 0, 0, 0] },
        ],
        assistModulesAvailable: false,
        assistModuleSlots: [
          {
            unlocked: false,
            uniqueEffectEfficiencyLevel: 0,
            mainEffectEfficiencyLevel: 0,
            substatEfficiencyLevel: 0,
            equipped: null,
          },
          {
            unlocked: true,
            uniqueEffectEfficiencyLevel: 2,
            mainEffectEfficiencyLevel: 29,
            substatEfficiencyLevel: 24,
            equipped: {
              infoIndex: 19,
              level: 90,
              rarity: 11,
              effects: [142, 88, 81, 132, 0, 0, 0, 0],
            },
          },
          {
            unlocked: true,
            uniqueEffectEfficiencyLevel: 1,
            mainEffectEfficiencyLevel: 19,
            substatEfficiencyLevel: 19,
            equipped: {
              infoIndex: 28,
              level: 66,
              rarity: 12,
              effects: [207, 212, 216, 328, 0, 0, 0, 0],
            },
          },
          {
            unlocked: true,
            uniqueEffectEfficiencyLevel: 0,
            mainEffectEfficiencyLevel: 0,
            substatEfficiencyLevel: 19,
            equipped: {
              infoIndex: 48,
              level: 41,
              rarity: 11,
              effects: [315, 284, 326, 303, 0, 0, 0, 0],
            },
          },
        ],
      }),
    )
    expect(ws.simCannonAssistUnlocked).toBe(false)
    expect(ws.simArmorAssistUnlocked).toBe(true)
    expect(ws.simGeneratorAssistUnlocked).toBe(true)
    expect(ws.simCoreAssistUnlocked).toBe(true)
    expect(ws.simArmorAssistUniqueRarity).toBe('mythic')
    expect(ws.simGeneratorAssistUniqueRarity).toBe('legendary')
    expect(ws.simCoreAssistUniqueRarity).toBe('epic')
    expect(ws.simArmorAssistMainStoneEfficiency).toBe(29)
    expect(ws.simArmorAssistSubStoneEfficiency).toBe(24)
    expect(ws.simCoreAssistSubStoneEfficiency).toBe(19)
    expect(ws.simArmorAssistChassisModuleId).toBe('spaceDisplacer')
    expect(ws.simArmorModuleLevel).toBe(90)
    expect(ws.simSubmoduleSelections.armor.assist).toMatchObject({
      'land-mine-radius': 'mythic',
      defense: 'rare',
      'health-regen': 'common',
      'land-mine-chance': 'mythic',
    })
    expect(ws.simSubmoduleSelections.armor.assistSlots?.[3]).toMatchObject({
      effectId: 'land-mine-chance',
      rarity: 'mythic',
    })
    expect(ws.simGeneratorAssistChassisModuleId).toBe(
      gameWorkshopChassisModuleId(28, 'generator'),
    )
    expect(ws.simGeneratorModuleLevel).toBe(66)
    expect(ws.simSubmoduleSelections.generator.assist).toMatchObject({
      'package-chance': 'mythic',
      'enemy-attack-level-skip': 'ancestral',
      'enemy-health-level-skip': 'ancestral',
      'max-recovery': 'epic',
    })
    expect(ws.simSubmoduleSelections.generator.assistSlots?.[0]).toMatchObject({
      effectId: 'package-chance',
      rarity: 'mythic',
    })
    expect(ws.simSubmoduleSelections.generator.assistSlots?.[3]).toMatchObject({
      effectId: 'max-recovery',
      rarity: 'epic',
    })
    expect(ws.simCoreAssistChassisModuleId).toBe(
      gameWorkshopChassisModuleId(48, 'core'),
    )
    expect(ws.simCoreModuleLevel).toBe(41)
    expect(ws.simSubmoduleSelections.core.assist).toEqual({
      'black-hole-cooldown-s': 'mythic',
      'golden-tower-bonus': 'ancestral',
      'spotlight-angle': 'ancestral',
      'poison-swamp-cooldown-s': 'mythic',
    })
  })

  it('imports Project Funding ancestral generator submodules from compressed save indices', () => {
    const ws = playerSaveToWorkshop(
      minimalSave({
        moduleEquipped: [
          { infoIndex: 0, level: 1, rarity: 4, effects: [0, 0, 0, 0, 0, 0, 0, 0] },
          { infoIndex: 0, level: 1, rarity: 4, effects: [0, 0, 0, 0, 0, 0, 0, 0] },
          {
            infoIndex: 43,
            level: 134,
            rarity: 13,
            effects: [216, 212, 191, 208, 0, 0, 0, 0],
          },
          { infoIndex: 0, level: 1, rarity: 4, effects: [0, 0, 0, 0, 0, 0, 0, 0] },
        ],
      }),
    )
    expect(ws.simGeneratorChassisModuleId).toBe('projectFunding')
    expect(ws.simGeneratorChassisModuleRarity).toBe('star_3')
    expect(ws.simSubmoduleSelections.generator.main).toMatchObject({
      'enemy-health-level-skip': 'ancestral',
      'enemy-attack-level-skip': 'ancestral',
      'free-utility-upgrade': 'common',
      'package-chance': 'ancestral',
    })
  })

  it('imports James Wright cannon Shrink Ray (infoIndex 41)', async () => {
    if (!existsSync(JAMES_WRIGHT_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(JAMES_WRIGHT_SAVE)))
    expect(save.moduleEquipped[0]?.infoIndex).toBe(41)
    const ws = playerSaveToWorkshop(save)
    expect(ws.simCannonChassisModuleId).toBe('shrinkRay')
    expect(ws.simSubmoduleSelections.cannon?.main).toEqual({
      'bounce-shot-chance': 'legendary',
      'attack-speed': 'legendary',
      'multishot-chance': 'legendary',
    })
  })
})
