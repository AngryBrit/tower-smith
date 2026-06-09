import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL,
  workshopPackageChanceNextMarginalCoins,
  workshopPackageChanceStatDisplay,
  workshopPackageChanceStatPercent,
} from './workshopPackageChance'

describe('workshopPackageChance', () => {
  it('uses exact +0.40% per level and wiki marginal Cost per row', () => {
    expect(workshopPackageChanceStatPercent(0)).toBe(6)
    expect(workshopPackageChanceStatPercent(1)).toBe(6.4)
    expect(workshopPackageChanceStatPercent(60)).toBe(30)
    expect(workshopPackageChanceStatDisplay(0)).toBe('6.00%')
    expect(workshopPackageChanceStatDisplay(1)).toBe('6.40%')
    expect(workshopPackageChanceStatDisplay(60)).toBe('30.00%')

    expect(workshopPackageChanceNextMarginalCoins(0)).toBe(1000)
    expect(workshopPackageChanceNextMarginalCoins(1)).toBe(1060)
    expect(workshopPackageChanceNextMarginalCoins(9)).toBe(20_900)
    expect(workshopPackageChanceNextMarginalCoins(59)).toBe(25_400_000)
    expect(workshopPackageChanceNextMarginalCoins(60)).toBeUndefined()
  })

  it('max level is 60', () => {
    expect(WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL).toBe(60)
  })
})
