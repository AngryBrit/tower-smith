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

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopFreeUpgrades pipeline', () => {
  it('calibrates free upgrade displays against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const card = workshopCardAddPercentPoints(ws, data, labOverrides, 'freeUpgrades')
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          freeUpgradesCardPercentPoints: card > 0 ? card : undefined,
          enhanceFreeUpgradesLevel: ws.enhanceFreeUpgradesLevel,
          workshopEnhancementsLabUnlocked: enhancementsUnlocked,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )

    expect(enhancementsUnlocked).toBe(true)
    expect(card).toBe(10)
    expect(opts?.submodule?.freeAttackUpgradePercentPoints).toBe(6)
    expect(opts?.submodule?.freeDefenseUpgradePercentPoints).toBe(6)
    expect(opts?.submodule?.freeUtilityUpgradePercentPoints).toBe(6)

    expect(
      workshopUtilityStatDisplay('freeAttackUpgradeLevel', ws.freeAttackUpgradeLevel, opts),
    ).toBe('76.37%')
    expect(
      workshopUtilityStatDisplay('freeDefenseUpgradeLevel', ws.freeDefenseUpgradeLevel, opts),
    ).toBe('77.81%')
    expect(
      workshopUtilityStatDisplay('freeUtilityUpgradeLevel', ws.freeUtilityUpgradeLevel, opts),
    ).toBe('77.81%')
  })
})
