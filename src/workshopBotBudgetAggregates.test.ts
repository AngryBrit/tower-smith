import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_BOT_UNLOCK_MEDAL_TOTAL,
  workshopBotNextMarginalMedals,
} from './data/workshopBots'
import { defaultWorkshopPersisted } from './labPresetsStorage'
import {
  computeWorkshopBotMedalAggregates,
  formatWorkshopBotMedalAggregates,
} from './workshopBotBudgetAggregates'

describe('computeWorkshopBotMedalAggregates', () => {
  it('starts at zero spent with default snapshot', () => {
    const ws = defaultWorkshopPersisted()
    const a = computeWorkshopBotMedalAggregates(ws)
    expect(a.spentAll).toBe(0)
    expect(a.toMaxAll).toBeGreaterThan(0)
    expect(a.nextUpgradeVisibleSum).toBe(100)
  })

  it('counts one flame damage level spend', () => {
    const m0 = workshopBotNextMarginalMedals('flameBotDamageLevel', 0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      flameOwned: true,
      flameBotActive: true,
      flameBotDamageLevel: 1,
    }
    const a = computeWorkshopBotMedalAggregates(ws)
    expect(a.spentAll).toBe(100 + m0)
    expect(a.nextUpgradeVisibleSum).toBeGreaterThan(0)
  })

  it('counts only one next bot unlock cost when none are owned', () => {
    const ws = defaultWorkshopPersisted()
    const a = computeWorkshopBotMedalAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBe(100)
  })

  it('sums unlock spend for explicit owned bots', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      flameOwned: true,
      thunderOwned: true,
    }
    const a = computeWorkshopBotMedalAggregates(ws)
    expect(a.spentAll).toBe(100 + 300)
    expect(a.toMaxAll).toBeLessThan(
      computeWorkshopBotMedalAggregates(defaultWorkshopPersisted()).toMaxAll,
    )
  })

  it('includes all five unlock medals in to-max when none owned', () => {
    const a = computeWorkshopBotMedalAggregates(defaultWorkshopPersisted())
    expect(a.toMaxAll).toBeGreaterThanOrEqual(WORKSHOP_BOT_UNLOCK_MEDAL_TOTAL)
  })

  it('formats labels with coin abbreviations', () => {
    const labels = formatWorkshopBotMedalAggregates({
      spentAll: 1500,
      toMaxAll: 2500000,
      nextUpgradeVisibleSum: 100,
    })
    expect(labels.spentLabel).toBe('1.50K')
    expect(labels.toMaxLabel).toBe('2.50M')
    expect(labels.nextVisibleLabel).toBe('100')
  })

  it('does not count inactive bot upgrades in next visible sum', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      flameOwned: true,
      flameBotActive: false,
      flameBotDamageLevel: 0,
    }
    const a = computeWorkshopBotMedalAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBe(300)
  })

})
