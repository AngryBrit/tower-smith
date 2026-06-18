import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { enrichDefenseStatDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopKnockbackForceStatMultiplier } from './workshopKnockbackForce'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import {
  mapPlayerSaveToTower,
  researchLevelsToOverrides,
} from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'
const IN_GAME = 7.78

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopKnockbackForce pipeline', () => {
  it('calibrates knockback force display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const labOverrides = researchLevelsToOverrides(data, save.researchLevel)
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const opts = enrichDefenseStatDisplayOpts(
      enrichDefenseStatDisplayOptsWithSubmodules(
        {},
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.knockbackForceLevel
    const base = workshopKnockbackForceStatMultiplier(level)
    const display = workshopDefenseStatDisplay('knockbackForceLevel', level, opts)
    const relic = opts?.knockbackForceRelicPercentPoints ?? 0
    const sub = opts?.submodule?.knockbackForceAdd ?? 0

    const tries: [string, number][] = [
      ['base', base],
      ['base+sub', base + sub],
      ['base*(1+relic%)', base * (1 + relic / 100)],
      ['(base+sub)*(1+relic%)', (base + sub) * (1 + relic / 100)],
      ['base+sub+base*relic% additive', base + sub + (base * relic) / 100],
      ['(base+sub*0.5)*(1+relic%)', (base + sub * 0.5) * (1 + relic / 100)],
    ]

    console.log({ level, base, display, inGame: IN_GAME, relic, sub })
    for (const [name, v] of tries) {
      console.log(name, v.toFixed(2), 'ratio', (v / IN_GAME).toFixed(4))
    }

    expect(display).toBe('7.78')
    expect(base * (1 + relic / 100)).toBeCloseTo(IN_GAME, 2)
  })
})
