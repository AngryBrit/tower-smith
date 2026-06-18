import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mergeLabAndCardMult, workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import { workshopDefenseStatDisplay } from './workshopDefense'
import {
  workshopDisplayedHealthEnhancementMultiplier,
  workshopHealthRelicsBonusFraction,
} from './workshopDisplayedHealth'
import {
  workshopDisplayedHealthRegenEnhancementMultiplier,
  workshopHealthRegenRelicsBonusFraction,
} from './workshopDisplayedHealthRegen'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import {
  enrichDefenseStatDisplayOpts,
} from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopHealthRegenStatValue } from './workshopHealthRegen'
import { formatCoinAbbrev } from '../labCosts'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import {
  mapPlayerSaveToTower,
  researchLevelsToOverrides,
} from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

function buildDefenseStatLabDisplayOptsLikeWorkshopPage(
  researchData: ReturnType<typeof loadResearchFixture>,
  workshopPersisted: ReturnType<typeof mapPlayerSaveToTower>['workshop'],
  labLevelOverrides: Record<string, number>,
  relicOwnedSet: ReadonlySet<string>,
) {
  const lab = buildWorkshopDefenseLabDisplayOpts(researchData, labLevelOverrides)
  const cardMult = (id: Parameters<typeof workshopCardMultProduct>[3]) =>
    workshopCardMultProduct(workshopPersisted, researchData, labLevelOverrides, id)
  const cardAdd = (_id: Parameters<typeof workshopCardMultProduct>[3]) => 0
  void cardAdd
  const armorChassis = workshopChassisModuleHeroStatMultiplier(workshopPersisted, 'armor')
  const chassisDefense =
    armorChassis > 1 + 1e-9 ? { armorTowerHealthMultiplier: armorChassis } : {}
  const enhancementsUnlocked = workshopEnhancementsLabUnlocked(
    researchData,
    labLevelOverrides,
  )
  const healthEnhanceMult = workshopDisplayedHealthEnhancementMultiplier(
    workshopPersisted.enhanceHealthLevel,
    workshopPersisted.enhanceHealthRegenLevel,
    enhancementsUnlocked,
  )
  const healthRelicsBonus = workshopHealthRelicsBonusFraction(relicOwnedSet)
  const healthRegenEnhanceMult = workshopDisplayedHealthRegenEnhancementMultiplier(
    workshopPersisted.enhanceHealthRegenLevel,
    enhancementsUnlocked,
  )
  const healthRegenRelicsBonus = workshopHealthRegenRelicsBonusFraction(relicOwnedSet)
  const healthCard = cardMult('health')
  const healthRegenCard = cardMult('healthRegen')
  const healthLab =
    lab?.healthLabMultiplier != null && lab.healthLabMultiplier > 1 + 1e-9
      ? lab.healthLabMultiplier
      : undefined
  const enriched = {
    ...(lab ?? {}),
    ...chassisDefense,
    healthLabMultiplier: healthLab,
    healthCardMultiplier: healthCard > 1 + 1e-9 ? healthCard : undefined,
    healthRelicsBonus: healthRelicsBonus > 0 ? healthRelicsBonus : undefined,
    healthEnhancementsMultiplier:
      healthEnhanceMult > 1 + 1e-9 ? healthEnhanceMult : undefined,
    healthRegenCardMultiplier:
      healthRegenCard > 1 + 1e-9 ? healthRegenCard : undefined,
    healthRegenRelicsBonus:
      healthRegenRelicsBonus > 0 ? healthRegenRelicsBonus : undefined,
    healthRegenEnhancementsMultiplier:
      healthRegenEnhanceMult > 1 + 1e-9 ? healthRegenEnhanceMult : undefined,
    defenseAbsoluteLabMultiplier: mergeLabAndCardMult(
      lab?.defenseAbsoluteLabMultiplier,
      cardMult('fortress'),
    ),
  }
  const submoduleCtx = workshopPipelineSubmoduleContext(
    workshopPersisted,
    researchData,
    labLevelOverrides,
  )
  return enrichDefenseStatDisplayOpts(
    enrichDefenseStatDisplayOptsWithSubmodules(
      enriched,
      workshopPersisted.simSubmoduleSelections,
      submoduleCtx,
    ),
    relicOwnedSet,
  )
}

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopDisplayedHealthRegen pipeline', () => {
  it('matches WorkshopPage defenseStatLabDisplayOpts output', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const labOverrides = researchLevelsToOverrides(data, save.researchLevel)
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const opts = buildDefenseStatLabDisplayOptsLikeWorkshopPage(
      data,
      ws,
      labOverrides,
      relicSet,
    )
    const level = ws.healthRegenLevel
    const display = workshopDefenseStatDisplay('healthRegenLevel', level, opts)
    const base = workshopHealthRegenStatValue(level)
    const withEnhanceForced = {
      ...opts,
      healthRegenEnhancementsMultiplier: 1.45438,
    }
    const displayWithEnhance = workshopDefenseStatDisplay(
      'healthRegenLevel',
      level,
      withEnhanceForced,
    )
    const displayInflated = workshopDefenseStatDisplay(
      'healthRegenLevel',
      level,
      {
        ...opts,
        healthRegenLabMultiplier: 2.86,
        healthRegenEnhancementsMultiplier: 1.45438,
      },
    )
    console.log({
      level,
      base: formatCoinAbbrev(base),
      display,
      displayWithEnhance,
      displayInflated,
      opts: {
        healthLab: opts?.healthLabMultiplier,
        regenLab: opts?.healthRegenLabMultiplier,
        healthCard: opts?.healthCardMultiplier,
        regenCard: opts?.healthRegenCardMultiplier,
        healthRelics: opts?.healthRelicsBonus,
        regenRelics: opts?.healthRegenRelicsBonus,
        healthEnh: opts?.healthEnhancementsMultiplier,
        regenEnh: opts?.healthRegenEnhancementsMultiplier,
        submodule: opts?.submodule?.healthRegenPercentBonus,
        chassis: opts?.armorTowerHealthMultiplier,
      },
    })
    expect(displayWithEnhance).toBe('33.37B/sec')
    expect(displayInflated).toBe('33.37B/sec')
  })
})
