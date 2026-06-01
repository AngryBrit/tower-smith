import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { workshopEnhanceAttackNextMarginalCoins } from './workshopEnhanceAttack'
import {
  WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS,
} from './workshopEnhanceAttack'
import {
  workshopEnhanceAttackCategorySpentCoins,
  workshopEnhanceAttackDamageEnhanceSpentCoins,
  workshopEnhanceAttackIsUnlocked,
  workshopEnhanceAttackUnlockSpentCoins,
  workshopEnhanceDefenseCategorySpentCoins,
  workshopEnhanceDefenseIsUnlocked,
  workshopEnhanceDefenseUnlockRemainingCoins,
  workshopEnhanceUtilityCategorySpentCoins,
  workshopEnhanceUtilityIsUnlocked,
} from './workshopEnhanceUnlock'

describe('workshopEnhanceUnlock', () => {
  it('all attack enhancements need Workshop Enhancements lab research', () => {
    expect(workshopEnhanceAttackIsUnlocked('enhanceDamageLevel', 0, false)).toBe(false)
    expect(workshopEnhanceDefenseIsUnlocked('enhanceHealthLevel', 0, false)).toBe(false)
    expect(workshopEnhanceUtilityIsUnlocked('enhanceCashBonusLevel', 0, false)).toBe(false)
  })

  it('attack damage is always unlocked; rend needs 50B damage-enhancement spend', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopEnhanceAttackIsUnlocked('enhanceDamageLevel', 0)).toBe(true)
    expect(workshopEnhanceAttackIsUnlocked('enhanceRendArmorLevel', 0)).toBe(false)
    expect(
      workshopEnhanceAttackUnlockSpentCoins('enhanceRendArmorLevel', ws),
    ).toBe(0)

    const damageSpent = workshopEnhanceAttackDamageEnhanceSpentCoins({
      ...ws,
      enhanceDamageLevel: 400,
    })
    expect(damageSpent).toBeGreaterThanOrEqual(
      WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS,
    )
    expect(
      workshopEnhanceAttackIsUnlocked('enhanceRendArmorLevel', damageSpent),
    ).toBe(true)
  })

  it('later attack unlock gates add extra rend spend toward progress (40/40/40/40 profile)', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      enhanceDamageLevel: 40,
      enhanceRendArmorLevel: 40,
      enhanceCritFactorLevel: 40,
      enhanceDamagePerMeterLevel: 40,
      enhanceSuperCritMultLevel: 0,
      enhanceAttackSpeedLevel: 0,
    }
    const spent = workshopEnhanceAttackUnlockSpentCoins('enhanceAttackSpeedLevel', ws)
    const remaining = 500_000_000_000_000 - spent
    expect(spent).toBeGreaterThan(workshopEnhanceAttackCategorySpentCoins(ws))
    expect(remaining).toBeLessThan(500_000_000_000_000 - workshopEnhanceAttackCategorySpentCoins(ws))
    // In-game ~442.09T remaining at this profile (~57.91T spent).
    expect(remaining / 1e12).toBeCloseTo(442.09, 0)
  })

  it('crit factor uses cumulative attack enhancement spend', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopEnhanceAttackIsUnlocked('enhanceCritFactorLevel', 0)).toBe(false)

    const categorySpent = workshopEnhanceAttackCategorySpentCoins({
      ...ws,
      enhanceDamageLevel: 400,
    })
    expect(categorySpent).toBeGreaterThanOrEqual(
      WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
    )
    expect(workshopEnhanceAttackIsUnlocked('enhanceCritFactorLevel', categorySpent)).toBe(
      true,
    )
  })

  it('defense health is always unlocked; regen needs 50B category spend', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopEnhanceDefenseIsUnlocked('enhanceHealthLevel', 0)).toBe(true)
    expect(workshopEnhanceDefenseIsUnlocked('enhanceHealthRegenLevel', 0)).toBe(false)
    expect(workshopEnhanceDefenseUnlockRemainingCoins('enhanceHealthRegenLevel', 0)).toBe(50e9)

    const spent = workshopEnhanceDefenseCategorySpentCoins({
      ...ws,
      enhanceHealthLevel: 400,
    })
    expect(spent).toBeGreaterThanOrEqual(50e9)
    expect(workshopEnhanceDefenseIsUnlocked('enhanceHealthRegenLevel', spent)).toBe(true)
  })

  it('unlock progress uses wiki list prices (ignores enhancement coin discount)', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      enhanceDamageLevel: 10,
    }
    const spent = workshopEnhanceAttackCategorySpentCoins(ws)
    let expected = 0
    for (let L = 0; L < 10; L += 1) {
      expected += workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', L)!
    }
    expect(spent).toBe(expected)
  })

  it('utility cash bonus is always unlocked; coin bonus needs 50B category spend', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopEnhanceUtilityIsUnlocked('enhanceCashBonusLevel', 0)).toBe(true)
    expect(workshopEnhanceUtilityIsUnlocked('enhanceCoinBonusLevel', 0)).toBe(false)

    const spent = workshopEnhanceUtilityCategorySpentCoins({
      ...ws,
      enhanceCashBonusLevel: 400,
    })
    expect(spent).toBeGreaterThanOrEqual(50e9)
    expect(workshopEnhanceUtilityIsUnlocked('enhanceCoinBonusLevel', spent)).toBe(true)
  })
})
