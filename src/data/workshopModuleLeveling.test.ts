import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_MODULE_LEVEL_WIKI_ROWS,
  workshopModuleLevelMarginalCoins,
  workshopModuleLevelMarginalShards,
  workshopModuleLevelTotalCoins,
  workshopModuleLevelTotalShards,
  workshopModuleNextMarginalShards,
} from './workshopModuleLeveling'

describe('workshopModuleLeveling', () => {
  it('matches wiki milestone rows', () => {
    for (const row of WORKSHOP_MODULE_LEVEL_WIKI_ROWS) {
      expect(workshopModuleLevelMarginalShards(row.level)).toBe(row.marginalShards)
      expect(workshopModuleLevelMarginalCoins(row.level)).toBeCloseTo(row.marginalCoins, 6)
      expect(workshopModuleLevelTotalShards(row.level)).toBe(row.totalShards)
      expect(workshopModuleLevelTotalCoins(row.level)).toBeCloseTo(row.totalCoins, 6)
    }
  })

  it('returns next marginal shard cost from current level', () => {
    expect(workshopModuleNextMarginalShards(1)).toBe(7)
    expect(workshopModuleNextMarginalShards(100)).toBe(1_000)
  })

  it('interpolates between wiki anchors', () => {
    expect(workshopModuleLevelMarginalShards(6)).toBeGreaterThan(7)
    expect(workshopModuleLevelMarginalShards(6)).toBeLessThan(20)
  })
})
