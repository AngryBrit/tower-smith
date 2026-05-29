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

  it('maps milestone tiers 11–12 at 19–20 and skips reserved slots 21–22', () => {
    expect(gameThemeIdAtIndex('tower', 19)).toBe('tower-cat')
    expect(gameThemeIdAtIndex('tower', 20)).toBe('tower-skull')
    expect(gameThemeIdAtIndex('tower', 21)).toBeUndefined()
    expect(gameThemeIdAtIndex('tower', 22)).toBeUndefined()
  })

  it('does not place Feb 2024 milestone tiers 13–15 in save map yet', () => {
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-creepy-clown']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-panda']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-tech-tree']).toBeUndefined()
  })

  it('does not place Jul 2024 milestone tiers 16–18 in save map yet', () => {
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-cactus']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-dragon']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-rhino']).toBeUndefined()
  })

  it('does not place Aug 2025 milestone tiers 19–21 in save map yet', () => {
    expect(gameThemeIdAtIndex('tower', 23)).toBeUndefined()
    expect(gameThemeIdAtIndex('tower', 27)).toBeUndefined()
    expect(gameThemeIdAtIndex('tower', 29)).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-atomic']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-cyber']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-eclipse']).toBeUndefined()
  })

  it('maps pocket watch event tower at index 51 (selectedTower in sample save)', () => {
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-pocket-watch')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-pocket-watch']).toBe(51)
  })

  it('maps guild/event block at indices 63–73 (sample save)', () => {
    expect(gameThemeIdAtIndex('tower', 63)).toBe('tower-guild-pixel-soldier')
    expect(gameThemeIdAtIndex('tower', 64)).toBe('tower-event-flying-car')
    expect(gameThemeIdAtIndex('tower', 65)).toBe('tower-event-crystal')
    expect(gameThemeIdAtIndex('tower', 66)).toBe('tower-event-balloon')
    expect(gameThemeIdAtIndex('tower', 67)).toBe('tower-guild-restless-eye')
    expect(gameThemeIdAtIndex('tower', 68)).toBe('tower-guild-shining-star')
    expect(gameThemeIdAtIndex('tower', 69)).toBe('tower-event-heart')
    expect(gameThemeIdAtIndex('tower', 70)).toBe('tower-event-glitch')
    expect(gameThemeIdAtIndex('tower', 71)).toBe('tower-guild-space-telescope')
    expect(gameThemeIdAtIndex('tower', 72)).toBe('tower-guild-bear')
    expect(gameThemeIdAtIndex('tower', 73)).toBe('tower-event-brain')
  })

  it('maps rabbit in hat guild tower at index 74 (selectedTower when equipped)', () => {
    expect(gameThemeIdAtIndex('tower', 74)).toBe('tower-guild-rabbit-in-hat')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-guild-rabbit-in-hat']).toBe(74)
  })
})
