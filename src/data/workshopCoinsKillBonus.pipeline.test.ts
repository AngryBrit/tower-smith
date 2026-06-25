import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  workshopCoinsKillBonusStatMultiplier,
  workshopDisplayedCoinsKillBonusEnhancementMultiplier,
} from './workshopCoinsKillBonus'
import { buildWorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { enrichUtilityLabDisplayOpts } from './workshopRelicWorkshopDisplay'
import { enrichUtilityLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { decodePlayerInfoFile } from '../playerSave/decodePlayerInfo'
import { mapPlayerSaveToTower } from '../playerSave/mapPlayerDataToTower'
import { loadResearchFixture } from '../test/researchFixture'
import { workshopPipelineSubmoduleContext } from '../test/workshopPipelineSubmoduleContext'

const PLAYER_SAVE = 'h:/The Tower/SaveGames/playerInfo.dat'

describe.skipIf(!existsSync(PLAYER_SAVE))('workshopCoinsKillBonus pipeline', () => {
  it('calibrates coins kill bonus display against the wiki formula (lab × Coin Bonus+)', async () => {
    const data = loadResearchFixture()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(PLAYER_SAVE)))
    const { workshop: ws, overrides: labOverrides } = mapPlayerSaveToTower(data, save)
    const relicSet = new Set(ws.relicOwnedIds ?? [])
    const lab = buildWorkshopUtilityLabDisplayOpts(data, labOverrides)
    const submoduleCtx = workshopPipelineSubmoduleContext(ws, data, labOverrides)
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(data, labOverrides)
    const coinBonusEnhanceMult = workshopDisplayedCoinsKillBonusEnhancementMultiplier(
      ws.enhanceCoinBonusLevel,
      enhancementsUnlocked,
    )
    const opts = enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          coinsKillBonusEnhanceMultiplier:
            coinBonusEnhanceMult > 1 + 1e-9 ? coinBonusEnhanceMult : undefined,
        },
        ws.simSubmoduleSelections,
        submoduleCtx,
      ),
      relicSet,
    )
    const level = ws.coinsKillBonusLevel
    const workshop = workshopCoinsKillBonusStatMultiplier(level)
    const labMult = opts?.coinsKillBonusLabMultiplier ?? 1
    const display = workshopUtilityStatDisplay('coinsKillBonusLevel', level, opts)

    // Coins card, coin relics, and the generator's Coin Bonus are all excluded (no steady-state
    // effect on this card in-game, verified in libil2cpp.so: the getter never reads relics.coin,
    // and coinsMultFromModule is a transient in-run accumulation that resets to 1.0).
    expect(opts?.coinsKillBonusLabMultiplier).toBeCloseTo(lab?.coinsKillBonusLabMultiplier ?? 1, 4)
    // workshop x2.49 × lab x2.78 × Coin Bonus+ x1.26 = x8.72 (matches in-game after a reset).
    expect(workshop * labMult * coinBonusEnhanceMult).toBeCloseTo(8.72, 1)
    expect(display).toBe('x8.72')
  })
})
