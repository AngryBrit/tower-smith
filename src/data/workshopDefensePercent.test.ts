import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL,
  workshopDefensePercentNextMarginalCoins,
  workshopDefensePercentStatDisplay,
  workshopDefensePercentStatPercentPoints,
} from './workshopDefensePercent'

describe('workshopDefensePercent', () => {
  it('has 99 marginal costs (wiki Level 1…99)', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL; k += 1) {
      const c = workshopDefensePercentNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(2_766_640)
  })

  it('matches wiki spot checks', () => {
    expect(workshopDefensePercentStatPercentPoints(0)).toBe(0)
    expect(workshopDefensePercentStatDisplay(50)).toBe('25.00%')
    expect(workshopDefensePercentNextMarginalCoins(11)).toBe(898)
    expect(workshopDefensePercentNextMarginalCoins(98)).toBe(90_730)
    expect(workshopDefensePercentNextMarginalCoins(99)).toBeUndefined()
  })
})
