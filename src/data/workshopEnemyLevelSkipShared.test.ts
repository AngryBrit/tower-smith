import { describe, expect, it } from 'vitest'
import { workshopEnemyAttackLevelSkipNextMarginalCoins } from './workshopEnemyAttackLevelSkip'
import {
  WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL,
  WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS,
  workshopEnemyAttackLevelSkipStatDisplay,
  workshopEnemyAttackLevelSkipStatPercent,
} from './workshopEnemyLevelSkipShared'

describe('workshopEnemyLevelSkipShared', () => {
  it('uses GOD stat values and marginal coins', () => {
    expect(WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS).toBe(1_000_000_000)
    expect(workshopEnemyAttackLevelSkipStatPercent(0)).toBe(0.05)
    expect(workshopEnemyAttackLevelSkipStatPercent(1)).toBe(0.1)
    expect(workshopEnemyAttackLevelSkipStatPercent(699)).toBe(35)
    expect(workshopEnemyAttackLevelSkipStatDisplay(0)).toBe('0.05%')
    expect(workshopEnemyAttackLevelSkipStatDisplay(1)).toBe('0.10%')
    expect(workshopEnemyAttackLevelSkipStatDisplay(699)).toBe('35.00%')

    expect(workshopEnemyAttackLevelSkipNextMarginalCoins(0)).toBe(300_000_000)
    expect(workshopEnemyAttackLevelSkipNextMarginalCoins(9)).toBe(444_010_000)
    expect(workshopEnemyAttackLevelSkipNextMarginalCoins(698)).toBe(4_559_999_999_999_999_500)
    expect(workshopEnemyAttackLevelSkipNextMarginalCoins(699)).toBeUndefined()
  })

  it('max level is 699', () => {
    expect(WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL).toBe(699)
  })
})
