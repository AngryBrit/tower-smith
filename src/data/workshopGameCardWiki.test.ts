import { describe, expect, it } from 'vitest'
import {
  formatWorkshopGameCardStarEffect,
  formatWorkshopGameCardStarEffectForDetail,
  WORKSHOP_GAME_CARD_WIKI,
  workshopBerserkerCardRateFromStars,
  workshopGameCardDescriptionLineForDetail,
  workshopGameCardStarValue,
} from './workshopGameCardWiki'

describe('workshopGameCardWiki', () => {
  it('has 31 cards with seven star values each', () => {
    expect(Object.keys(WORKSHOP_GAME_CARD_WIKI)).toHaveLength(31)
    for (const def of Object.values(WORKSHOP_GAME_CARD_WIKI)) {
      expect(def.stars).toHaveLength(7)
    }
  })

  it('formats damage and berserker like wiki tables', () => {
    expect(formatWorkshopGameCardStarEffect('damage', 1)).toBe('×1.5')
    expect(formatWorkshopGameCardStarEffect('attackSpeed', 7)).toBe('×2.15')
    expect(formatWorkshopGameCardStarEffect('berserker', 1)).toBe('+0.8%')
    expect(workshopBerserkerCardRateFromStars(1)).toBe(0.008)
  })

  it('formats card detail values with two fixed decimals', () => {
    expect(formatWorkshopGameCardStarEffect('damage', 1, 2)).toBe('×1.50')
    expect(formatWorkshopGameCardStarEffect('damage', 2, 2)).toBe('×2.00')
    expect(formatWorkshopGameCardStarEffect('damage', 4, 2)).toBe('×2.80')
    expect(formatWorkshopGameCardStarEffect('berserker', 1, 2)).toBe('+0.80%')
  })

  it('omits decimals for cards whose wiki star table is all whole numbers', () => {
    expect(formatWorkshopGameCardStarEffect('slowAura', 7)).toBe('31%')
    expect(formatWorkshopGameCardStarEffect('slowAura', 1)).toBe('13%')
    expect(formatWorkshopGameCardStarEffect('criticalChance', 7)).toBe('+11%')
  })

  it('formats card detail: two decimals for mult, trimmed % for percent cards', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('health', 1)).toBe('×1.50')
    expect(formatWorkshopGameCardStarEffectForDetail('health', 7)).toBe('×4.00')
    expect(formatWorkshopGameCardStarEffectForDetail('slowAura', 7)).toBe('31%')
    expect(formatWorkshopGameCardStarEffectForDetail('criticalChance', 7)).toBe('+11%')
    expect(formatWorkshopGameCardStarEffectForDetail('berserker', 1)).toBe('+0.8%')
  })

  it('uses in-game Slow Aura summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('slowAura', 7)).toBe(
      'Reduce Enemy Speed in Range by 31%',
    )
  })

  it('returns null for zero stars', () => {
    expect(workshopGameCardStarValue('nuke', 0)).toBeNull()
    expect(formatWorkshopGameCardStarEffect('nuke', 0)).toBe('')
  })
})
