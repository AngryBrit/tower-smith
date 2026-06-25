import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mergeLabAndCardMult, workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import {
  workshopDisplayedCashBonusEnhancementMultiplier,
  workshopCashBonusStatMultiplier,
} from './workshopCashBonus'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopCashBonus pipeline', () => {
  it('calibrates cash bonus display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const cashCard = workshopCardMultProduct(ws, data, labOverrides, 'cash')
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const cashBonusEnhanceMult = workshopDisplayedCashBonusEnhancementMultiplier(
      ws.enhanceCashBonusLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          cashBonusLabMultiplier: mergeLabAndCardMult(lab?.cashBonusLabMultiplier, cashCard),
          cashBonusEnhanceMultiplier:
            cashBonusEnhanceMult > 1 + 1e-9 ? cashBonusEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.cashBonusLevel
    const base = workshopCashBonusStatMultiplier(level)
    const labMult = opts?.cashBonusLabMultiplier ?? 1
    const enhanceMult = opts?.cashBonusEnhanceMultiplier ?? 1
    const display = workshopUtilityStatDisplay('cashBonusLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(cashBonusEnhanceMult).toBe(enhanceMult)
    expect(display).toBe(`x${(base * labMult * enhanceMult).toFixed(2)}`)
    expect(display).toBe('x6.71')
  })
})
