import { describe, expect, it } from 'vitest'
import {
  workshopDamagePerMeterStatDisplay,
  workshopDamagePerMeterStatMultiplier,
} from './workshopDamagePerMeter'

describe('workshopDamagePerMeter', () => {
  it('wiki workshop ladder tops at x1.059 / m without research lab', () => {
    expect(workshopDamagePerMeterStatMultiplier(200)).toBeCloseTo(0.059, 6)
    expect(workshopDamagePerMeterStatDisplay(200)).toBe('x1.059 / m')
  })

  it('shows workshop bonus only without research lab', () => {
    expect(workshopDamagePerMeterStatDisplay(180)).toBe('x1.055 / m')
  })

  it('adds partial Damage / Meter research lab (not full × lab)', () => {
    const label = workshopDamagePerMeterStatDisplay(180, 1.28)
    expect(label).toBe('x1.1429 / m')
    expect(label).not.toContain('1.28')
  })

  it('does not stack sub-module bonus on the workshop card', () => {
    expect(workshopDamagePerMeterStatDisplay(180, 1.28)).toBe('x1.1429 / m')
  })
})
