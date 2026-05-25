import { describe, expect, it } from 'vitest'
import { workshopDefenseNextMarginalCoins } from './data/workshopDefense'
import { workshopEnhanceAttackNextMarginalCoins } from './data/workshopEnhanceAttack'
import { workshopEnhanceDefenseNextMarginalCoins } from './data/workshopEnhanceDefense'
import { workshopEnhanceUtilityNextMarginalCoins } from './data/workshopEnhanceUtility'
import { workshopDamageNextMarginalCoins } from './data/workshopDamage'
import { defaultWorkshopPersisted } from './labPresetsStorage'
import { applyWorkshopDiscountToCoins } from './types/research'
import {
  applyWorkshopMaxAllVisible,
  computeWorkshopCoinAggregates,
  computeWorkshopStoneAggregates,
} from './workshopBudgetAggregates'
import { WORKSHOP_DAMAGE_MAX_LEVEL } from './data/workshopDamage'
import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateActiveKey,
  workshopUltimateNextMarginalStones,
  workshopUltimateOwnedKey,
} from './data/workshopUltimate'

function allUltimateOwnedFlags(active: boolean): Record<string, boolean> {
  return Object.fromEntries(
    WORKSHOP_ULTIMATE_WEAPON_ORDER.flatMap((id) => [
      [workshopUltimateOwnedKey(id), true],
      [workshopUltimateActiveKey(id), active],
    ]),
  )
}

describe('computeWorkshopCoinAggregates', () => {
  it('starts at zero spent with default snapshot', () => {
    const ws = defaultWorkshopPersisted()
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.spentAll).toBe(0)
    expect(a.toMaxAll).toBeGreaterThan(0)
  })

  it('counts damage workshop spend after one level', () => {
    const m0 = workshopDamageNextMarginalCoins(0)!
    const ws = { ...defaultWorkshopPersisted(), damageLevel: 1 }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.spentAll).toBe(m0)
  })

  it('applies Workshop Attack Discount to attack workshop spend', () => {
    const m0 = workshopDamageNextMarginalCoins(0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      damageLevel: 1,
    }
    const discounted = applyWorkshopDiscountToCoins(m0, 10)
    const a = computeWorkshopCoinAggregates(ws, { attackDiscountPercent: 10 })
    expect(a.spentAll).toBe(discounted)
    expect(discounted).toBeLessThan(m0)
  })

  it('applies Workshop Defense Discount to defense workshop spend', () => {
    const m0 = workshopDefenseNextMarginalCoins('healthLevel', 0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      healthLevel: 1,
    }
    const discounted = applyWorkshopDiscountToCoins(m0, 10)
    const a = computeWorkshopCoinAggregates(ws, { defenseDiscountPercent: 10 })
    expect(a.spentAll).toBe(discounted)
    expect(discounted).toBeLessThan(m0)
  })

  it('sums only unlocked attack enhancement next upgrades at level 0', () => {
    const damageNext = workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'attack' as const,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBe(damageNext)
  })

  it('sums zero enhancement next upgrades when Workshop Enhancements lab is locked', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'attack' as const,
    }
    const a = computeWorkshopCoinAggregates(ws, {
      workshopEnhancementsLabUnlocked: false,
    })
    expect(a.nextUpgradeVisibleSum).toBe(0)
  })

  it('includes more attack enhancement next upgrades after category spend unlocks', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'attack' as const,
      enhanceDamageLevel: 400,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBeGreaterThan(5e9)
  })

  it('sums only unlocked defense enhancement next upgrades at level 0', () => {
    const healthNext = workshopEnhanceDefenseNextMarginalCoins('enhanceHealthLevel', 0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'defense' as const,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBe(healthNext)
  })

  it('includes more defense enhancement next upgrades after category spend unlocks', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'defense' as const,
      enhanceHealthLevel: 400,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBeGreaterThan(5e9)
  })

  it('sums only unlocked utility enhancement next upgrades at level 0', () => {
    const cashNext = workshopEnhanceUtilityNextMarginalCoins('enhanceCashBonusLevel', 0)!
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'utility' as const,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBe(cashNext)
  })

  it('includes more utility enhancement next upgrades after category spend unlocks', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'utility' as const,
      enhanceCashBonusLevel: 400,
    }
    const a = computeWorkshopCoinAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBeGreaterThan(5e9)
  })

  it('uses zero visible next sum on Enhance tab for ultimate category', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance' as const,
      category: 'ultimate' as const,
    }
    expect(computeWorkshopCoinAggregates(ws).nextUpgradeVisibleSum).toBe(0)
  })

  it('excludes ultimate power stones from coin spent/to-max totals', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      goldenTowerBonusLevel: 1,
    }
    const coinsOnly = computeWorkshopCoinAggregates({
      ...ws,
      goldenTowerBonusLevel: 0,
    })
    const withUltimate = computeWorkshopCoinAggregates(ws)
    expect(withUltimate.spentAll).toBe(coinsOnly.spentAll)
  })
})

describe('computeWorkshopStoneAggregates', () => {
  it('sums visible ultimate next upgrades on Ultimate tab when weapons are active', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      mainTab: 'upgrade' as const,
      category: 'ultimate' as const,
      goldenTowerActive: true,
    }
    const a = computeWorkshopStoneAggregates(ws)
    expect(a.nextUpgradeVisibleSum).toBeGreaterThan(0)
  })

  it('counts golden tower bonus spend in stones', () => {
    const stones = workshopUltimateNextMarginalStones('goldenTowerBonusLevel', 0)!
    const ws = { ...defaultWorkshopPersisted(), goldenTowerBonusLevel: 1 }
    expect(computeWorkshopStoneAggregates(ws).spentAll).toBe(stones)
  })

  it('excludes inactive owned weapons from visible next-upgrade stone sum', () => {
    const base = {
      ...defaultWorkshopPersisted(),
      mainTab: 'upgrade' as const,
      category: 'ultimate' as const,
    }
    const inactiveOwned = computeWorkshopStoneAggregates({
      ...base,
      ...allUltimateOwnedFlags(false),
    }).nextUpgradeVisibleSum
    const activeOwned = computeWorkshopStoneAggregates({
      ...base,
      ...allUltimateOwnedFlags(true),
    }).nextUpgradeVisibleSum
    expect(inactiveOwned).toBeLessThan(activeOwned)
    expect(activeOwned).toBeGreaterThan(0)
  })
})

describe('applyWorkshopMaxAllVisible', () => {
  it('maxes attack upgrade rows in the attack category', () => {
    const ws = applyWorkshopMaxAllVisible({
      ...defaultWorkshopPersisted(),
      mainTab: 'upgrade',
      category: 'attack',
      damageLevel: 1,
    })
    expect(ws.damageLevel).toBe(WORKSHOP_DAMAGE_MAX_LEVEL)
  })

  it('maxes all enhance damage rows regardless of unlock gates', () => {
    const ws = applyWorkshopMaxAllVisible({
      ...defaultWorkshopPersisted(),
      mainTab: 'enhance',
      category: 'attack',
    })
    expect(ws.enhanceDamageLevel).toBe(400)
    expect(ws.enhanceRendArmorLevel).toBe(400)
  })
})
