import { describe, expect, it } from 'vitest'
import { workshopToolkitMarginalCoins } from '../workshopCosts'
import { getWorkshopGodTables } from './workshopGodTables'
import {
  workshopDisplayedRendArmorChanceEnhancementMultiplier,
  workshopDisplayedRendArmorMultEnhancementMultiplier,
  workshopRendArmorChanceNextMarginalCoins,
  workshopRendArmorChancePercent,
  workshopRendArmorChanceStatDisplay,
  workshopRendArmorMultNextMarginalCoins,
  workshopRendArmorMultStatDisplay,
  workshopRendArmorMultValue,
} from './workshopRendArmor'

describe('workshopRendArmor', () => {
  it('matches GOD table marginals', () => {
    for (const level of [0, 8, 9, 298]) {
      expect(workshopRendArmorChanceNextMarginalCoins(level)).toBe(
        workshopToolkitMarginalCoins('Rend Armor Chance', level),
      )
    }
  })

  it('shares the same ladder for mult next cost', () => {
    expect(workshopRendArmorMultNextMarginalCoins(0)).toBe(
      workshopRendArmorChanceNextMarginalCoins(0),
    )
  })

  it('GOD max row reports cumulative 418.97q total', () => {
    const maxRow = getWorkshopGodTables()['Rend Armor Chance'].levels[299]
    expect(maxRow.totalCoins.coins).toBe(418_970_000_000_000_000)
    expect(workshopRendArmorChanceNextMarginalCoins(298)).toBe(
      workshopToolkitMarginalCoins('Rend Armor Chance', 298),
    )
  })

  it('stat displays at min and max', () => {
    expect(workshopRendArmorChanceStatDisplay(0)).toBe('0.10%')
    expect(workshopRendArmorChanceStatDisplay(299)).toBe('30.00%')
    expect(workshopRendArmorChancePercent(299)).toBe(30)

    // Chance enhancement applies at HALF the mult rate: level 46 → ×1.23 (mult-rate would be ×1.46).
    expect(workshopDisplayedRendArmorChanceEnhancementMultiplier(46, true)).toBeCloseTo(1.23, 2)
    expect(workshopDisplayedRendArmorChanceEnhancementMultiplier(46, false)).toBe(1)
    // In-game reference: chance level 120 (12.10%) × half-enh ×1.23 = 14.88%.
    expect(
      workshopRendArmorChanceStatDisplay(
        120,
        0,
        workshopDisplayedRendArmorChanceEnhancementMultiplier(46, true),
      ),
    ).toBe('14.88%')
    expect(workshopRendArmorChanceStatDisplay(100, 0, 1.2)).toBe('12.12%')

    expect(workshopRendArmorMultStatDisplay(0)).toBe('×0.001')
    expect(workshopRendArmorMultStatDisplay(102)).toBe('×0.103')
    // Mult enhancement applies at FULL rate (level 46 → ×1.46, no cap at 40).
    expect(workshopDisplayedRendArmorMultEnhancementMultiplier(46, true)).toBeCloseTo(1.46, 2)
    // In-game reference: mult level 120 (×0.121), relic ×1.02, full enh ×1.46 → ×0.180.
    expect(
      workshopRendArmorMultStatDisplay(
        120,
        undefined,
        0,
        workshopDisplayedRendArmorMultEnhancementMultiplier(46, true),
        1.02,
      ),
    ).toBe('×0.180')
    expect(workshopRendArmorMultStatDisplay(102, undefined, 0, 1.4)).toBe('×0.144')
    expect(workshopRendArmorMultStatDisplay(110)).toBe('×0.111')
    expect(workshopRendArmorMultStatDisplay(120, 1.02, 0, 1.4)).toBe('×0.173')
    expect(workshopRendArmorMultStatDisplay(120, 1.02, 5, 1.4, 1.1)).toBe('×0.267')
    expect(workshopRendArmorMultStatDisplay(299)).toBe('×0.300')
    expect(workshopRendArmorMultValue(299)).toBe(0.3)
    expect(workshopRendArmorMultValue(0)).toBe(0.001)
  })
})
