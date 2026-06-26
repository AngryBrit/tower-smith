import { describe, expect, it } from 'vitest'
import {
  workshopDisplayedSuperCritMultEnhancementMultiplier,
  workshopSuperCritMultDisplayedNumber,
  workshopSuperCritMultStatDisplay,
  workshopSuperCritMultValue,
} from './workshopSuperCritMult'

describe('workshopSuperCritMult displayed value', () => {
  it('matches the in-game build ((workshop × lab) + submodule) × relics × enhancement', () => {
    // In-game reference: level 100 (×11.20), lab ×1.00, relics +5% (×1.05), submodule +5,
    // Super Crit Mult + enhancement ×1.42 → workshop card reads ×24.15.
    const base = workshopSuperCritMultValue(100)
    expect(base).toBeCloseTo(11.2, 2)

    const value = workshopSuperCritMultDisplayedNumber(100, 1.0, 5, 1.05, 1.42)
    expect(value).toBeCloseTo(24.15, 1)
  })

  it('uses ((workshop × lab) + submodule) × relics × enhancement', () => {
    const base = workshopSuperCritMultValue(10)
    expect(base).toBeCloseTo(2.2, 2)

    const withSub = workshopSuperCritMultDisplayedNumber(10, 1.5, 0.5, 1.2, 1.44)
    const noSub = workshopSuperCritMultDisplayedNumber(10, 1.5, 0, 1.2, 1.44)

    expect(withSub).toBeCloseTo((base * 1.5 + 0.5) * 1.2 * 1.44, 1)
    // The flat sub-module add is scaled by relics × enhancement, not the lab.
    expect(withSub - noSub).toBeCloseTo(0.5 * 1.2 * 1.44, 1)
  })

  it('Super Crit Mult + enhancement ladder is +0.01 per level (1 when locked)', () => {
    expect(workshopDisplayedSuperCritMultEnhancementMultiplier(44, true)).toBeCloseTo(1.44, 2)
    expect(workshopDisplayedSuperCritMultEnhancementMultiplier(44, false)).toBe(1)
    expect(workshopDisplayedSuperCritMultEnhancementMultiplier(0, true)).toBe(1)
  })

  it('defaults to plain workshop × lab when no relics, submodule, or enhancement', () => {
    expect(workshopSuperCritMultStatDisplay(0, 1.3)).toBe('×1.56')
  })

  it('rounds the displayed 2-decimal value (not truncate)', () => {
    // (11.20 + 5) × 1.05 × 1.4201 → raw 24.1559…, rounds to ×24.16 (truncation would yield ×24.15).
    expect(workshopSuperCritMultDisplayedNumber(100, 1, 5, 1.05, 1.4201)).toBe(24.16)
    expect(workshopSuperCritMultStatDisplay(100, 1, 5, 1.05, 1.4201)).toBe('×24.16')
  })
})
