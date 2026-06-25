import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import {
  buildWorkshopAttackLabDisplayOpts,
} from './workshopLabDisplayOpts'
import { workshopDamageDisplayOptsFromPersisted } from './workshopDisplayedDamage'
import { workshopAttackSpeedDisplayOptsFromPersisted } from './workshopDisplayedAttackSpeed'
import { workshopDisplayedCritFactorEnhancementMultiplier } from './workshopCriticalFactor'
import { workshopDisplayedSuperCritMultEnhancementMultiplier } from './workshopSuperCritMult'
import {
  workshopDisplayedRendArmorChanceEnhancementMultiplier,
  workshopDisplayedRendArmorMultEnhancementMultiplier,
} from './workshopRendArmor'
import { enrichAttackLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichAttackLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import {
  workshopAttackFormulaStatDisplay,
  workshopAttackLegacyStatDisplay,
  type WorkshopAttackFormulaOpts,
  type WorkshopAttackUpgradeKey,
} from './workshopFormulaContextAttack'
import { getWorkshopAttackFormulaSpecs } from './workshopFormulaTables'
import { workshopAttackStatDisplay } from './workshopAttack'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadGodTablesFixture } from '../test/godTablesFixture'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'
import { totalCannonAttackSpeedFromSelections } from './workshopSubmoduleSelection'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

const ATTACK_FORMULA_KEYS = Object.keys(getWorkshopAttackFormulaSpecs())

loadGodTablesFixture()

const BASE_LEVELS: Partial<Record<WorkshopAttackUpgradeKey, number[]>> = {
  damageLevel: [0, 1, 99, 6000],
  attackSpeedLevel: [0, 1, 50, 99],
  critChanceLevel: [0, 1, 40, 79],
  critFactorLevel: [0, 1, 75, 150],
  attackRangeLevel: [0, 1, 40, 79],
  damagePerMeterLevel: [0, 1, 100, 200],
  multishotChanceLevel: [0, 1, 50, 99],
  multishotTargetsLevel: [0, 1, 7],
  rapidFireChanceLevel: [0, 1, 40, 85],
  rapidFireDurationLevel: [0, 1, 50, 99],
  bounceShotChanceLevel: [0, 1, 40, 85],
  bounceShotTargetsLevel: [0, 1, 7],
  bounceShotRangeLevel: [0, 1, 30, 60],
  superCritChanceLevel: [0, 1, 50, 100],
  superCritMultLevel: [0, 1, 60, 120],
  rendArmorChanceLevel: [0, 1, 150, 299],
  rendArmorMultLevel: [0, 1, 150, 299],
}

describe('workshop attack formula registry parity', () => {
  it('registry covers all 17 attack workshop keys', () => {
    expect(ATTACK_FORMULA_KEYS).toHaveLength(17)
    expect(ATTACK_FORMULA_KEYS).toEqual(
      expect.arrayContaining([
        'damageLevel',
        'attackSpeedLevel',
        'critChanceLevel',
        'critFactorLevel',
        'rendArmorMultLevel',
      ]),
    )
  })

  it('every attack formula spec records live-save verification', () => {
    const specs = getWorkshopAttackFormulaSpecs()
    for (const key of ATTACK_FORMULA_KEYS) {
      expect(specs[key]?.source.verifiedAgainst, key).toMatch(/^playerInfo\.dat -> /)
    }
  })

  for (const key of ATTACK_FORMULA_KEYS) {
    it(`${key}: formula evaluator matches legacy display at base levels`, () => {
      const levels = BASE_LEVELS[key as WorkshopAttackUpgradeKey] ?? [0, 1, 99]
      for (const level of levels) {
        const legacy = workshopAttackLegacyStatDisplay(key as WorkshopAttackUpgradeKey, level)
        const formula = workshopAttackFormulaStatDisplay(key as WorkshopAttackUpgradeKey, level)
        expect(formula, `level ${level}`).toBe(legacy)
        expect(workshopAttackStatDisplay(key as WorkshopAttackUpgradeKey, level)).toBe(legacy)
      }
    })
  }
})

function buildLiveAttackFormulaOpts(
  ws: ReturnType<typeof mapPlayerSaveToTower>['workshop'],
  research: ReturnType<typeof loadResearchFixture>,
  labOverrides: Record<string, number>,
  gameResearchLevel: readonly number[] | null | undefined,
): WorkshopAttackFormulaOpts {
  const submoduleCtx = workshopPipelineSubmoduleContext(ws, research, labOverrides)
  const enhancementsUnlocked = workshopEnhancementsLabUnlocked(research, labOverrides)
  const lab = buildWorkshopAttackLabDisplayOpts(research, labOverrides)
  const withSubmodules = enrichAttackLabDisplayOptsWithSubmodules(
    lab,
    ws.simSubmoduleSelections,
    submoduleCtx,
  )
  const attackLab = enrichAttackLabDisplayOpts(withSubmodules, new Set(ws.relicOwnedIds ?? []))
  const damageOpts = workshopDamageDisplayOptsFromPersisted(
    ws,
    research,
    labOverrides,
    gameResearchLevel,
  )
  const attackSpeedOpts = workshopAttackSpeedDisplayOptsFromPersisted(
    ws,
    research,
    labOverrides,
    gameResearchLevel,
  )
  return {
    ...(attackLab ?? {}),
    ...damageOpts,
    ...attackSpeedOpts,
    moduleSubEffect: totalCannonAttackSpeedFromSelections(
      ws.simSubmoduleSelections,
      submoduleCtx,
    ),
    critFactorEnhancementMultiplier: workshopDisplayedCritFactorEnhancementMultiplier(
      ws.enhanceCritFactorLevel,
      enhancementsUnlocked,
    ),
    superCritMultEnhancementMultiplier: workshopDisplayedSuperCritMultEnhancementMultiplier(
      ws.enhanceSuperCritMultLevel,
      enhancementsUnlocked,
    ),
    rendArmorChanceEnhancementMultiplier: workshopDisplayedRendArmorChanceEnhancementMultiplier(
      ws.enhanceRendArmorLevel,
      enhancementsUnlocked,
    ),
    rendArmorMultEnhancementMultiplier: workshopDisplayedRendArmorMultEnhancementMultiplier(
      ws.enhanceRendArmorLevel,
      enhancementsUnlocked,
    ),
  }
}

describe.skipIf(!existsSync(PLAYER_SAVE))('workshop attack formula registry live save parity', () => {
  it('matches legacy display for all registered attack formulas', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const opts = buildLiveAttackFormulaOpts(ws, data, labOverrides, save.researchLevel)

    const levels: Record<string, number> = {
      damageLevel: ws.damageLevel,
      attackSpeedLevel: ws.attackSpeedLevel,
      critChanceLevel: ws.critChanceLevel,
      critFactorLevel: ws.critFactorLevel,
      attackRangeLevel: ws.attackRangeLevel,
      damagePerMeterLevel: ws.damagePerMeterLevel,
      multishotChanceLevel: ws.multishotChanceLevel,
      multishotTargetsLevel: ws.multishotTargetsLevel,
      rapidFireChanceLevel: ws.rapidFireChanceLevel,
      rapidFireDurationLevel: ws.rapidFireDurationLevel,
      bounceShotChanceLevel: ws.bounceShotChanceLevel,
      bounceShotTargetsLevel: ws.bounceShotTargetsLevel,
      bounceShotRangeLevel: ws.bounceShotRangeLevel,
      superCritChanceLevel: ws.superCritChanceLevel,
      superCritMultLevel: ws.superCritMultLevel,
      rendArmorChanceLevel: ws.rendArmorChanceLevel,
      rendArmorMultLevel: ws.rendArmorMultLevel,
    }

    for (const key of ATTACK_FORMULA_KEYS) {
      const level = levels[key] ?? 0
      const legacy = workshopAttackLegacyStatDisplay(key as WorkshopAttackUpgradeKey, level, opts)
      const formula = workshopAttackFormulaStatDisplay(
        key as WorkshopAttackUpgradeKey,
        level,
        opts,
      )
      expect(formula, key).toBe(legacy)
    }
  })
})
