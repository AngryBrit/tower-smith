import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev } from '../labCosts'
import { workshopToolkitMarginalCoins } from '../workshopCosts'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400Multiplier,
} from './workshopEnhanceTier400Ladder'
import { WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES } from './workshopEnhanceTier400WikiDecades'
import { WORKSHOP_ENHANCE_UTILITY_TIER_200_WIKI_DECADES } from './workshopEnhanceUtilityTier200WikiDecades'
import {
  WORKSHOP_ENHANCE_DEFENSE_ABSOLUTE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_HEALTH_REGEN_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_INCREMENT_PER_LEVEL,
  WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL,
  WORKSHOP_ENHANCE_ORB_SIZE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_WALL_HEALTH_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS,
  workshopEnhanceDefenseNextMarginalCoins,
  workshopEnhanceDefenseStatDisplay,
} from './workshopEnhanceDefense'

/** Wiki **Land Mine Damage** decade rows (+0.06×/level; same **Coins** as tier-400). */
const LAND_MINE_DAMAGE_WIKI_DECADES: readonly { level: number; value: number; coins: number }[] =
  WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES.map(({ level, coins }) => ({
    level,
    coins,
    value: Math.round((1 + WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_INCREMENT_PER_LEVEL * level) * 100) / 100,
  }))

describe('workshopEnhanceDefense', () => {
  it('tier-400 stats use +0.01× per level to ×5.00', () => {
    expect(workshopEnhanceDefenseStatDisplay('enhanceHealthLevel', 0)).toBe('x1.00')
    expect(workshopEnhanceDefenseStatDisplay('enhanceHealthLevel', 400)).toBe('x5.00')
    expect(workshopEnhanceDefenseStatDisplay('enhanceWallHealthLevel', 100)).toBe('x2.00')
  })

  it('health enhancement L50→51 matches in-game ~10.70T display', () => {
    const raw = workshopEnhanceDefenseNextMarginalCoins('enhanceHealthLevel', 50)!
    expect(raw).toBeGreaterThanOrEqual(10.695e12)
    expect(raw).toBeLessThan(10.705e12)
    expect(formatCoinAbbrev(raw)).toBe('10.70T')
  })

  it('health regen enhancement L60→61 matches in-game ~69.65T display', () => {
    const raw = workshopEnhanceDefenseNextMarginalCoins('enhanceHealthRegenLevel', 60)!
    expect(formatCoinAbbrev(raw)).toBe('69.65T')
  })

  it('defense absolute enhancement L10→11 matches in-game ~6.88B display', () => {
    const raw = workshopEnhanceDefenseNextMarginalCoins('enhanceDefenseAbsoluteLevel', 10)!
    expect(formatCoinAbbrev(raw)).toBe('6.88B')
  })

  it('defense absolute enhancement L11→12 matches in-game ~7.28B display', () => {
    const raw = workshopEnhanceDefenseNextMarginalCoins('enhanceDefenseAbsoluteLevel', 11)!
    expect(formatCoinAbbrev(raw)).toBe('7.28B')
  })

  it('defense absolute enhancement L27→28 matches GOD table display', () => {
    const raw = workshopEnhanceDefenseNextMarginalCoins('enhanceDefenseAbsoluteLevel', 27)!
    expect(formatCoinAbbrev(raw)).toBe('238.83B')
  })

  it('health enhancement matches wiki value and coin milestones (L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL).toBe(400)
    expect(workshopEnhanceTier400Multiplier(0, 'Health +')).toBe(1)
    expect(workshopEnhanceDefenseStatDisplay('enhanceHealthLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES) {
      expect(workshopEnhanceTier400Multiplier(level, 'Health +')).toBe(value)
      expect(workshopEnhanceDefenseStatDisplay('enhanceHealthLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceHealthLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Health +', level - 1),
      )
    }
    expect(workshopEnhanceDefenseNextMarginalCoins('enhanceHealthLevel', 400)).toBeUndefined()
  })

  it('health regen enhancement matches wiki tier-400 table (L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_HEALTH_REGEN_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS).toBe(50e9)
    expect(workshopEnhanceDefenseStatDisplay('enhanceHealthRegenLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES) {
      expect(workshopEnhanceDefenseStatDisplay('enhanceHealthRegenLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceHealthRegenLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Health Regen +', level - 1),
      )
    }
    expect(workshopEnhanceDefenseNextMarginalCoins('enhanceHealthRegenLevel', 400)).toBeUndefined()
  })

  it('defense absolute enhancement matches wiki tier-400 table (L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_DEFENSE_ABSOLUTE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS).toBe(500e9)
    expect(workshopEnhanceDefenseStatDisplay('enhanceDefenseAbsoluteLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES) {
      expect(workshopEnhanceDefenseStatDisplay('enhanceDefenseAbsoluteLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceDefenseAbsoluteLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Defense Absolute +', level - 1),
      )
    }
    expect(
      workshopEnhanceDefenseNextMarginalCoins('enhanceDefenseAbsoluteLevel', 400),
    ).toBeUndefined()
  })

  it('land mine damage enhancement matches wiki (+0.06×/level, L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS).toBe(5e12)
    expect(WORKSHOP_ENHANCE_LAND_MINE_DAMAGE_INCREMENT_PER_LEVEL).toBe(0.06)
    expect(workshopEnhanceDefenseStatDisplay('enhanceLandMineDamageLevel', 0)).toBe('x1.00')

    for (const { level, value } of LAND_MINE_DAMAGE_WIKI_DECADES) {
      expect(workshopEnhanceDefenseStatDisplay('enhanceLandMineDamageLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceLandMineDamageLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Land Mine Damage +', level - 1),
      )
    }
    expect(workshopEnhanceDefenseNextMarginalCoins('enhanceLandMineDamageLevel', 400)).toBeUndefined()
  })

  it('wall health enhancement matches wiki tier-400 table (L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_WALL_HEALTH_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS).toBe(50e12)
    expect(workshopEnhanceDefenseStatDisplay('enhanceWallHealthLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES) {
      expect(workshopEnhanceDefenseStatDisplay('enhanceWallHealthLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceWallHealthLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Wall Health +', level - 1),
      )
    }
    expect(workshopEnhanceDefenseNextMarginalCoins('enhanceWallHealthLevel', 400)).toBeUndefined()
  })

  it('orb size enhancement matches wiki (L1–L200, dedicated coin ladder)', () => {
    expect(WORKSHOP_ENHANCE_ORB_SIZE_UNLOCK_DEFENSE_ENHANCE_SPENT_COINS).toBe(500e12)
    expect(WORKSHOP_ENHANCE_ORB_SIZE_MAX_LEVEL).toBe(200)
    expect(workshopEnhanceDefenseStatDisplay('enhanceOrbSizeLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_UTILITY_TIER_200_WIKI_DECADES) {
      expect(workshopEnhanceDefenseStatDisplay('enhanceOrbSizeLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceDefenseNextMarginalCoins('enhanceOrbSizeLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Orb Size', level - 1),
      )
    }
    expect(workshopEnhanceDefenseNextMarginalCoins('enhanceOrbSizeLevel', 200)).toBeUndefined()
  })
})
