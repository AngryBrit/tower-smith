import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_DEATH_DEFY_MAX_LEVEL,
  workshopDeathDefyNextMarginalCoins,
  workshopDeathDefyStatDisplay,
  workshopDeathDefyStatPercent,
} from './workshopDeathDefy'

describe('workshopDeathDefy', () => {
  it('has 75 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_DEATH_DEFY_MAX_LEVEL; k += 1) {
      const c = workshopDeathDefyNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(1_718_592_980)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopDeathDefyStatPercent(0)).toBe(0)
    expect(workshopDeathDefyStatDisplay(0)).toBe('0.00%')
    expect(workshopDeathDefyStatDisplay(1)).toBe('0.40%')
    expect(workshopDeathDefyStatDisplay(75)).toBe('30.00%')
    expect(workshopDeathDefyNextMarginalCoins(0)).toBe(1000)
    expect(workshopDeathDefyNextMarginalCoins(74)).toBe(110_500_000)
    expect(workshopDeathDefyNextMarginalCoins(75)).toBeUndefined()
  })
})
