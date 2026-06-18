import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import {
  workshopDisplayedMaxRecoveryEnhancementMultiplier,
  workshopMaxRecoveryStatMultiplier,
} from './workshopMaxRecovery'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopMaxRecovery pipeline', () => {
  it('calibrates max recovery display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const maxRecoveryEnhanceMult = workshopDisplayedMaxRecoveryEnhancementMultiplier(
      ws.enhanceRecoveryPackageLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          maxRecoveryEnhancementsMultiplier:
            maxRecoveryEnhanceMult > 1 + 1e-9 ? maxRecoveryEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.maxRecoveryLevel
    const base = workshopMaxRecoveryStatMultiplier(level)
    const labMult = opts?.maxRecoveryLabMultiplier ?? 1
    const display = workshopUtilityStatDisplay('maxRecoveryLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(ws.enhanceRecoveryPackageLevel).toBe(40)
    expect(maxRecoveryEnhanceMult).toBe(1.4)
    expect(display).toBe(`x${(base * labMult * maxRecoveryEnhanceMult).toFixed(2)}`)
    expect(display).toBe('x23.10')
  })
})
