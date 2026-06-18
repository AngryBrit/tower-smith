import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichDefenseStatDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import {
  workshopDisplayedLandMineDamageEnhancementMultiplier,
  workshopLandMineDamageStatPercent,
} from './workshopLandMineDamage'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'
const IN_GAME = 72

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopLandMineDamage pipeline', () => {
  it('calibrates land mine damage display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopDefenseLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const landMineEnhanceMult = workshopDisplayedLandMineDamageEnhancementMultiplier(
      ws.enhanceLandMineDamageLevel,
      enhancementsUnlocked,
    )
    const opts = enrichDefenseStatDisplayOpts(
      enrichDefenseStatDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          landMineDamageEnhancementsMultiplier:
            landMineEnhanceMult > 1 + 1e-9 ? landMineEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.landMineDamageLevel
    const base = workshopLandMineDamageStatPercent(level)
    const display = workshopDefenseStatDisplay('landMineDamageLevel', level, opts)
    const enhance = workshopEnhanceTier400Multiplier(
      ws.enhanceLandMineDamageLevel,
      'Land Mine Damage +',
    )

    expect(enhancementsUnlocked).toBe(true)
    expect(landMineEnhanceMult).toBe(4)
    expect(opts?.landMineDamageEnhancementsMultiplier).toBe(4)
    expect(base * enhance).toBe(IN_GAME)
    expect(display).toBe('x72.0')
  })
})
