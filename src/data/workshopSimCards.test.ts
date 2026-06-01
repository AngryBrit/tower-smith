import { describe, expect, it } from 'vitest'
import {
  workshopAttackSpeedCardMultiplier,
  workshopBerserkerDisplayedDamageAdd,
  workshopDamageCardMultiplierFromStars,
} from './workshopSimCards'

describe('workshopSimCards', () => {
  it('attack speed card stars match wiki multipliers', () => {
    expect(workshopAttackSpeedCardMultiplier(0)).toBe(1)
    expect(workshopAttackSpeedCardMultiplier(1)).toBe(1.25)
    expect(workshopAttackSpeedCardMultiplier(7)).toBe(2.15)
  })

  it('damage card stars match wiki multipliers', () => {
    expect(workshopDamageCardMultiplierFromStars(0)).toBe(1)
    expect(workshopDamageCardMultiplierFromStars(1)).toBe(1.5)
    expect(workshopDamageCardMultiplierFromStars(7)).toBe(4)
  })

  it('berserker add respects +700% cap (7× pre-berserker product)', () => {
    const pre = 1000
    const add = workshopBerserkerDisplayedDamageAdd(pre, 10_000_000, 7)
    expect(add).toBe(7000)
  })

  it('berserker wiki example: 1M taken, pre-berserker 1000 → 7000 add (7× cap)', () => {
    expect(workshopBerserkerDisplayedDamageAdd(1000, 1_000_000, 1)).toBe(7000)
  })
})
