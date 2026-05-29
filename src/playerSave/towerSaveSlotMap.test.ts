import { describe, expect, it } from 'vitest'
import { gameThemeIdAtIndex } from './gameThemeIndex'
import { TOWER_SAVE_INDEX_BY_THEME_ID } from './towerSaveSlotMap'

describe('towerSaveSlotMap', () => {
  it('maps default and interstellar-era event towers at indices 0–8', () => {
    expect(gameThemeIdAtIndex('tower', 0)).toBeUndefined()
    expect(gameThemeIdAtIndex('tower', 1)).toBe('tower-event-star')
    expect(gameThemeIdAtIndex('tower', 2)).toBe('tower-event-eye-of-the-lord')
    expect(gameThemeIdAtIndex('tower', 3)).toBe('tower-event-plasma-ball')
    expect(gameThemeIdAtIndex('tower', 4)).toBe('tower-event-bee')
    expect(gameThemeIdAtIndex('tower', 8)).toBe('tower-event-cherry-blossom')
  })

  it('maps milestone tiers 1–10 at indices 9–18', () => {
    expect(gameThemeIdAtIndex('tower', 9)).toBe('tower-shuriken')
    expect(gameThemeIdAtIndex('tower', 18)).toBe('tower-cheese')
  })

  it('maps milestone tiers 11–21 at indices 19–29', () => {
    expect(gameThemeIdAtIndex('tower', 19)).toBe('tower-cat')
    expect(gameThemeIdAtIndex('tower', 29)).toBe('tower-eclipse')
  })

  it('maps pocket watch event tower at index 51 (selectedTower in sample save)', () => {
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-pocket-watch')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-pocket-watch']).toBe(51)
  })
})
