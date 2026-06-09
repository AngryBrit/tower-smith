import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_ORB_SPEED_MAX_LEVEL,
  workshopOrbSpeedNextMarginalCoins,
  workshopOrbSpeedStatDisplay,
  workshopOrbSpeedStatMultiplier,
} from './workshopOrbSpeed'

describe('workshopOrbSpeed', () => {
  it('has 38 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_ORB_SPEED_MAX_LEVEL; k += 1) {
      const c = workshopOrbSpeedNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(342_975)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopOrbSpeedStatMultiplier(0)).toBe(0.4)
    expect(workshopOrbSpeedStatDisplay(0)).toBe('0.40')
    expect(workshopOrbSpeedStatDisplay(1)).toBe('0.55')
    expect(workshopOrbSpeedStatDisplay(38)).toBe('6.10')
    expect(workshopOrbSpeedNextMarginalCoins(0)).toBe(125)
    expect(workshopOrbSpeedNextMarginalCoins(11)).toBe(1870)
    expect(workshopOrbSpeedNextMarginalCoins(37)).toBe(29_730)
    expect(workshopOrbSpeedNextMarginalCoins(38)).toBeUndefined()
  })
})
