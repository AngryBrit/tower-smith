import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopCardAddPercentPoints } from './workshopCardWorkshopDisplay'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopFreeAttackUpgrade pipeline', () => {
  it('calibrates free attack upgrade display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const freeUpgradesCard = workshopCardAddPercentPoints(
      ws,
      data,
      labOverrides,
      'freeUpgrades',
    )
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          freeUpgradesCardPercentPoints:
            freeUpgradesCard > 0 ? freeUpgradesCard : undefined,
          enhanceFreeUpgradesLevel: ws.enhanceFreeUpgradesLevel,
          workshopEnhancementsLabUnlocked: enhancementsUnlocked,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.freeAttackUpgradeLevel
    const display = workshopUtilityStatDisplay('freeAttackUpgradeLevel', level, opts)

    expect(enhancementsUnlocked).toBe(true)
    expect(opts?.freeAttackUpgradeRelicPercentPoints).toBe(8)
    expect(opts?.submodule?.freeAttackUpgradePercentPoints).toBe(6)
    expect(display).toBe('79.25%')
  })
})
