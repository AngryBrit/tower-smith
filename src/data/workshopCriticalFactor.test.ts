import { describe, expect, it } from 'vitest'
import {
  workshopCriticalFactorDisplayedNumber,
  workshopCriticalFactorStatDisplay,
  workshopCriticalFactorStatValue,
} from './workshopCriticalFactor'

describe('workshop critical factor displayed value', () => {
  it('uses the in-game order ((workshop × lab) + submodule) × relics × enhancement', () => {
    // In-game reference build: Critical Factor 150 (×16.20), lab ×2.26, relics +58% (×1.58),
    // Critical Factor + enhancement ×1.43, sub-module +12 → workshop card reads ×109.83.
    const base = workshopCriticalFactorStatValue(150)
    expect(base).toBeCloseTo(16.2, 2)

    const lab = 2.26
    const relics = 1.58
    const enhancement = 1.43
    const submodule = 12

    const value = workshopCriticalFactorDisplayedNumber(150, lab, submodule, enhancement, relics)
    expect(value).toBeCloseTo(109.83, 1)
  })

  it('scales the sub-module add by relics and enhancement but not lab', () => {
    const lab = 2.26
    const relics = 1.58
    const enhancement = 1.43

    const withSub = workshopCriticalFactorDisplayedNumber(150, lab, 12, enhancement, relics)
    const noSub = workshopCriticalFactorDisplayedNumber(150, lab, 0, enhancement, relics)

    // The +12 sub-module bonus is added after the lab, then multiplied by relics × enhancement.
    expect(withSub - noSub).toBeCloseTo(12 * relics * enhancement, 1)
  })

  it('defaults (no relics/enhancement) match a plain workshop × lab card', () => {
    expect(workshopCriticalFactorStatDisplay(0, 1.3)).toBe('×1.56')
  })
})
