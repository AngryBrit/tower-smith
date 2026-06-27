import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION,
  impliedHealthRegenDisplayEnhance,
  workshopBinaryHealthRegenBase,
} from './workshopBinaryHealthRegenBase'

describe('workshopBinaryHealthRegenBase', () => {
  it('is bit-exact to the binary float32-pow value at L5840', () => {
    // Full-precision value read from the game source at workshop Health Regen L5840.
    const gameRaw = 6373117241.88547
    const binary = workshopBinaryHealthRegenBase(5840)
    expect(Math.abs(binary - gameRaw)).toBeLessThan(1e-3)
  })

  it('matches known GOD anchors within 2-decimal export tolerance', () => {
    const anchors = [
      { level: 5000, god: 523_230_000 },
      { level: 5840, god: 6_370_000_000 },
    ]
    for (const { level, god } of anchors) {
      const binary = workshopBinaryHealthRegenBase(level)
      expect(Math.abs(binary - god) / god).toBeLessThan(0.0012)
    }
  })

  it('implies a flat displayed-regen enhance term across calibration anchors', () => {
    const card = 2.6
    const relics = 0.97
    const terms = WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION.map((pt) =>
      impliedHealthRegenDisplayEnhance({
        level: pt.level,
        gameDisplayPerSec: pt.gameDisplayPerSec,
        cardMultiplier: card,
        relicsBonusFraction: relics,
      }),
    )
    expect(Math.max(...terms) - Math.min(...terms)).toBeLessThan(0.0001)
    expect(terms[2]).toBeCloseTo(1.4975, 3)
  })
})
