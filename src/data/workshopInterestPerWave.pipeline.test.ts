import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopInterestPerWaveStatPercentPoints } from './workshopInterestPerWave'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopInterestPerWave pipeline', () => {
  it('calibrates interest per wave display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        { ...(lab ?? {}) },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.interestPerWaveLevel
    const workshop = workshopInterestPerWaveStatPercentPoints(level)
    const display = workshopUtilityStatDisplay('interestPerWaveLevel', level, opts)

    expect(workshop).toBe(5.94)
    expect(lab?.cashPerWaveLabMultiplier).toBeCloseTo(1.1, 2)
    expect(lab?.interestPerWaveLabMultiplier).toBeCloseTo(1.1, 2)
    expect(display).toBe('6.53%')
  })
})
