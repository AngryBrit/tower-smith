import { describe, expect, it } from 'vitest'
import { computeSimulatorCoinAggregates, maxVisibleLabLevels } from './labBudgetAggregates'
import type { ResearchData } from './types/research'

const damageItem = {
  name: 'Damage',
  level: 'Lv.0',
  benefit: 'x1.00',
  time: '0d 0h 0m',
  cost: '30',
  state: 'default' as const,
  currentLevel: 0,
  maxLevel: 100,
}

describe('computeSimulatorCoinAggregates', () => {
  it('increases spent and decreases remaining when level rises', () => {
    const data: ResearchData = {
      sections: [{ sectionSlug: 'attack', title: 'ATTACK', items: [{ ...damageItem }] }],
    }
    const baseline = computeSimulatorCoinAggregates(data, {}, 0, '', false, {})
    const raised = computeSimulatorCoinAggregates(
      data,
      { '0-0': 1 },
      0,
      '',
      false,
      {},
    )
    expect(baseline.spentAll).toBe(0)
    expect(raised.spentAll).toBeGreaterThan(0)
    expect(raised.toMaxAll).toBeLessThan(baseline.toMaxAll)
    expect(raised.nextUpgradeVisibleSum).toBeGreaterThan(0)
  })

  it('excludes next-upgrade sum for collapsed sections', () => {
    const data: ResearchData = {
      sections: [{ sectionSlug: 'attack', title: 'ATTACK', items: [{ ...damageItem }] }],
    }
    const open = computeSimulatorCoinAggregates(data, {}, 0, '', false, {})
    const collapsed = computeSimulatorCoinAggregates(data, {}, 0, '', false, {
      0: true,
    })
    expect(collapsed.nextUpgradeVisibleSum).toBe(0)
    expect(open.nextUpgradeVisibleSum).toBeGreaterThan(0)
  })
})

describe('maxVisibleLabLevels', () => {
  it('sets visible labs to max and skips collapsed sections', () => {
    const data: ResearchData = {
      sections: [{ sectionSlug: 'attack', title: 'ATTACK', items: [{ ...damageItem }] }],
    }
    const maxed = maxVisibleLabLevels(data, { '0-0': 5 }, '', false, {})
    expect(maxed['0-0']).toBe(100)
    const collapsed = maxVisibleLabLevels(data, {}, '', false, { 0: true })
    expect(collapsed['0-0']).toBeUndefined()
  })
})
