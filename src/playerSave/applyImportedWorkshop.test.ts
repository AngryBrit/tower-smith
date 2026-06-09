import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower } from './mapPlayerDataToTower'
import {
  GAME_ENHANCE_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
} from './gameWorkshopMapping'
import { workshopEnhancementsLabUnlocked } from '../data/workshopEnhanceResearch'
import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from '../types/research'
import {
  WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION,
  attackResearchDisplayedDamageLabMultiplier,
} from '../types/research'
import {
  computeWorkshopDisplayedDamagePreBerserker,
  workshopDamageDisplayOptsFromPersisted,
  workshopDisplayedDamageFromPersisted,
} from '../data/workshopDisplayedDamage'
import { workshopDisplayedAttackSpeedFromPersisted } from '../data/workshopDisplayedAttackSpeed'
import { workshopDamageCardMultiplier } from '../data/workshopCardWorkshopDisplay'
import { workshopDamageStatAtLevel } from '../data/workshopDamage'
import { applyImportedLabAndBuild, defaultTowerWorkspace } from '../towerWorkspaceStorage'
import { flattenTowerBuild, splitTowerBuild } from '../towerBuildStorage'

const srcDir = dirname(fileURLToPath(import.meta.url))
const SAMPLE_SAVE = 'h:/The Tower/playerInfo.dat'
const FUDGYRELLA_SAVE = 'h:/The Tower/Fudgyrella.dat'

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

async function applyPlayerSaveImportFromDecoded(
  data: ResearchData,
  save: Awaited<ReturnType<typeof decodePlayerInfoFile>>,
) {
  const { overrides, workshop } = mapPlayerSaveToTower(data, save)
  const workspace = applyImportedLabAndBuild(
    defaultTowerWorkspace(),
    overrides,
    splitTowerBuild(workshop),
    save.researchLevel,
  )
  return { save, overrides, workspace }
}

describe('applyImportedWorkshop', () => {
  it('applies labs, workshop upgrades, enhancements, cards, modules, and relics end-to-end', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const data = loadResearchDataSync()
    const { save, overrides, workspace } = await applyPlayerSaveImportFromDecoded(
      data,
      await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE))),
    )

    const mainSi = data.sections.findIndex((s) => s.sectionSlug === 'main-research')
    const weIi = data.sections[mainSi]!.items.findIndex(
      (i) => i.name === 'Workshop Enhancements',
    )
    expect(save.researchLevel[133]).toBe(1)
    expect(overrides[`${mainSi}-${weIi}`]).toBe(1)
    expect(workshopEnhancementsLabUnlocked(data, workspace.lab.levelOverrides)).toBe(true)

    for (const [i, key] of GAME_WORKSHOP_ATTACK_LEVEL_KEYS.entries()) {
      expect(workspace.build.workshop[key]).toBe(save.upgradeWorkshopLevel[i])
    }
    for (const [i, key] of GAME_ENHANCE_ATTACK_LEVEL_KEYS.entries()) {
      expect(workspace.build.workshop[key]).toBe(save.enhancementLevel[i])
    }

    expect(workspace.build.cards.cardStars.criticalChance).toBe(7)
    expect(workspace.build.cards.cardEquipSlots).toBe(save.slotsUnlocked)
    expect(workspace.build.cards.cardPresetLoadouts[0]?.length).toBe(save.slotsUnlocked)

    expect(workspace.build.relics.relicOwnedIds.length).toBeGreaterThan(0)

    expect(workspace.build.modules.simCannonModuleLevel).toBe(save.moduleEquipped[0]!.level)
    expect(workspace.build.modules.simGeneratorChassisModuleId).toBeTruthy()
    expect(workspace.build.modules.simSubmoduleSelections.cannon.main).toBeTruthy()

    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(overrides[`${cardsSi}-0`]).toBe(4)

    const modulesSi = data.sections.findIndex((s) => s.sectionSlug === 'modules')
    const rerollShardsIi = data.sections[modulesSi]!.items.findIndex(
      (i) => i.name === 'Reroll Shards',
    )
    expect(overrides[`${modulesSi}-${rerollShardsIi}`]).toBe(save.researchLevel[139])
  })

  it('displayed damage after import uses Damage lab from save researchLevel', async () => {
    if (!existsSync(SAMPLE_SAVE)) return
    const data = loadResearchDataSync()
    const { save, workspace } = await applyPlayerSaveImportFromDecoded(
      data,
      await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE_SAVE))),
    )
    const ws = flattenTowerBuild(workspace.build)
    const labMult = attackResearchDisplayedDamageLabMultiplier(
      data,
      workspace.lab.levelOverrides,
    )
    const dmgLab = 1 + 0.02 * save.researchLevel[0]!
    const dpmRaw = 1 + 0.02 * save.researchLevel[4]!
    const dpmLab =
      1 + (dpmRaw - 1) * WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION
    const asLab = 1 + 0.02 * save.researchLevel[1]!
    expect(labMult).toBeCloseTo(dmgLab * dpmLab * asLab, 3)
    expect(workspace.lab.gameResearchLevel?.[0]).toBe(save.researchLevel[0])
    const workshop = workshopDamageStatAtLevel(ws.damageLevel)
    const displayed = workshopDisplayedDamageFromPersisted(
      ws,
      data,
      workspace.lab.levelOverrides,
      workspace.lab.gameResearchLevel,
    )
    expect(displayed).toBeGreaterThan(workshop * labMult * 0.95)
    const cardMult = workshopDamageCardMultiplier(
      ws,
      data,
      workspace.lab.levelOverrides,
    )
    expect(cardMult).toBeGreaterThan(3.9)
    const opts = workshopDamageDisplayOptsFromPersisted(
      ws,
      data,
      workspace.lab.levelOverrides,
      workspace.lab.gameResearchLevel,
    )
    expect(opts.labMultiplier ?? 1).toBeCloseTo(labMult, 3)
    expect(opts.damageCardMultiplier).toBeGreaterThan(3.9)
    const preBerserker = computeWorkshopDisplayedDamagePreBerserker(workshop, opts)
    expect(displayed).toBeCloseTo(preBerserker + (opts.berserkerDamageAdd ?? 0), 6)

    const attackSpeed = workshopDisplayedAttackSpeedFromPersisted(
      ws,
      data,
      workspace.lab.levelOverrides,
      workspace.lab.gameResearchLevel,
    )
    expect(attackSpeed).toBeGreaterThan(38.75)
    expect(attackSpeed).toBeLessThan(38.85)
  })

  it('imports Fudgyrella generator module sub-effects into workspace modules domain', async () => {
    if (!existsSync(FUDGYRELLA_SAVE)) return
    const data = loadResearchDataSync()
    const { save, workspace } = await applyPlayerSaveImportFromDecoded(
      data,
      await decodePlayerInfoFile(new Uint8Array(readFileSync(FUDGYRELLA_SAVE))),
    )

    expect(workshopEnhancementsLabUnlocked(data, workspace.lab.levelOverrides)).toBe(true)
    expect(workspace.build.workshop.enhanceDamageLevel).toBe(save.enhancementLevel[0])
    expect(workspace.build.modules.simGeneratorChassisModuleId).toBe('galaxyCompressor')
    expect(workspace.build.modules.simSubmoduleSelections.generator.main).toEqual({
      'recovery-amount': 'mythic',
      'package-chance': 'mythic',
      'cash-wave': 'mythic',
      'max-recovery': 'mythic',
    })
  })
})
