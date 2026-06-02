import { describe, expect, it } from 'vitest'
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
  it('matches wiki milestone marginals', () => {
    expect(workshopRendArmorChanceNextMarginalCoins(0)).toBe(600_000_000)
    expect(workshopRendArmorChanceNextMarginalCoins(8)).toBe(614_098_750)
    expect(workshopRendArmorChanceNextMarginalCoins(9)).toBe(627_210_000)
    expect(workshopRendArmorChanceNextMarginalCoins(298)).toBe(19.83e15)
  })

  it('shares the same ladder for mult next cost', () => {
    expect(workshopRendArmorMultNextMarginalCoins(0)).toBe(
      workshopRendArmorChanceNextMarginalCoins(0),
    )
  })

  it('sums 299 purchases to wiki total 418.97q', () => {
    let sum = 0n
    for (let i = 0; i < WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL; i += 1) {
      const c = workshopRendArmorChanceNextMarginalCoins(i)
      expect(c).toBeDefined()
      sum += BigInt(Math.round(c!))
    }
    expect(sum).toBe(418_970_000_000_000_000n)
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
  })
})
