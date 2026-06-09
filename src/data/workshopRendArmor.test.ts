import { describe, expect, it } from 'vitest'
import { workshopToolkitMarginalCoins } from '../workshopCosts'
import { WORKSHOP_GOD_TABLES } from './workshopGodTables'
import {
  WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
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
    const maxRow = WORKSHOP_GOD_TABLES['Rend Armor Chance'].levels[299]
    expect(maxRow.totalCoins.coins).toBe(418_970_000_000_000_000)
    expect(workshopRendArmorChanceNextMarginalCoins(298)).toBe(
      workshopToolkitMarginalCoins('Rend Armor Chance', 298),
    )
  })

  it('stat displays at min and max', () => {
    expect(workshopRendArmorChanceStatDisplay(0)).toBe('0.10%')
    expect(workshopRendArmorChanceStatDisplay(299)).toBe('30.00%')
    expect(workshopRendArmorChancePercent(299)).toBe(30)

    expect(workshopDisplayedRendArmorChanceEnhancementMultiplier(49, true)).toBe(1.2)
    expect(workshopRendArmorChanceStatDisplay(100, 0, 1.2)).toBe('12.12%')

    expect(workshopRendArmorMultStatDisplay(0)).toBe('×0.001')
    expect(workshopRendArmorMultStatDisplay(102)).toBe('×0.103')
    expect(workshopDisplayedRendArmorMultEnhancementMultiplier(49, true)).toBe(1.4)
    expect(workshopRendArmorMultStatDisplay(102, undefined, 0, 1.4)).toBe('×0.144')
    expect(workshopRendArmorMultStatDisplay(110)).toBe('×0.111')
    expect(workshopRendArmorMultStatDisplay(120, 1.02, 0, 1.4)).toBe('×0.173')
    expect(workshopRendArmorMultStatDisplay(299)).toBe('×0.3')
    expect(workshopRendArmorMultValue(299)).toBe(0.3)
    expect(workshopRendArmorMultValue(0)).toBe(0.001)
  })
})
