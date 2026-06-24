import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
  workshopRapidFireDurationSeconds,
  workshopRapidFireDurationStatDisplay,
} from './workshopRapidFire'

describe('workshopRapidFire duration', () => {
  it('reads seconds from GOD (not raw septillion-scaled import)', () => {
    expect(workshopRapidFireDurationSeconds(0)).toBe(0.6)
    expect(workshopRapidFireDurationSeconds(1)).toBe(0.65)
    expect(workshopRapidFireDurationSeconds(99)).toBeCloseTo(5.55)
    expect(workshopRapidFireDurationStatDisplay(0)).toBe('0.60 sec')
    expect(workshopRapidFireDurationStatDisplay(99)).toBe('5.55 sec')
    expect(WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL).toBe(99)
  })
})
