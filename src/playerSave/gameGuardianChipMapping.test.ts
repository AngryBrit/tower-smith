import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile, type DecodedPlayerSave } from './decodePlayerInfo'
import {
  formatGuardianChipBountyValue,
  formatGuardianChipFetchValue,
} from '../data/guardianChipGodTables'
import {
  GAME_GUARDIAN_CHIP_INDEX,
  gameGuardianChipLevelFromSave,
  guardianChipUnlockedSlotsFromSave,
  playerSaveToGuardianChips,
} from './gameGuardianChipMapping'

const SAMPLE_SAVE = 'h:/The Tower/playerInfo.dat'
const FUDGYRELLA_SAVE = 'h:/The Tower/Fudgyrella.dat'

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

describe('gameGuardianChipLevelFromSave', () => {
  it('converts zero-based save tiers to 1-based TowerSmith levels', () => {
    expect(gameGuardianChipLevelFromSave(0)).toBe(1)
    expect(gameGuardianChipLevelFromSave(20)).toBe(21)
    expect(gameGuardianChipLevelFromSave(40)).toBe(41)
    expect(gameGuardianChipLevelFromSave(30)).toBe(31)
  })
})

describe('guardianChipUnlockedSlotsFromSave', () => {
  it('keeps slot 0 free and unlocks purchased slots by count', () => {
    expect(guardianChipUnlockedSlotsFromSave(0)).toEqual([true, false, false, false])
    expect(guardianChipUnlockedSlotsFromSave(2)).toEqual([true, true, true, false])
  })
})

describe('playerSaveToGuardianChips', () => {
  it('maps equipped chips, unlocks, and upgrade tracks from synthetic save rows', () => {
    const levels = Array.from({ length: 27 }, () => 0)
    const bountyBase = GAME_GUARDIAN_CHIP_INDEX.bounty * 3
    levels[bountyBase] = 44
    levels[bountyBase + 1] = 22
    levels[bountyBase + 2] = 3

    const fetchBase = GAME_GUARDIAN_CHIP_INDEX.fetch * 3
    levels[fetchBase] = 20
    levels[fetchBase + 1] = 40
    levels[fetchBase + 2] = 30

    const summonBase = GAME_GUARDIAN_CHIP_INDEX.summon * 3
    levels[summonBase] = 13
    levels[summonBase + 1] = 7

    const unlocked = Array.from({ length: 9 }, () => false)
    for (const chipId of ['bounty', 'fetch', 'summon'] as const) {
      unlocked[GAME_GUARDIAN_CHIP_INDEX[chipId]] = true
    }

    const state = playerSaveToGuardianChips(
      minimalSave({
        guardianSlotsUnlocked: 2,
        guardianChipSlot: [6, 0, 7],
        guardianChipUnlocked: unlocked,
        guardianChipLevel: levels,
      }),
    )

    expect(state.unlockedSlots).toEqual([true, true, true, false])
    expect(state.slots).toEqual(['fetch', 'bounty', 'summon', null])
    expect(state.unlockedChipIds).toEqual(['bounty', 'fetch', 'summon'])
    expect(state.upgrades.bounty).toEqual({ multiplier: 45, cooldown: 23, targets: 4 })
    expect(state.upgrades.fetch).toEqual({ cooldown: 21, findChance: 41, doubleFindChance: 31 })
    expect(state.upgrades.summon).toEqual({ cooldown: 14, duration: 8, cashBonus: 1 })
    expect(formatGuardianChipFetchValue('cooldown', state.upgrades.fetch.cooldown)).toBe('100s')
    expect(formatGuardianChipFetchValue('findChance', state.upgrades.fetch.findChance)).toBe('50%')
    expect(formatGuardianChipFetchValue('doubleFindChance', state.upgrades.fetch.doubleFindChance)).toBe(
      '32%',
    )
  })

  it('maps guardian chips from sample playerInfo.dat', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE)))
    const state = playerSaveToGuardianChips(save)
    const bountyBase = GAME_GUARDIAN_CHIP_INDEX.bounty * 3
    const fetchBase = GAME_GUARDIAN_CHIP_INDEX.fetch * 3
    const summonBase = GAME_GUARDIAN_CHIP_INDEX.summon * 3

    expect(save.guardianSlotsUnlocked).toBeGreaterThanOrEqual(1)
    expect(state.unlockedSlots[0]).toBe(true)
    expect(state.slots.filter(Boolean).length).toBeGreaterThan(0)
    expect(state.unlockedChipIds.length).toBeGreaterThanOrEqual(6)
    expect(state.upgrades.bounty.multiplier).toBe(
      gameGuardianChipLevelFromSave(save.guardianChipLevel[bountyBase]!),
    )
    expect(state.upgrades.fetch.cooldown).toBe(
      gameGuardianChipLevelFromSave(save.guardianChipLevel[fetchBase]!),
    )
    expect(state.upgrades.summon.cooldown).toBe(
      gameGuardianChipLevelFromSave(save.guardianChipLevel[summonBase]!),
    )
    expect(formatGuardianChipFetchValue('cooldown', state.upgrades.fetch.cooldown)).toBe('100s')
    expect(formatGuardianChipFetchValue('findChance', state.upgrades.fetch.findChance)).toBe('50%')
    expect(formatGuardianChipFetchValue('doubleFindChance', state.upgrades.fetch.doubleFindChance)).toBe(
      '32%',
    )
    expect(formatGuardianChipBountyValue('multiplier', state.upgrades.bounty.multiplier)).toBe('x1.45')
  })

  it('maps guardian chips from Fudgyrella.dat', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(FUDGYRELLA_SAVE)))
    const state = playerSaveToGuardianChips(save)

    expect(state.slots).toEqual(['fetch', 'bounty', 'ally', null])
    expect(state.upgrades.bounty.multiplier).toBe(35)
    expect(state.upgrades.attack.percent).toBe(3)
    expect(state.upgrades.ally.recovery).toBe(10)
    expect(state.upgrades.fetch.cooldown).toBe(61)
  })
})
