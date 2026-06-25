import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopDisplayedCashBonusEnhancementMultiplier } from './workshopCashBonus'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopInterestPerWaveStatPercentPoints } from './workshopInterestPerWave'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopInterestPerWave pipeline', () => {
  it('calibrates interest per wave display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const cashBonusEnhanceMult = workshopDisplayedCashBonusEnhancementMultiplier(
      ws.enhanceCashBonusLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          cashBonusEnhanceMultiplier:
            cashBonusEnhanceMult > 1 + 1e-9 ? cashBonusEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.interestPerWaveLevel
    const workshop = workshopInterestPerWaveStatPercentPoints(level)
    const display = workshopUtilityStatDisplay('interestPerWaveLevel', level, opts)

    expect(workshop).toBe(5.94)
    // libil2cpp.so: workshop × Cash Bonus+ (not Interest × Cash/Wave labs).
    expect(cashBonusEnhanceMult).toBeCloseTo(1.4, 2)
    expect(workshop * cashBonusEnhanceMult).toBeCloseTo(8.32, 1)
    expect(display).toBe('8.32%')
  })
})
