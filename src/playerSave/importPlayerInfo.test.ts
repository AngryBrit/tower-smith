import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower, researchLevelsToOverrides } from './mapPlayerDataToTower'
import { importPlayerInfoDat } from './importPlayerInfo'
import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from '../types/research'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchDataSync(): ResearchData {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    const slug = rel.split('/').pop()!.replace(/\.json$/i, '')
    return parseResearchSection(raw, slug)
  })
  return { sections }
}

const SAMPLE = 'h:/The Tower/playerInfo.dat'

function minimalResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'Main',
        sectionSlug: 'main-research',
        items: [
          { name: 'Game Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Starting Cash', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
      {
        title: 'Attack',
        sectionSlug: 'attack-research',
        items: [
          { name: 'Damage', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('importPlayerInfo', () => {
  it('rejects saves over 200 KB', async () => {
    const r = await importPlayerInfoDat(
      new Uint8Array(200 * 1024 + 1),
      minimalResearchData(),
    )
    expect(r).toEqual({ ok: false, error: 'too_large' })
  })

  it('decodes sample save when present', async () => {
    if (!existsSync(SAMPLE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save.researchLevel.length).toBe(250)
    expect(save.upgradeWorkshopLevel.length).toBe(20)
    expect(save.upgradeWorkshopLevel[0]).toBeGreaterThan(0)
  })

  it('maps research and workshop from sample save', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save?.researchLevel?.length).toBe(250)
    expect(save.researchLevel[30]).toBe(7)
    expect(save.researchLevel[0]).toBe(46)
    expect(save.researchLevel[1]).toBe(84)
    expect(save.researchLevel[2]).toBe(16)
    expect(save.researchLevel[4]).toBe(14)
    expect(save.researchLevel[5]).toBe(0)
    expect(save.researchLevel[6]).toBe(0)
    expect(save.researchLevel[131]).toBe(4)
    expect(save.goldenBotLevelCooldownSelected).toBe(2)
    const { overrides } = mapPlayerSaveToTower(data, save)
    expect(overrides['0-0']).toBe(7)
    expect(overrides['0-6']).toBe(save.researchLevel[36])
    expect(overrides['0-5']).toBe(4)
    const mainSi = data.sections.findIndex((s) => s.sectionSlug === 'main-research')
    expect(mainSi).toBeGreaterThanOrEqual(0)
    const workshopEnhancementsIi = data.sections[mainSi]!.items.findIndex(
      (i) => i.name === 'Workshop Enhancements',
    )
    expect(save.researchLevel[133]).toBe(1)
    expect(overrides[`${mainSi}-${workshopEnhancementsIi}`]).toBe(1)
    const rerollDailyMissionIi = data.sections[mainSi]!.items.findIndex(
      (i) => i.name === 'Reroll Daily Mission',
    )
    expect(overrides[`${mainSi}-${rerollDailyMissionIi}`]).toBe(save.researchLevel[151])
    const attackSi = data.sections.findIndex((s) => s.sectionSlug === 'attack-research')
    expect(attackSi).toBeGreaterThanOrEqual(0)
    expect(overrides[`${attackSi}-0`]).toBe(46)
    expect(overrides[`${attackSi}-1`]).toBe(84)
    expect(overrides[`${attackSi}-2`]).toBe(16)
    expect(overrides[`${attackSi}-4`]).toBe(14)
    expect(overrides[`${attackSi}-3`]).toBeUndefined()
    expect(overrides[`${attackSi}-7`]).toBe(4)
    expect(overrides[`${attackSi}-8`]).toBe(1)
    const modulesSi = data.sections.findIndex((s) => s.sectionSlug === 'modules')
    expect(modulesSi).toBeGreaterThanOrEqual(0)
    expect(save.researchLevel[139]).toBeGreaterThanOrEqual(31)
    expect(save.researchLevel[140]).toBeGreaterThanOrEqual(17)
    expect(save.researchLevel[143]).toBeGreaterThanOrEqual(2)
    const rerollIi = data.sections[modulesSi]!.items.findIndex((i) => i.name === 'Reroll Shards')
    const dailyIi = data.sections[modulesSi]!.items.findIndex((i) => i.name === 'Daily Mission Shards')
    const rareIi = data.sections[modulesSi]!.items.findIndex((i) => i.name === 'Rare Drop Chance')
    expect(overrides[`${modulesSi}-${rerollIi}`]).toBe(save.researchLevel[139])
    expect(overrides[`${modulesSi}-${dailyIi}`]).toBe(save.researchLevel[140])
    expect(overrides[`${modulesSi}-${rareIi}`]).toBe(save.researchLevel[143])
    const defenseSi = data.sections.findIndex((s) => s.sectionSlug === 'defense-research')
    expect(defenseSi).toBeGreaterThanOrEqual(0)
    expect(overrides[`${defenseSi}-0`]).toBe(80)
    expect(overrides[`${defenseSi}-1`]).toBe(62)
    expect(overrides[`${defenseSi}-2`]).toBe(11)
    expect(overrides[`${defenseSi}-3`]).toBe(32)
    expect(overrides[`${defenseSi}-4`]).toBe(20)
    expect(overrides[`${defenseSi}-8`]).toBe(10)
    expect(overrides[`${defenseSi}-9`]).toBe(50)
    const wallRebuildIi = data.sections[defenseSi]!.items.findIndex(
      (i) => i.name === 'Wall Rebuild',
    )
    expect(wallRebuildIi).toBe(10)
    expect(save.researchLevel[127]).toBeGreaterThan(0)
    expect(overrides[`${defenseSi}-${wallRebuildIi}`]).toBe(save.researchLevel[127])
    expect(overrides[`${defenseSi}-11`]).toBe(18)
    expect(overrides[`${defenseSi}-12`]).toBe(16)
    expect(save.researchLevel[126]).toBe(50)
    expect(save.researchLevel[129]).toBe(16)
    expect(save.researchLevel[193]).toBe(10)
    const garlicIi = data.sections[defenseSi]!.items.findIndex((i) => i.name === 'Garlic Thorns')
    expect(overrides[`${defenseSi}-${garlicIi}`]).toBe(10)
    const utilitySi = data.sections.findIndex((s) => s.sectionSlug === 'utility-research')
    expect(utilitySi).toBeGreaterThanOrEqual(0)
    expect(save.researchLevel[20]).toBe(27)
    expect(save.researchLevel[22]).toBe(89)
    expect(overrides[`${utilitySi}-0`]).toBe(27)
    expect(overrides[`${utilitySi}-1`]).toBe(5)
    expect(overrides[`${utilitySi}-2`]).toBe(89)
    expect(overrides[`${utilitySi}-3`]).toBe(26)
    expect(overrides[`${utilitySi}-6`]).toBe(1)
    expect(save.researchLevel[124]).toBe(20)
    expect(save.researchLevel[125]).toBe(20)
    expect(overrides[`${utilitySi}-10`]).toBe(20)
    expect(overrides[`${utilitySi}-11`]).toBe(20)
    const botsSi = data.sections.findIndex((s) => s.sectionSlug === 'bots')
    expect(botsSi).toBeGreaterThanOrEqual(0)
    const { botLabsToOverrides } = await import('./mapPlayerDataToTower')
    const botOverrides = botLabsToOverrides(data, save)
    expect(save.researchLevel[104]).toBe(2)
    expect(botOverrides[`${botsSi}-2`]).toBe(2)
    const ultimateSi = data.sections.findIndex((s) => s.sectionSlug === 'ultimate-weapon-research')
    expect(ultimateSi).toBeGreaterThanOrEqual(0)
    const bhDamageIi = data.sections[ultimateSi]!.items.findIndex(
      (i) => i.name === 'Black Hole Damage',
    )
    const extraBhIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Extra Black Hole')
    const bhCoinIi = data.sections[ultimateSi]!.items.findIndex(
      (i) => i.name === 'Black Hole Coin Bonus',
    )
    const spotlightCoinIi = data.sections[ultimateSi]!.items.findIndex(
      (i) => i.name === 'Spotlight Coin Bonus',
    )
    const spotlightMissilesIi = data.sections[ultimateSi]!.items.findIndex(
      (i) => i.name === 'Spotlight Missiles',
    )
    expect(save.researchLevel[60]).toBe(25)
    expect(save.researchLevel[61]).toBe(10)
    expect(save.researchLevel[62]).toBe(1)
    expect(save.researchLevel[66]).toBe(20)
    const gtBonusIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Golden Tower Bonus')
    const gtDurationIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Golden Tower Duration')
    const chainShockIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Chain Lightning Shock')
    const deathWaveHealthIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Death Wave Health')
    const deathWaveCoinIi = data.sections[ultimateSi]!.items.findIndex((i) => i.name === 'Death Wave Coin Bonus')
    expect(overrides[`${ultimateSi}-${gtBonusIi}`]).toBe(25)
    expect(overrides[`${ultimateSi}-${gtDurationIi}`]).toBe(10)
    expect(overrides[`${ultimateSi}-${chainShockIi}`]).toBe(1)
    expect(overrides[`${ultimateSi}-${deathWaveHealthIi}`]).toBe(17)
    expect(overrides[`${ultimateSi}-${deathWaveCoinIi}`]).toBe(20)
    expect(overrides[`${ultimateSi}-${bhDamageIi}`]).toBe(10)
    expect(overrides[`${ultimateSi}-${extraBhIi}`]).toBe(1)
    expect(overrides[`${ultimateSi}-${bhCoinIi}`]).toBe(20)
    expect(overrides[`${ultimateSi}-${spotlightCoinIi}`]).toBe(20)
    expect(overrides[`${ultimateSi}-${spotlightMissilesIi}`]).toBe(save.researchLevel[98])
    expect(save.researchLevel[94]).toBe(10)
    expect(save.researchLevel[96]).toBe(20)
    expect(save.researchLevel[97]).toBe(20)
    expect(save.researchLevel[98]).toBeGreaterThanOrEqual(2)
    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(cardsSi).toBeGreaterThanOrEqual(0)
    const cardLabs: [string, number][] = [
      ['Second Wind Blast', 4],
      ['Double Death Ray', 9],
      ['Extra Orb Adjuster', 1],
      ['Extra Extra Orbs', 2],
      ['Energy Shield Extra Hit', 2],
      ['Super Tower Bonus', 2],
    ]
    for (const [name, level] of cardLabs) {
      const ii = data.sections[cardsSi]!.items.findIndex((i) => i.name === name)
      expect(overrides[`${cardsSi}-${ii}`]).toBe(level)
    }
    const perksSi = data.sections.findIndex((s) => s.sectionSlug === 'perks-research')
    expect(perksSi).toBeGreaterThanOrEqual(0)
    const perkLabs: [string, number][] = [
      ['Unlock Perks', 1],
      ['Waves Required', 19],
      ['Auto Pick Perks', 1],
      ['Standard Perks Bonus', 17],
      ['Perk Option Quantity', 2],
      ['First Perk Choice', 1],
      ['Ban Perks', 4],
      ['Improve Trade-off Perks', 10],
      ['Auto Pick Ranking', 5],
    ]
    for (const [name, level] of perkLabs) {
      const ii = data.sections[perksSi]!.items.findIndex((i) => i.name === name)
      expect(overrides[`${perksSi}-${ii}`]).toBe(level)
    }
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    expect(ws.damageLevel).toBe(save.upgradeWorkshopLevel[0])
  })

  it('does not import card mastery from researchLevel', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const overrides = researchLevelsToOverrides(data, save.researchLevel)
    const masterySi = data.sections.findIndex((s) => s.sectionSlug === 'card-mastery')
    expect(masterySi).toBeGreaterThanOrEqual(0)
    expect(overrides[`${masterySi}-0`]).toBeUndefined()
  })

  it('importPlayerInfoDat uses full research manifest for attack labs', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const r = await importPlayerInfoDat(new Uint8Array(readFileSync(SAMPLE)), data)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const attackSi = data.sections.findIndex((s) => s.sectionSlug === 'attack-research')
    expect(r.overrides[`${attackSi}-0`]).toBe(46)
    expect(r.overrides[`${attackSi}-1`]).toBe(84)
    expect(r.overrides[`${attackSi}-2`]).toBe(16)
    expect(r.overrides[`${attackSi}-4`]).toBe(14)
    expect(r.overrides[`${attackSi}-3`]).toBeUndefined()
  })

  it('importPlayerInfoDat returns ok for sample', async () => {
    if (!existsSync(SAMPLE)) return
    const r = await importPlayerInfoDat(new Uint8Array(readFileSync(SAMPLE)), minimalResearchData())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.overrides['0-0']).toBeGreaterThan(0)
      expect(r.workshop.damageLevel).toBeGreaterThan(0)
      expect(r.themes.ownedIds.length).toBeGreaterThan(0)
      expect(r.themes.selection?.tower).toBeTruthy()
      expect(r.guild).toBeTypeOf('string')
      expect(r.userName).toBeTypeOf('string')
      expect(r.fakeUserName).toBeTypeOf('string')
      expect(r.playfabId).toBeTypeOf('string')
      expect(r.guildMeta.season).toBeGreaterThanOrEqual(0)
      expect(r.guildMeta.chestClaimedWeek).toBeGreaterThanOrEqual(0)
      expect(r.guildMeta.seenChatDisclaimer).toBeTypeOf('boolean')
    }
  })

  it('extracts guild from sample save', async () => {
    if (!existsSync(SAMPLE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save.lastGuildID).toBeTruthy()
    expect(save.userName).toBeTruthy()
    expect(save.fakeUserName).toBeTruthy()
    expect(save.playfabID).toBeTruthy()
    expect(save.lastGuildSeason).toBeGreaterThanOrEqual(0)
    expect(save.guildChestClaimedWeek).toBeGreaterThanOrEqual(0)
    expect(save.hasSeenGuildChatDisclaimer).toBeTypeOf('boolean')
  })

  it('maps relics, bots, and ultimates from sample save', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const { workshop: ws, themes } = mapPlayerSaveToTower(data, save)
    expect(ws.relicOwnedIds.length).toBeGreaterThan(0)
    expect(save.botsLevel.length).toBeGreaterThan(0)
    expect(save.botPresets.golden?.[0]?.unlocked).toBe(true)
    expect(save.botPresets.golden?.[0]?.levels).toEqual([6, 6, 6, 20])
    expect(ws.goldenOwned).toBe(true)
    expect(ws.goldenBotDurationLevel).toBe(20)
    expect(ws.goldenBotCooldownLevel).toBe(6)
    expect(ws.goldenBotBonusLevel).toBe(6)
    expect(ws.goldenBotRangeLevel).toBe(6)
    expect(save.guardianUnlocked).toBe(true)
    expect(save.guardianSkinUnlocked.some(Boolean)).toBe(true)
    expect(save.guardianSkinIndex).toBeGreaterThanOrEqual(0)
    expect(save.ultimateWeaponLevel.length).toBeGreaterThan(0)
    expect(themes.selection?.tower).toBeTruthy()
    expect(themes.selection?.guardian).toBeTruthy()
    expect(themes.ownedIds).not.toContain('guardian-butter')
    expect(themes.ownedIds).not.toContain('guardian-muse')
    expect(themes.ownedIds).toContain('guardian-finn')
    expect(save.selectedProfileBanner).toBe(3)
    expect(themes.selection?.banners).toBe('banner-mech')
    expect(themes.ownedIds).toContain('banner-mech')
    expect(themes.ownedIds).toContain('banner-party')
    expect(themes.ownedIds).toContain('banner-pixel')
    expect(themes.ownedIds).toContain('banner-cosmos')
    expect(themes.ownedIds).toContain('banner-supernova')
    expect(themes.ownedIds).toContain('banner-claw')
    if (save.profileBannerUnlocked[10]) {
      expect(themes.ownedIds).toContain('banner-magician')
    } else {
      expect(themes.ownedIds).not.toContain('banner-magician')
    }
    expect(save.selectedMenu).toBe(2)
    expect(themes.selection?.menus).toBe('menu-mech')
    expect(themes.ownedIds).toContain('menu-mech')
    expect(themes.ownedIds).toContain('menu-party')
    expect(themes.ownedIds).toContain('menu-pixel')
    expect(themes.ownedIds).toContain('menu-horror')
    expect(themes.ownedIds).toContain('menu-cosmos')
    expect(themes.ownedIds).toContain('menu-supernova')
    expect(themes.ownedIds).toContain('menu-claw')
    expect(themes.ownedIds).not.toContain('menu-dark-being')
    if (save.menuUnlocked[9]) {
      expect(themes.ownedIds).toContain('menu-magician')
    } else {
      expect(themes.ownedIds).not.toContain('menu-magician')
    }
    expect(themes.ownedIds).toContain('bg-koi-pond')
    expect(themes.ownedIds).toContain('bg-guild-claw-machine')
    expect(save.backgroundUnlocked[35]).toBe(false)
    expect(save.backgroundUnlocked[36]).toBe(true)
    expect(save.backgroundUnlocked[39]).toBe(true)
    expect(save.backgroundUnlocked[50]).toBe(true)
    expect(save.backgroundUnlocked[51]).toBe(true)
    expect(save.backgroundUnlocked[52]).toBe(true)
    expect(themes.ownedIds).toContain('bg-guild-mech-world')
    expect(themes.ownedIds).not.toContain('bg-guild-throne-room')
    expect(themes.ownedIds).toContain('bg-guild-magician')
  })

  it('maps card stars from cardLevel/cardUnlocked save slot layout', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save.cardLevel.length).toBe(40)
    expect(save.cardUnlocked.length).toBe(40)
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    expect(ws.cardStars.criticalChance).toBe(7)
    expect(ws.cardStars.enemyBalance).toBe(7)
    expect(ws.cardStars.plasmaCannon).toBe(7)
    expect(ws.cardStars.areaOfEffect).toBe(0)
    expect(save.slotsUnlocked).toBe(18)
    expect(ws.cardEquipSlots).toBe(18)
  })
})
