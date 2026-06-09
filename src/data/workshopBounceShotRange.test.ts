import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL,
  workshopBounceShotRangeMeters,
  workshopBounceShotRangeStatDisplay,
} from './workshopBounceShotRange'

describe('workshopBounceShotRange', () => {
  it('reads meters from GOD (micro-meter encoding)', () => {
    expect(workshopBounceShotRangeMeters(0)).toBe(2)
    expect(workshopBounceShotRangeMeters(60)).toBe(8)
    expect(workshopBounceShotRangeStatDisplay(0)).toBe('2.00m')
    expect(workshopBounceShotRangeStatDisplay(60)).toBe('8.00m')
    expect(WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL).toBe(60)
  })
})
