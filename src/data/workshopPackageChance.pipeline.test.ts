import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { workshopCardAddPercentPoints } from './workshopCardWorkshopDisplay'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopPackageChanceStatPercent } from './workshopPackageChance'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopPackageChance pipeline', () => {
  it('calibrates package chance display against in-game', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const packageChanceCard = workshopCardAddPercentPoints(
      ws,
      data,
      labOverrides,
      'recoveryPackageChance',
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          packageChanceCardPercentPoints:
            packageChanceCard > 0 ? packageChanceCard : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.packageChanceLevel
    const base = workshopPackageChanceStatPercent(level)
    const labPts = opts?.packageChanceLabPercentPoints ?? 0
    const cardPts = opts?.packageChanceCardPercentPoints ?? 0
    const display = workshopUtilityStatDisplay('packageChanceLevel', level, opts)

    expect(display).toBe(`${(base + labPts + cardPts).toFixed(2)}%`)
    expect(display).toBe('63.00%')
  })
})
