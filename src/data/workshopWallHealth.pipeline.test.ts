import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichDefenseStatDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichDefenseStatDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import {
  workshopDisplayedWallHealthEnhancementMultiplier,
  workshopWallHealthStatPercent,
} from './workshopWallHealth'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopWallHealth pipeline', () => {
  it('calibrates wall health display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopDefenseLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const wallHealthEnhanceMult = workshopDisplayedWallHealthEnhancementMultiplier(
      ws.enhanceWallHealthLevel,
      enhancementsUnlocked,
    )
    const opts = enrichDefenseStatDisplayOpts(
      enrichDefenseStatDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          wallHealthEnhancementsMultiplier:
            wallHealthEnhanceMult > 1 + 1e-9 ? wallHealthEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.wallHealthLevel
    const base = workshopWallHealthStatPercent(level)
    const labPts = opts?.wallHealthLabPercentPoints ?? 0
    const enhance = workshopEnhanceTier400Multiplier(
      ws.enhanceWallHealthLevel,
      'Wall Health +',
    )
    const display = workshopDefenseStatDisplay('wallHealthLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(wallHealthEnhanceMult).toBe(enhance)
    expect(opts?.wallHealthEnhancementsMultiplier).toBe(enhance)
    expect((base + labPts) * enhance).toBeCloseTo((base + labPts) * wallHealthEnhanceMult, 6)
    expect(display).toBe(`${((base + labPts) * enhance).toFixed(2)}%`)
  })
})
