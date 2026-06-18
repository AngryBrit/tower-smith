import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichDefenseStatDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopThornDamageStatPercentPoints } from './workshopThornDamage'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import {
  mapPlayerSaveToTower,
  researchLevelsToOverrides,
} from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'
const IN_GAME = 109

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopThornDamage pipeline', () => {
  it('prints thorn damage factors', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const labOverrides = researchLevelsToOverrides(data, save.researchLevel)
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopDefenseLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enriched = { ...(lab ?? {}) }
    const opts = enrichDefenseStatDisplayOpts(
      enrichDefenseStatDisplayOptsWithSubmodules(
        enriched,
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.thornDamageLevel
    const base = workshopThornDamageStatPercentPoints(level)
    const display = workshopDefenseStatDisplay('thornDamageLevel', level, opts)
    const relic = opts?.thornDamageRelicsPercentPoints ?? 0
    const withGarlicLab = workshopDefenseStatDisplay('thornDamageLevel', level, {
      ...opts,
      thornDamageRelicsPercentPoints: relic,
    })

    expect(display).toBe('109%')
    expect(withGarlicLab).toBe('109%')
    expect(base + relic).toBe(IN_GAME)
  })
})
