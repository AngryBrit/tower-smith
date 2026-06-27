import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev } from '../labCosts'
import { workshopDamageNextMarginalCoins, workshopDamageStatAtLevel, workshopDamageStatDisplay } from './workshopDamage'

describe('workshopDamage marginal coins', () => {
  it('Lv 5900 wiki row marginal Cost (5899→5900) is 1.97T, not the Total column 315.16T', () => {
    expect(workshopDamageNextMarginalCoins(5899)).toBeCloseTo(1_965_746_114_711.78, 0)
  })
})

describe('workshopDamageStatDisplay', () => {
  it('applies Attack Damage lab multiplier to workshop damage value', () => {
    const level = 1
    const mult = 1.02
    expect(workshopDamageStatDisplay(level, mult)).toBe(
      formatCoinAbbrev(workshopDamageStatAtLevel(level) * mult),
    )
  })
})
