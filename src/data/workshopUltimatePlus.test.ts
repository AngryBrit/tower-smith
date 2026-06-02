import { describe, expect, it } from 'vitest'
import {
  ULTIMATE_PLUS_LEVEL_LOCKED,
  ULTIMATE_PLUS_UNLOCK_COSTS,
  workshopUltimatePlusClampLevel,
  workshopUltimatePlusNextMarginalStones,
  workshopUltimatePlusNextUnlockCost,
  workshopUltimatePlusStatDisplay,
  workshopUltimatePlusStonesToMaxFromLocked,
  workshopUltimatePlusTotalStonesToMaxFrom,
  workshopUltimatePlusUnlockCostForAbility,
  workshopUltimatePlusUnlockSpentStones,
  workshopUltimatePlusUnlockedCount,
} from './workshopUltimatePlus'

describe('workshop ultimate plus wiki spot checks', () => {
  it('keeps locked level -1 through clamp', () => {
    expect(workshopUltimatePlusClampLevel('spotlightLightRange', ULTIMATE_PLUS_LEVEL_LOCKED)).toBe(
      ULTIMATE_PLUS_LEVEL_LOCKED,
    )
  })

  it('unlock costs match wiki (9 purchases)', () => {
    expect([...ULTIMATE_PLUS_UNLOCK_COSTS]).toEqual([
      500, 625, 750, 975, 1250, 1650, 2200, 2900, 3800,
    ])
    expect(workshopUltimatePlusUnlockedCount({})).toBe(0)
    expect(workshopUltimatePlusNextUnlockCost({})).toBe(500)
    expect(
      workshopUltimatePlusNextUnlockCost({
        ultimatePlusChainLightningSmiteLevel: 0,
      }),
    ).toBe(625)
    expect(workshopUltimatePlusUnlockSpentStones({})).toBe(0)
    expect(
      workshopUltimatePlusUnlockSpentStones({
        ultimatePlusChainLightningSmiteLevel: 0,
        ultimatePlusSmartMissilesCoverFireLevel: 2,
      }),
    ).toBe(500 + 625)
  })

  it('locked ability uses global unlock cost, not first upgrade marginal', () => {
    expect(workshopUltimatePlusUnlockCostForAbility({}, 'poisonSwampDeathCreep')).toBe(500)
    expect(workshopUltimatePlusNextMarginalStones('poisonSwampDeathCreep', -1)).toBeUndefined()
    expect(workshopUltimatePlusStonesToMaxFromLocked({}, 'poisonSwampDeathCreep')).toBe(
      500 + 10_000,
    )
  })

  it('Chain Lightning Smite L0 is 5.00% with next cost 300', () => {
    expect(workshopUltimatePlusStatDisplay('chainLightningSmite', 0)).toBe('5.00%')
    expect(workshopUltimatePlusNextMarginalStones('chainLightningSmite', 0)).toBe(300)
  })

  it('Smart Missiles Cover Fire L10 is 3s (max)', () => {
    expect(workshopUltimatePlusStatDisplay('smartMissilesCoverFire', 10)).toBe('3s')
    expect(workshopUltimatePlusNextMarginalStones('smartMissilesCoverFire', 10)).toBeUndefined()
  })

  it('300-base track upgrade costs sum to 10,000 stones for 10 levels from L0', () => {
    expect(workshopUltimatePlusTotalStonesToMaxFrom('chainLightningSmite', 0)).toBe(10_000)
    expect(workshopUltimatePlusTotalStonesToMaxFrom('poisonSwampDeathCreep', 0)).toBe(10_000)
  })

  it('18570 and 400-base tracks match 10-step marginal sums from L0', () => {
    expect(workshopUltimatePlusTotalStonesToMaxFrom('goldenTowerGoldenCombo', 0)).toBe(7970)
    expect(workshopUltimatePlusTotalStonesToMaxFrom('deathWaveKillWall', 0)).toBe(9750)
  })
})
