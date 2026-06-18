import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mergeLabAndCardMult, workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import { workshopCashPerWaveStatAmount } from './workshopCashPerWave'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopCashPerWave pipeline', () => {
  it('calibrates cash per wave display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const cashCard = workshopCardMultProduct(ws, data, labOverrides, 'cash')
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          cashPerWaveLabMultiplier: mergeLabAndCardMult(lab?.cashPerWaveLabMultiplier, cashCard),
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.cashPerWaveLevel
    const workshop = workshopCashPerWaveStatAmount(level)
    const labMult = opts?.cashPerWaveLabMultiplier ?? 1
    const display = workshopUtilityStatDisplay('cashPerWaveLevel', level, opts)

    expect(lab?.cashPerWaveLabMultiplier).toBeCloseTo(1.1, 2)
    expect(labMult).toBeCloseTo(1.1, 2)
    expect(Math.round(workshop * labMult)).toBe(656)
    expect(display).toBe('656')
  })
})
