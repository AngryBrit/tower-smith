import { describe, expect, it } from 'vitest'
import {
  ASSIST_STONE_EFFICIENCY_MAX_TOTAL,
  ASSIST_STONE_EFFICIENCY_ROWS,
  ASSIST_UNIQUE_RARITY_STONE_TOTAL,
  assistFlooredQuantity,
  assistStoneEfficiencyCumulativeCost,
  assistStoneEfficiencyMarginalCost,
  assistStoneEfficiencyStonesToMax,
  assistUniqueRarityFromGameLevel,
  assistUniqueRarityUpgradeCost,
  stepAssistUniqueRarity,
} from './workshopAssistModuleCatalog'

describe('workshopAssistModuleCatalog', () => {
  it('steps unique rarity and returns upgrade stone cost', () => {
    expect(stepAssistUniqueRarity('epic', 1)).toBe('legendary')
    expect(assistUniqueRarityUpgradeCost('mythic')).toBe(1400)
    expect(assistUniqueRarityUpgradeCost('ancestral')).toBeNull()
  })

  it('maps game uniqueEffectEfficiencyLevel to assist unique rarity tier', () => {
    expect(assistUniqueRarityFromGameLevel(0)).toBe('epic')
    expect(assistUniqueRarityFromGameLevel(1)).toBe('legendary')
    expect(assistUniqueRarityFromGameLevel(2)).toBe('mythic')
    expect(assistUniqueRarityFromGameLevel(3)).toBe('ancestral')
  })

  it('matches wiki stone efficiency marginal costs', () => {
    expect(assistStoneEfficiencyMarginalCost(1)).toBe(0)
    expect(assistStoneEfficiencyMarginalCost(2)).toBe(15)
    expect(assistStoneEfficiencyMarginalCost(70)).toBe(219)
  })

  it('matches wiki cumulative max (8073 stones)', () => {
    expect(assistStoneEfficiencyCumulativeCost(70)).toBe(8073)
    expect(ASSIST_STONE_EFFICIENCY_MAX_TOTAL).toBe(8073)
    expect(assistStoneEfficiencyStonesToMax(70)).toBe(0)
    expect(assistStoneEfficiencyStonesToMax(1)).toBe(8073)
  })

  it('precomputes 70 efficiency rows', () => {
    expect(ASSIST_STONE_EFFICIENCY_ROWS).toHaveLength(70)
    expect(ASSIST_STONE_EFFICIENCY_ROWS[69]).toMatchObject({
      valuePercent: 70,
      marginalStones: 219,
      cumulativeStones: 8073,
      stonesToMax: 0,
    })
  })

  it('matches wiki unique rarity stone total (4600)', () => {
    expect(ASSIST_UNIQUE_RARITY_STONE_TOTAL).toBe(4600)
  })

  it('floors quantity sub-stats (DW +3 at 33% vs 34%)', () => {
    expect(assistFlooredQuantity(3, 33)).toBe(0)
    expect(assistFlooredQuantity(3, 34)).toBe(1)
  })

  it('floors at full combined efficiency (70% sub stone + 30% SE lab)', () => {
    expect(assistFlooredQuantity(10, 100)).toBe(10)
    expect(assistFlooredQuantity(-10, 100)).toBe(-10)
  })
})
