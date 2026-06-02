import { describe, expect, it } from 'vitest'
import { botSaveLevelIndex } from './gameBotPresetMapping'

describe('botSaveLevelIndex', () => {
  it('maps Golden Bot save indices (cooldown, range, bonus, duration)', () => {
    expect(botSaveLevelIndex('golden', 'goldenBotCooldownLevel', 1)).toBe(0)
    expect(botSaveLevelIndex('golden', 'goldenBotRangeLevel', 3)).toBe(1)
    expect(botSaveLevelIndex('golden', 'goldenBotBonusLevel', 2)).toBe(2)
    expect(botSaveLevelIndex('golden', 'goldenBotDurationLevel', 0)).toBe(3)
  })

  it('maps Flame Bot levels in weapon-stat order', () => {
    expect(botSaveLevelIndex('flame', 'flameBotDamageReductionLevel', 0)).toBe(0)
    expect(botSaveLevelIndex('flame', 'flameBotCooldownLevel', 1)).toBe(1)
    expect(botSaveLevelIndex('flame', 'flameBotDamageLevel', 2)).toBe(2)
    expect(botSaveLevelIndex('flame', 'flameBotRangeLevel', 3)).toBe(3)
  })

  it('maps Thunder Bot levels in weapon-stat order', () => {
    expect(botSaveLevelIndex('thunder', 'thunderBotDurationLevel', 0)).toBe(0)
    expect(botSaveLevelIndex('thunder', 'thunderBotLingerLevel', 2)).toBe(2)
  })
})
