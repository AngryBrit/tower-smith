import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import {
  workshopDisplayedRecoveryAmountEnhancementMultiplier,
  workshopRecoveryAmountStatPercent,
} from './workshopRecoveryAmount'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopRecoveryAmount pipeline', () => {
  it('calibrates recovery amount display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const recoveryAmountEnhanceMult = workshopDisplayedRecoveryAmountEnhancementMultiplier(
      ws.enhanceRecoveryPackageLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          recoveryAmountEnhancementsMultiplier:
            recoveryAmountEnhanceMult > 1 + 1e-9 ? recoveryAmountEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.recoveryAmountLevel
    const base = workshopRecoveryAmountStatPercent(level)
    const labPts = opts?.recoveryAmountLabPercentPoints ?? 0
    const relicMult = opts?.recoveryAmountRelicMultiplier ?? 1
    const display = workshopUtilityStatDisplay('recoveryAmountLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(ws.enhanceRecoveryPackageLevel).toBe(40)
    expect(recoveryAmountEnhanceMult).toBe(
      workshopDisplayedRecoveryAmountEnhancementMultiplier(40, true),
    )
    // Game formula (Main::GetOutOfRoundRecoveryAmount):
    // (14 + 0.4·level + lab%) × Recovery Package+ × (1 + recovery relic %).
    expect(display).toBe(
      `${((base + labPts) * recoveryAmountEnhanceMult * relicMult).toFixed(2)}%`,
    )
    expect(display).toBe('220.86%')
  })
})
