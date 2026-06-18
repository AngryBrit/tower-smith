import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { buildModuleCopyCountsFromPlayerSave } from '../data/workshopModuleCopyCounts'
import { workshopModuleIsOwned } from '../data/workshopModuleConfigLibrary'
import { playerSaveToWorkshop } from './mapPlayerDataToTower'
import {
  assertCopyCountsNotInflated,
  moduleCopyCountMismatches,
} from './moduleCopyCountsAudit'

const SAMPLE_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'
const PETETHERED_SAVE = 'h:/The Tower/SaveGames/petethered.dat'
const FUDGYRELLA_SAVE = 'h:/The Tower/SaveGames/Fudgyrella.dat'

async function loadSave(path: string) {
  return decodePlayerInfoFile(new Uint8Array(readFileSync(path)))
}

describe('module copy counts from player saves', () => {
  it('never inflates counts vs naive infoIndex grouping on sample save', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    assertCopyCountsNotInflated(await loadSave(SAMPLE_SAVE))
  })

  it('never inflates counts vs naive infoIndex grouping on petethered save', async () => {
    if (!existsSync(PETETHERED_SAVE)) return
    assertCopyCountsNotInflated(await loadSave(PETETHERED_SAVE))
  })

  it('never inflates counts vs naive infoIndex grouping on Fudgyrella save', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    assertCopyCountsNotInflated(await loadSave(FUDGYRELLA_SAVE))
  })

  it('filters epic-tier infoIndex fodder for commonly mislabeled generator modules', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const save = await loadSave(SAMPLE_SAVE)
    const counts = buildModuleCopyCountsFromPlayerSave(save)
    const mismatches = moduleCopyCountMismatches(save)

    expect(counts.armor.orbitalAugment?.count).toBe(1)
    expect(counts.generator.projectFunding?.count).toBe(1)
    expect(counts.generator.singularityHarness?.count).toBe(1)
    expect(counts.generator.restorativeBonus?.count).toBe(1)

    for (const moduleId of [
      'orbitalAugment',
      'projectFunding',
      'singularityHarness',
      'restorativeBonus',
    ]) {
      const row = mismatches.find((m) => m.moduleId === moduleId)
      expect(row?.filtered ?? 0).toBeGreaterThan(0)
    }
  })

  it('filters core-slot fodder stored at generator epic infoIndex 33', () => {
    const counts = buildModuleCopyCountsFromPlayerSave({
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
      moduleInventory: [
        {
          infoIndex: 33,
          level: 1,
          rarity: 5,
          effects: [300, 305, 0, 0, 0, 0, 0, 0],
        },
        {
          infoIndex: 30,
          level: 1,
          rarity: 4,
          effects: [205, 163, 0, 0, 0, 0, 0, 0],
        },
      ],
      assistModuleSlots: [],
      assistModulesAvailable: false,
      lastGuildID: '',
      lastGuildSeason: 0,
      guildChestClaimedWeek: 0,
      hasSeenGuildChatDisclaimer: false,
      userName: '',
      fakeUserName: '',
      playfabID: '',
    })

    expect(counts.generator.singularityHarness?.count).toBe(1)
  })

  it('marks leveled core modules owned when save row has mixed substats', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const ws = playerSaveToWorkshop(await loadSave(SAMPLE_SAVE))
    expect(workshopModuleIsOwned(ws, 'core', 'dimensionCore')).toBe(true)
    expect(workshopModuleIsOwned(ws, 'core', 'multiverseNexus')).toBe(true)
  })
})
