import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL,
  workshopDefenseAbsoluteNextMarginalCoins,
  workshopDefenseAbsoluteStatValue,
} from './workshopDefenseAbsolute'

describe('workshopDefenseAbsolute', () => {
  it('matches wiki milestones for Value and marginal Cost', () => {
    expect(workshopDefenseAbsoluteStatValue(5000)).toBeCloseTo(80_214_388.0521576, 0)
    expect(workshopDefenseAbsoluteNextMarginalCoins(4999)).toBeCloseTo(797_447_803.840501, 0)
    expect(workshopDefenseAbsoluteNextMarginalCoins(0)).toBe(50)
    expect(workshopDefenseAbsoluteNextMarginalCoins(WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL)).toBeUndefined()
  })
})
