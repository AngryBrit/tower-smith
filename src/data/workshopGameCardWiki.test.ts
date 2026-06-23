import { describe, expect, it } from 'vitest'
import {
  formatWorkshopGameCardStarEffect,
  WORKSHOP_GAME_CARD_WIKI,
  workshopBerserkerCardRateFromStars,
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

  it('returns null for zero stars', () => {
    expect(workshopGameCardStarValue('nuke', 0)).toBeNull()
    expect(formatWorkshopGameCardStarEffect('nuke', 0)).toBe('')
  })
})
