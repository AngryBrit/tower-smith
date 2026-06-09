import { describe, expect, it } from 'vitest'
import {
  formatAssistModuleLabCoinDisplay,
  formatCoinAbbrev,
  formatCoinAbbrevPreferT,
  formatLabCoinDisplay,
  normalizeCoinAbbrevDisplay,
  parseAbbreviatedCoinsToNumber,
  toolkitMarginalCoinCost,
} from './labCosts'

describe('formatCoinAbbrev', () => {
  it('formats zero as 0 (not 0.00)', () => {
    expect(formatCoinAbbrev(0)).toBe('0')
    expect(formatCoinAbbrevPreferT(0)).toBe('0')
  })

  it('shows quadrillion q from 0.1 q (1e14), not T', () => {
    expect(formatCoinAbbrev(250_000_000_000_000)).toBe('0.25q')
    expect(formatCoinAbbrev(100_000_000_000_000)).toBe('0.10q')
    expect(formatCoinAbbrev(50_000_000_000_000)).toBe('50.00T')
  })

  it('formatCoinAbbrevPreferT keeps workshop-scale trillions in T', () => {
    expect(formatCoinAbbrevPreferT(500_000_000_000_000)).toBe('500.00T')
    expect(formatCoinAbbrevPreferT(50_000_000_000_000)).toBe('50.00T')
    expect(formatCoinAbbrevPreferT(250_000_000_000_000)).toBe('250.00T')
  })

  it('normalizeCoinAbbrevDisplay strips space and uses lab coin rules', () => {
    expect(normalizeCoinAbbrevDisplay('0.25 q')).toBe('250.00T')
    expect(normalizeCoinAbbrevDisplay('0.25 q', { assistModuleLab: true })).toBe(
      '250.00q',
    )
    expect(normalizeCoinAbbrevDisplay('0.25q')).toBe('250.00T')
    expect(normalizeCoinAbbrevDisplay('2 q')).toBe('2.00q')
    expect(normalizeCoinAbbrevDisplay('197.60 K')).toBe('197.60K')
    expect(normalizeCoinAbbrevDisplay('Max')).toBe('Max')
  })

  it('formatLabCoinDisplay uses T below 1 q and q at quadrillion scale', () => {
    expect(formatLabCoinDisplay(250_000_000_000_000)).toBe('250.00T')
    expect(formatLabCoinDisplay(2_000_000_000_000_000)).toBe('2.00q')
    expect(formatLabCoinDisplay(1_976_000_000_000_000)).toBe('1.98q')
  })

  it('round-trips q suffix with parseAbbreviatedCoinsToNumber', () => {
    expect(parseAbbreviatedCoinsToNumber('0.25q')).toBe(250_000_000_000_000)
    expect(parseAbbreviatedCoinsToNumber('0.25 q')).toBe(250_000_000_000_000)
    expect(parseAbbreviatedCoinsToNumber(formatCoinAbbrev(250_000_000_000_000))).toBe(
      250_000_000_000_000,
    )
  })
})

describe('Assist Module labs coin display', () => {
  it('level 1 marginal uses wiki q scale (not T)', () => {
    const level1 = toolkitMarginalCoinCost('Assist Module Substats - Cannon', 0)!
    expect(level1).toBe(250_000_000_000_000)
    expect(formatAssistModuleLabCoinDisplay(level1)).toBe('250.00q')
    expect(formatLabCoinDisplay(level1)).toBe('250.00T')
    expect(
      formatAssistModuleLabCoinDisplay(
        toolkitMarginalCoinCost('Assist Module Bonus - Cannon', 0)!,
      ),
    ).toBe('250.00q')
    expect(
      formatLabCoinDisplay(toolkitMarginalCoinCost('Ultimate Weapon Durations', 0)!),
    ).toBe('2.00q')
  })

  it('high levels use q with 1e15 divisor', () => {
    const level15 = toolkitMarginalCoinCost('Assist Module Substats - Cannon', 14)!
    expect(level15).toBe(3_750_000_000_000_000)
    expect(formatAssistModuleLabCoinDisplay(level15)).toBe('3.75q')
  })
})
