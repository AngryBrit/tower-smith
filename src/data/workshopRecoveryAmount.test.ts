import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL,
  workshopRecoveryAmountNextMarginalCoins,
  workshopRecoveryAmountStatDisplay,
  workshopRecoveryAmountStatPercent,
} from './workshopRecoveryAmount'
import { WORKSHOP_RECOVERY_UNLOCK_COINS } from './workshopRecoveryShared'

describe('workshopRecoveryAmount', () => {
  it('uses exact +0.40% per level and shared wiki marginal Cost', () => {
    expect(WORKSHOP_RECOVERY_UNLOCK_COINS).toBe(1_500_000)
    expect(workshopRecoveryAmountStatPercent(0)).toBe(14)
    expect(workshopRecoveryAmountStatPercent(1)).toBe(14.4)
    expect(workshopRecoveryAmountStatPercent(300)).toBe(134)
    expect(workshopRecoveryAmountStatDisplay(0)).toBe('14.00%')
    expect(workshopRecoveryAmountStatDisplay(1)).toBe('14.40%')
    expect(workshopRecoveryAmountStatDisplay(300)).toBe('134.00%')

    expect(workshopRecoveryAmountNextMarginalCoins(0)).toBe(1000)
    expect(workshopRecoveryAmountNextMarginalCoins(9)).toBe(20_900)
    expect(workshopRecoveryAmountNextMarginalCoins(299)).toBe(21_590_000_000)
    expect(workshopRecoveryAmountNextMarginalCoins(300)).toBeUndefined()
  })

  it('max level is 300', () => {
    expect(WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL).toBe(300)
  })
})
