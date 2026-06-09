import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL,
  workshopLandMineDamageNextMarginalCoins,
  workshopLandMineDamageStatDisplay,
  workshopLandMineDamageStatPercent,
} from './workshopLandMineDamage'

describe('workshopLandMineDamage', () => {
  it('matches wiki milestone Value and marginal Cost', () => {
    expect(workshopLandMineDamageStatPercent(0)).toBe(1)
    expect(workshopLandMineDamageStatPercent(1)).toBe(1.1)
    expect(workshopLandMineDamageStatPercent(10)).toBe(2)
    expect(workshopLandMineDamageStatPercent(200)).toBe(21)
    expect(workshopLandMineDamageStatDisplay(0)).toBe('x1.0')
    expect(workshopLandMineDamageStatDisplay(1)).toBe('x1.1')
    expect(workshopLandMineDamageStatDisplay(50)).toBe('x6.0')
    expect(workshopLandMineDamageStatDisplay(200)).toBe('x21.0')

    expect(workshopLandMineDamageNextMarginalCoins(0)).toBe(500)
    expect(workshopLandMineDamageNextMarginalCoins(9)).toBe(8240)
    expect(workshopLandMineDamageNextMarginalCoins(199)).toBe(217.61e12)
    expect(workshopLandMineDamageNextMarginalCoins(200)).toBeUndefined()
  })

  it('max level is 200', () => {
    expect(WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL).toBe(200)
  })
})
