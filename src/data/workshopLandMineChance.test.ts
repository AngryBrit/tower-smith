import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL,
  workshopLandMineChanceNextMarginalCoins,
  workshopLandMineChanceStatDisplay,
  workshopLandMineChanceStatPercentPoints,
} from './workshopLandMineChance'

describe('workshopLandMineChance', () => {
  it('has 50 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL; k += 1) {
      const c = workshopLandMineChanceNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(15_469_285)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopLandMineChanceStatPercentPoints(0)).toBe(0)
    expect(workshopLandMineChanceStatDisplay(1)).toBe('0.60%')
    expect(workshopLandMineChanceStatDisplay(50)).toBe('30.00%')
    expect(workshopLandMineChanceNextMarginalCoins(0)).toBe(500)
    expect(workshopLandMineChanceNextMarginalCoins(49)).toBe(1_260_000)
    expect(workshopLandMineChanceNextMarginalCoins(50)).toBeUndefined()
  })
})
