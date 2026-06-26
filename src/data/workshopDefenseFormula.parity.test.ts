import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  workshopDefenseLegacyStatDisplay,
  WORKSHOP_DEFENSE_UPGRADE_ORDER,
  type WorkshopDefenseStatDisplayOpts,
  type WorkshopDefenseUpgradeKey,
} from './workshopDefense'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { workshopDefenseFormulaStatDisplay } from './workshopFormulaContextDefense'
import { getWorkshopDefenseFormulaSpecs } from './workshopFormulaTables'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import {
  workshopCardAddPercentPoints,
  workshopCardMultProduct,
  mergeLabAndCardMult,
} from './workshopCardWorkshopDisplay'
import type { WorkshopGameCardId } from './workshopGameCards'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import {
  workshopDisplayedHealthEnhancementMultiplier,
  workshopHealthRelicsBonusFraction,
} from './workshopDisplayedHealth'
import {
  workshopDisplayedHealthRegenEnhancementMultiplier,
  workshopHealthRegenRelicsBonusFraction,
} from './workshopDisplayedHealthRegen'
import { workshopDisplayedLandMineDamageEnhancementMultiplier } from './workshopLandMineDamage'
import { workshopDisplayedWallHealthEnhancementMultiplier } from './workshopWallHealth'
import { enrichDefenseStatDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadGodTablesFixture } from '../test/godTablesFixture'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

const DEFENSE_FORMULA_KEYS = Object.keys(
  getWorkshopDefenseFormulaSpecs(),
) as WorkshopDefenseUpgradeKey[]

loadGodTablesFixture()

const BASE_LEVELS: Partial<Record<WorkshopDefenseUpgradeKey, number[]>> = {
  healthLevel: [0, 1, 50, 99],
  healthRegenLevel: [0, 1, 30, 60],
  defensePercentLevel: [0, 1, 25, 50],
  defenseAbsoluteLevel: [0, 1, 50, 99],
  thornDamageLevel: [0, 1, 50, 99],
  lifestealLevel: [0, 1, 25, 50],
  knockbackChanceLevel: [0, 1, 25, 50],
  knockbackForceLevel: [0, 1, 25, 50],
  orbSpeedLevel: [0, 1, 25, 50],
  orbsLevel: [0, 1, 5],
  shockwaveSizeLevel: [0, 1, 25, 50],
  shockwaveFrequencyLevel: [0, 1, 25, 50],
  landMineChanceLevel: [0, 1, 25, 50],
  landMineDamageLevel: [0, 1, 100, 200],
  landMineRadiusLevel: [0, 1, 25, 50],
  deathDefyLevel: [0, 1, 5],
  wallHealthLevel: [0, 1, 25, 50],
  wallRebuildLevel: [0, 1, 25, 50],
}

/** Non-default value for every opts + submodule field, to exercise the enriched path. */
const FULL_OPTS: WorkshopDefenseStatDisplayOpts = {
  armorTowerHealthMultiplier: 1.5,
  healthLabMultiplier: 1.92,
  healthCardMultiplier: 1.5,
  healthRelicsBonus: 0.97,
  healthEnhancementsMultiplier: 1.5,
  healthRegenCardMultiplier: 2.6,
  healthRegenRelicsBonus: 0.97,
  healthRegenEnhancementsMultiplier: 1.498,
  thornDamageRelicsPercentPoints: 25,
  defensePercentLabPercentPoints: 13,
  defenseAbsoluteLabMultiplier: 2.5,
  orbSpeedLabPlus: 0.5,
  orbsLabBonus: 2,
  shockwaveSizeLabPlus: 0.3,
  landMineDamageLabPercentPoints: 50,
  landMineDamageEnhancementsMultiplier: 1.5,
  wallHealthLabPercentPoints: 20,
  wallHealthEnhancementsMultiplier: 1.3,
  wallRebuildLabSecondsReduction: 1.5,
  defensePercentCardPercentPoints: 5,
  knockbackForceRelicPercentPoints: 30,
  orbSpeedRelicPercentPoints: 20,
  submodule: {
    healthRegenPercentBonus: 200,
    defensePercentPoints: 4,
    defenseAbsolutePercentBonus: 10,
    thornDamagePercentPoints: 3,
    lifestealPercentPoints: 2.5,
    knockbackChancePercentPoints: 3,
    knockbackForceAdd: 0.4,
    orbSpeedAdd: 0.2,
    orbsCount: 1,
    shockwaveSizeAdd: 0.15,
    shockwaveFrequencySecondsReduction: 0.8,
    landMineDamagePercentPoints: 20,
    landMineChancePercentPoints: 4,
    landMineRadiusAdd: 0.3,
    deathDefyPercentPoints: 2,
    wallHealthPercentPoints: 10,
    wallRebuildSecondsReduction: 1,
  },
}

describe('workshop defense formula registry parity', () => {
  it('registry covers all 18 defense workshop keys', () => {
    expect(DEFENSE_FORMULA_KEYS).toHaveLength(18)
    expect([...DEFENSE_FORMULA_KEYS].sort()).toEqual([...WORKSHOP_DEFENSE_UPGRADE_ORDER].sort())
  })

  it('every defense formula spec records live-save verification', () => {
    const specs = getWorkshopDefenseFormulaSpecs()
    for (const key of DEFENSE_FORMULA_KEYS) {
      expect(specs[key]?.source.verifiedAgainst, key).toMatch(/^playerInfo\.dat -> /)
    }
  })

  for (const key of DEFENSE_FORMULA_KEYS) {
    it(`${key}: formula matches legacy at base levels (no opts)`, () => {
      const levels = BASE_LEVELS[key] ?? [0, 1, 50]
      for (const level of levels) {
        const legacy = workshopDefenseLegacyStatDisplay(key, level)
        expect(workshopDefenseStatDisplay(key, level), `level ${level}`).toBe(legacy)
      }
    })
  }

  for (const key of DEFENSE_FORMULA_KEYS) {
    it(`${key}: formula matches legacy with full opts`, () => {
      const levels = BASE_LEVELS[key] ?? [0, 1, 50]
      for (const level of levels) {
        const legacy = workshopDefenseLegacyStatDisplay(key, level, FULL_OPTS)
        const formula = workshopDefenseFormulaStatDisplay(key, level, FULL_OPTS)
        // Level-0 ×m previews intentionally defer to legacy (formula returns undefined).
        if (formula === undefined) {
          expect(workshopDefenseStatDisplay(key, level, FULL_OPTS), `level ${level}`).toBe(legacy)
          continue
        }
        expect(formula, `level ${level}`).toBe(legacy)
        expect(workshopDefenseStatDisplay(key, level, FULL_OPTS), `level ${level}`).toBe(legacy)
      }
    })
  }
})

function buildLiveDefenseFormulaOpts(
  ws: ReturnType<typeof mapPlayerSaveToTower>['workshop'],
  research: ReturnType<typeof loadResearchFixture>,
  labOverrides: Record<string, number>,
): WorkshopDefenseStatDisplayOpts | undefined {
  const submoduleCtx = workshopPipelineSubmoduleContext(ws, research, labOverrides)
  const relicOwnedSet = new Set(ws.relicOwnedIds ?? [])
  const enhancementsUnlocked = workshopEnhancementsLabUnlocked(research, labOverrides)
  const lab = buildWorkshopDefenseLabDisplayOpts(research, labOverrides)
  const cardMult = (id: WorkshopGameCardId) =>
    workshopCardMultProduct(ws, research, labOverrides, id)
  const cardAdd = (id: WorkshopGameCardId) =>
    workshopCardAddPercentPoints(ws, research, labOverrides, id)
  const extraDefense = cardAdd('extraDefense')
  const armorChassis = workshopChassisModuleHeroStatMultiplier(ws, 'armor')
  const healthEnhanceMult = workshopDisplayedHealthEnhancementMultiplier(
    ws.enhanceHealthLevel,
    enhancementsUnlocked,
  )
  const healthRegenEnhanceMult = workshopDisplayedHealthRegenEnhancementMultiplier(
    ws.enhanceHealthRegenLevel,
    enhancementsUnlocked,
  )
  const landMineEnhanceMult = workshopDisplayedLandMineDamageEnhancementMultiplier(
    ws.enhanceLandMineDamageLevel,
    enhancementsUnlocked,
  )
  const wallHealthEnhanceMult = workshopDisplayedWallHealthEnhancementMultiplier(
    ws.enhanceWallHealthLevel,
    enhancementsUnlocked,
  )
  const healthCard = cardMult('health')
  const healthRegenCard = cardMult('healthRegen')
  const healthLab =
    lab?.healthLabMultiplier != null && lab.healthLabMultiplier > 1 + 1e-9
      ? lab.healthLabMultiplier
      : undefined
  const healthRelicsBonus = workshopHealthRelicsBonusFraction(relicOwnedSet)
  const healthRegenRelicsBonus = workshopHealthRegenRelicsBonusFraction(relicOwnedSet)
  const enriched: WorkshopDefenseStatDisplayOpts = {
    ...(lab ?? {}),
    ...(armorChassis > 1 + 1e-9 ? { armorTowerHealthMultiplier: armorChassis } : {}),
    healthLabMultiplier: healthLab,
    healthCardMultiplier: healthCard > 1 + 1e-9 ? healthCard : undefined,
    healthRelicsBonus: healthRelicsBonus > 0 ? healthRelicsBonus : undefined,
    healthEnhancementsMultiplier: healthEnhanceMult > 1 + 1e-9 ? healthEnhanceMult : undefined,
    healthRegenCardMultiplier: healthRegenCard > 1 + 1e-9 ? healthRegenCard : undefined,
    healthRegenRelicsBonus: healthRegenRelicsBonus > 0 ? healthRegenRelicsBonus : undefined,
    healthRegenEnhancementsMultiplier:
      healthRegenEnhanceMult > 1 + 1e-9 ? healthRegenEnhanceMult : undefined,
    landMineDamageEnhancementsMultiplier:
      landMineEnhanceMult > 1 + 1e-9 ? landMineEnhanceMult : undefined,
    wallHealthEnhancementsMultiplier:
      wallHealthEnhanceMult > 1 + 1e-9 ? wallHealthEnhanceMult : undefined,
    defenseAbsoluteLabMultiplier: mergeLabAndCardMult(
      lab?.defenseAbsoluteLabMultiplier,
      cardMult('fortress'),
    ),
    defensePercentCardPercentPoints: extraDefense > 0 ? extraDefense : undefined,
  }
  return enrichDefenseStatDisplayOpts(
    enrichDefenseStatDisplayOptsWithSubmodules(
      enriched,
      ws.simSubmoduleSelections,
      submoduleCtx,
    ),
    relicOwnedSet,
  )
}

describe.skipIf(!existsSync(PLAYER_SAVE))(
  'workshop defense formula registry live save parity',
  () => {
    it('matches legacy display for all registered defense formulas', async () => {
      const data = loadResearchFixture()
      const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
      const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
      const opts = buildLiveDefenseFormulaOpts(ws, data, labOverrides)

      for (const key of DEFENSE_FORMULA_KEYS) {
        const level = (ws[key as keyof typeof ws] as number) ?? 0
        const legacy = workshopDefenseLegacyStatDisplay(key, level, opts)
        expect(workshopDefenseStatDisplay(key, level, opts), key).toBe(legacy)
      }
    })
  },
)
