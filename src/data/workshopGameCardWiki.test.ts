import { describe, expect, it } from 'vitest'
import {
  formatWorkshopGameCardStarEffect,
  formatWorkshopGameCardStarEffectForDetail,
  WORKSHOP_GAME_CARD_WIKI,
  workshopBerserkerCardRateFromStars,
  workshopEnemyBalanceSpawnStarValue,
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
    expect(formatWorkshopGameCardStarEffectForDetail('criticalChance', 7)).toBe('11%')
    expect(formatWorkshopGameCardStarEffectForDetail('berserker', 1)).toBe('+0.8%')
  })

  it('uses in-game Fortress summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('fortress', 7)).toBe(
      'Increases Defense Absolute by ×2.20',
    )
  })

  it('uses in-game Extra Defense summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('extraDefense', 7)).toBe(
      'Increases Defense Percent by 11%',
    )
  })

  it('uses in-game Enemy Balance summary copy in card detail', () => {
    expect(workshopEnemyBalanceSpawnStarValue(7)).toBe(1.8)
    expect(workshopGameCardDescriptionLineForDetail('enemyBalance', 7)).toBe(
      'Increases Enemy Spawns by ×1.8 & Cash on Kill increased by ×1.90',
    )
  })

  it('uses in-game Critical Chance summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('criticalChance', 7)).toBe(
      'Increases critical chance by 11%',
    )
  })

  it('uses in-game Slow Aura summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('slowAura', 7)).toBe(
      'Reduces Enemy Speed in Range by 31%',
    )
  })

  it('uses in-game Attack Speed summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('attackSpeed', 7)).toBe(
      'Increases Attack Speed by ×2.15',
    )
  })

  it('uses in-game Damage summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('damage', 7)).toBe(
      'Increases Tower Damage by ×4.00',
    )
  })

  it('uses in-game Health summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('health', 7)).toBe(
      'Increases Tower Health by ×4.00',
    )
  })

  it('uses in-game Coins summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('coins', 7)).toBe(
      'Increase all Coins earned by ×1.45',
    )
  })

  it('uses in-game Cash summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('cash', 7)).toBe(
      'Increase all Cash earned by ×2.40',
    )
  })

  it('uses in-game Range summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('range', 7)).toBe(
      'Increases Tower Range by ×1.45',
    )
  })

  it('uses in-game Health Regen summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('healthRegen', 7)).toBe(
      'Increases Health Regen by ×2.60 / sec',
    )
  })

  it('returns null for zero stars', () => {
    expect(workshopGameCardStarValue('nuke', 0)).toBeNull()
    expect(formatWorkshopGameCardStarEffect('nuke', 0)).toBe('')
  })
})
