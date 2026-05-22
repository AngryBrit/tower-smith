import { describe, expect, it } from 'vitest'
import {
  formatCoinAbbrev,
  formatCoinAbbrevPreferT,
  parseAbbreviatedCoinsToNumber,
  toolkitMarginalCoinCost,
} from './labCosts'

describe('formatCoinAbbrev', () => {
  it('shows quadrillion q from 0.1 q (1e14), not T', () => {
    expect(formatCoinAbbrev(250_000_000_000_000)).toBe('0.25 q')
    expect(formatCoinAbbrev(100_000_000_000_000)).toBe('0.10 q')
    expect(formatCoinAbbrev(50_000_000_000_000)).toBe('50.00 T')
  })

  it('formatCoinAbbrevPreferT keeps workshop-scale trillions in T', () => {
    expect(formatCoinAbbrevPreferT(500_000_000_000_000)).toBe('500.00 T')
    expect(formatCoinAbbrevPreferT(50_000_000_000_000)).toBe('50.00 T')
    expect(formatCoinAbbrevPreferT(250_000_000_000_000)).toBe('250.00 T')
  })

  it('round-trips q suffix with parseAbbreviatedCoinsToNumber', () => {
    expect(parseAbbreviatedCoinsToNumber('0.25 q')).toBe(250_000_000_000_000)
    expect(parseAbbreviatedCoinsToNumber(formatCoinAbbrev(250_000_000_000_000))).toBe(
      250_000_000_000_000,
    )
  })
})

describe('Assist Module labs coin display', () => {
  it('level 1 marginal is 0.25 q (wiki)', () => {
    expect(toolkitMarginalCoinCost('Assist Module Bonus - Cannon', 0)).toBe(
      250_000_000_000_000,
    )
    expect(formatCoinAbbrev(toolkitMarginalCoinCost('Assist Module Bonus - Cannon', 0)!)).toBe(
      '0.25 q',
    )
  })
})
