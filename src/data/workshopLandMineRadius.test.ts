import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL,
  workshopLandMineRadiusNextMarginalCoins,
  workshopLandMineRadiusStatDisplay,
  workshopLandMineRadiusStatValue,
} from './workshopLandMineRadius'

describe('workshopLandMineRadius', () => {
  it('has 50 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL; k += 1) {
      const c = workshopLandMineRadiusNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(77_529_189_865)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopLandMineRadiusStatValue(0)).toBe(0.5)
    expect(workshopLandMineRadiusStatDisplay(1)).toBe('0.52')
    expect(workshopLandMineRadiusStatDisplay(50)).toBe('1.50')
    expect(workshopLandMineRadiusNextMarginalCoins(0)).toBe(500)
    expect(workshopLandMineRadiusNextMarginalCoins(35)).toBe(6_590_000)
    expect(workshopLandMineRadiusNextMarginalCoins(49)).toBe(19_820_000_000)
    expect(workshopLandMineRadiusNextMarginalCoins(50)).toBeUndefined()
  })
})
