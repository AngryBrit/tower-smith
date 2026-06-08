import { describe, expect, it } from 'vitest'
import {
  formatWorkshopBulkStepLabel,
  workshopBulkBumpDelta,
  workshopBulkStepCount,
} from './workshopBulkMarginal'

describe('workshopBulkMarginal helpers', () => {
  it('uses fixed step counts for numeric multipliers', () => {
    expect(workshopBulkStepCount(10, 5, 100)).toBe(10)
    expect(workshopBulkStepCount(100, 50, 100)).toBe(50)
  })

  it('uses remaining levels for MAX multiplier', () => {
    expect(workshopBulkStepCount('max', 12, 100)).toBe(88)
    expect(workshopBulkBumpDelta(1, 'max', 12, 100)).toBe(88)
    expect(workshopBulkBumpDelta(-1, 'max', 12, 100)).toBe(-12)
  })

  it('formats step labels', () => {
    expect(formatWorkshopBulkStepLabel(5)).toBe('×5')
    expect(formatWorkshopBulkStepLabel('max')).toBe('MAX')
  })
})
