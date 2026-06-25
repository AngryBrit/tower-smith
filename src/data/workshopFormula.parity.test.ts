import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopDisplayedEnemyLevelSkipEnhancementMultiplier } from './workshopEnemyAttackLevelSkip'
import { workshopDisplayedRecoveryAmountEnhancementMultiplier } from './workshopRecoveryAmount'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityFormulaStatDisplay } from './workshopFormulaContext'
import { getWorkshopFormulaSpecs } from './workshopFormulaTables'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

const FORMULA_KEYS = Object.keys(getWorkshopFormulaSpecs())

describe('workshop formula registry parity', () => {
  it('registry covers the verified utility workshop keys', () => {
    expect(FORMULA_KEYS).toEqual(
      expect.arrayContaining([
        'cashBonusLevel',
        'coinsKillBonusLevel',
        'interestPerWaveLevel',
        'recoveryAmountLevel',
        'freeAttackUpgradeLevel',
        'freeDefenseUpgradeLevel',
        'freeUtilityUpgradeLevel',
      ]),
    )
    expect(FORMULA_KEYS).toHaveLength(13)
  })

  it('every utility formula spec records live-save verification', () => {
    const specs = getWorkshopFormulaSpecs()
    for (const key of FORMULA_KEYS) {
      expect(specs[key]?.source.verifiedAgainst, key).toMatch(/^playerInfo\.dat -> /)
    }
  })

  for (const key of FORMULA_KEYS) {
    it(`${key}: formula evaluator matches workshopUtilityStatDisplay at base levels`, () => {
      for (const level of [0, 1, 99, 149, 300]) {
        const legacy = workshopUtilityStatDisplay(
          key as Parameters<typeof workshopUtilityStatDisplay>[0],
          level,
        )
        const formula = workshopUtilityFormulaStatDisplay(
          key as Parameters<typeof workshopUtilityFormulaStatDisplay>[0],
          level,
        )
        expect(formula).toBe(legacy)
      }
    })
  }
})

describe.skipIf(!existsSync(PLAYER_SAVE))('workshop formula registry live save parity', () => {
  it('matches pipeline display for all registered formulas', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const recoveryAmountEnhanceMult = workshopDisplayedRecoveryAmountEnhancementMultiplier(
      ws.enhanceRecoveryPackageLevel,
      enhancementsUnlocked,
    )
    const enemyLevelSkipEnhanceMult = workshopDisplayedEnemyLevelSkipEnhancementMultiplier(
      ws.enhanceEnemyLevelSkipLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          cashBonusEnhanceMultiplier: undefined,
          coinsKillBonusEnhanceMultiplier: undefined,
          recoveryAmountEnhancementsMultiplier:
            recoveryAmountEnhanceMult > 1 + 1e-9 ? recoveryAmountEnhanceMult : undefined,
          enemyLevelSkipEnhancementsMultiplier:
            enemyLevelSkipEnhanceMult > 1 + 1e-9 ? enemyLevelSkipEnhanceMult : undefined,
          enhanceFreeUpgradesLevel: ws.enhanceFreeUpgradesLevel,
          workshopEnhancementsLabUnlocked: enhancementsUnlocked,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )

    const levels: Record<string, number> = {
      cashBonusLevel: ws.cashBonusLevel,
      coinsKillBonusLevel: ws.coinsKillBonusLevel,
      interestPerWaveLevel: ws.interestPerWaveLevel,
      recoveryAmountLevel: ws.recoveryAmountLevel,
      freeAttackUpgradeLevel: ws.freeAttackUpgradeLevel,
      freeDefenseUpgradeLevel: ws.freeDefenseUpgradeLevel,
      freeUtilityUpgradeLevel: ws.freeUtilityUpgradeLevel,
      maxRecoveryLevel: ws.maxRecoveryLevel,
      packageChanceLevel: ws.packageChanceLevel,
      enemyAttackLevelSkipLevel: ws.enemyAttackLevelSkipLevel,
      enemyHealthLevelSkipLevel: ws.enemyHealthLevelSkipLevel,
      cashPerWaveLevel: ws.cashPerWaveLevel,
      coinsWaveLevel: ws.coinsWaveLevel,
    }

    for (const key of FORMULA_KEYS) {
      const level = levels[key] ?? 0
      const legacy = workshopUtilityStatDisplay(
        key as Parameters<typeof workshopUtilityStatDisplay>[0],
        level,
        opts,
      )
      const formula = workshopUtilityFormulaStatDisplay(
        key as Parameters<typeof workshopUtilityFormulaStatDisplay>[0],
        level,
        opts,
      )
      expect(formula).toBe(legacy)
    }
  })
})
