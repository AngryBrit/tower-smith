import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import {
  workshopDisplayedCoinsKillBonusLabMultiplier,
  workshopCoinsKillBonusStatMultiplier,
} from './workshopCoinsKillBonus'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopCoinsKillBonus pipeline', () => {
  it('calibrates coins kill bonus display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const coinsCard = workshopCardMultProduct(ws, data, labOverrides, 'coins')
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          coinsKillBonusCardMultiplier: coinsCard > 1 + 1e-9 ? coinsCard : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.coinsKillBonusLevel
    const workshop = workshopCoinsKillBonusStatMultiplier(level)
    const labMult = workshopDisplayedCoinsKillBonusLabMultiplier(
      opts?.coinsKillBonusLabMultiplier,
      opts?.coinsKillBonusCardMultiplier ?? 1,
    )
    const display = workshopUtilityStatDisplay('coinsKillBonusLevel', level, opts)

    expect(opts?.coinsKillBonusLabMultiplier).toBeCloseTo(lab?.coinsKillBonusLabMultiplier ?? 1, 2)
    expect(labMult).toBeCloseTo((lab?.coinsKillBonusLabMultiplier ?? 1) * Math.sqrt(coinsCard), 4)
    expect(workshop * labMult).toBeCloseTo(6.92, 1)
    expect(display).toBe('x6.92')
  })
})
