import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mergeLabAndCardMult, workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import {
  workshopDisplayedCashBonusEnhancementAdditive,
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

const PLAYER_SAVE = 'h:/The Tower/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopCashBonus pipeline', () => {
  it('calibrates cash bonus display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = { workshop: ws, research: data, labOverrides }
    const cashCard = workshopCardMultProduct(ws, data, labOverrides, 'cash')
    const generatorChassis = workshopChassisModuleHeroStatMultiplier(ws, 'generator')
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const cashBonusEnhanceAdd = workshopDisplayedCashBonusEnhancementAdditive(
      ws.enhanceCashBonusLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          ...(generatorChassis > 1 + 1e-9
            ? { generatorCashBonusMultiplier: generatorChassis }
            : {}),
          cashBonusLabMultiplier: mergeLabAndCardMult(lab?.cashBonusLabMultiplier, cashCard),
          cashBonusEnhanceAdditive:
            cashBonusEnhanceAdd > 0 ? cashBonusEnhanceAdd : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.cashBonusLevel
    const base = workshopCashBonusStatMultiplier(level)
    const chassis = opts?.generatorCashBonusMultiplier ?? 1
    const labMult = opts?.cashBonusLabMultiplier ?? 1
    const enhanceAdd = opts?.cashBonusEnhanceAdditive ?? 0
    const display = workshopUtilityStatDisplay('cashBonusLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(cashBonusEnhanceAdd).toBe(enhanceAdd)
    expect(display).toBe(`x${(base * chassis * labMult + enhanceAdd).toFixed(2)}`)
    expect(display).toBe('x5.19')
  })
})
