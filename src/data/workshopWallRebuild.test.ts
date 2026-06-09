import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_WALL_REBUILD_BASE_SECONDS,
  WORKSHOP_WALL_REBUILD_MAX_LEVEL,
  workshopWallRebuildNextMarginalCoins,
  workshopWallRebuildStatDisplay,
  workshopWallRebuildStatSeconds,
} from './workshopWallRebuild'

describe('workshopWallRebuild', () => {
  it('matches wiki milestone Value and marginal Cost', () => {
    expect(workshopWallRebuildStatSeconds(0)).toBe(WORKSHOP_WALL_REBUILD_BASE_SECONDS)
    expect(workshopWallRebuildStatDisplay(0)).toBe('1200s')
    expect(workshopWallRebuildStatSeconds(1)).toBeCloseTo(1198)
    expect(workshopWallRebuildStatSeconds(10)).toBeCloseTo(1180)
    expect(workshopWallRebuildStatSeconds(300)).toBeCloseTo(600)
    expect(workshopWallRebuildStatDisplay(1)).toBe('1198s')

    expect(workshopWallRebuildNextMarginalCoins(0)).toBe(16e6)
    expect(workshopWallRebuildNextMarginalCoins(9)).toBe(23.21e6)
    expect(workshopWallRebuildNextMarginalCoins(299)).toBe(923.56e9)
    expect(workshopWallRebuildNextMarginalCoins(300)).toBeUndefined()
  })

  it('max level is 300', () => {
    expect(WORKSHOP_WALL_REBUILD_MAX_LEVEL).toBe(300)
  })
})
