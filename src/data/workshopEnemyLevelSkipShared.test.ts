import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL,
  WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS,
  workshopEnemyLevelSkipNextMarginalCoins,
  workshopEnemyLevelSkipStatDisplay,
  workshopEnemyLevelSkipStatPercent,
} from './workshopEnemyLevelSkipShared'

describe('workshopEnemyLevelSkipShared', () => {
  it('uses exact +0.05% per level and wiki marginal Cost', () => {
    expect(WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS).toBe(1_000_000_000)
    expect(workshopEnemyLevelSkipStatPercent(0)).toBe(0.05)
    expect(workshopEnemyLevelSkipStatPercent(1)).toBe(0.1)
    expect(workshopEnemyLevelSkipStatPercent(699)).toBe(35)
    expect(workshopEnemyLevelSkipStatDisplay(0)).toBe('0.05%')
    expect(workshopEnemyLevelSkipStatDisplay(1)).toBe('0.10%')
    expect(workshopEnemyLevelSkipStatDisplay(699)).toBe('35.00%')

    expect(workshopEnemyLevelSkipNextMarginalCoins(0)).toBe(300_000_000)
    expect(workshopEnemyLevelSkipNextMarginalCoins(9)).toBe(444_010_000)
    expect(workshopEnemyLevelSkipNextMarginalCoins(698)).toBe(4.56e18)
    expect(workshopEnemyLevelSkipNextMarginalCoins(699)).toBeUndefined()
  })

  it('max level is 699', () => {
    expect(WORKSHOP_ENEMY_LEVEL_SKIP_MAX_LEVEL).toBe(699)
  })
})
