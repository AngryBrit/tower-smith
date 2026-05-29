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
    expect(gameThemeIdAtIndex('tower', 29)).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-atomic']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-cyber']).toBeUndefined()
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-eclipse']).toBeUndefined()
  })

  it('maps neo turbo event tower at index 23 (selectedTower when equipped)', () => {
    expect(gameThemeIdAtIndex('tower', 23)).toBe('tower-event-neo-turbo')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-neo-turbo']).toBe(23)
  })

  it('maps spider event tower at index 27', () => {
    expect(gameThemeIdAtIndex('tower', 27)).toBe('tower-event-spider')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-spider']).toBe(27)
  })

  it('maps sentinel event tower at index 28', () => {
    expect(gameThemeIdAtIndex('tower', 28)).toBe('tower-event-sentinel')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-sentinel']).toBe(28)
  })

  it('maps virus event tower at index 30', () => {
    expect(gameThemeIdAtIndex('tower', 30)).toBe('tower-event-virus')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-virus']).toBe(30)
  })

  it('maps event towers at indices 33–35 and 36–39', () => {
    expect(gameThemeIdAtIndex('tower', 33)).toBe('tower-event-autumn-leaf')
    expect(gameThemeIdAtIndex('tower', 34)).toBe('tower-event-invader')
    expect(gameThemeIdAtIndex('tower', 35)).toBe('tower-event-toast-glass')
    expect(gameThemeIdAtIndex('tower', 36)).toBe('tower-event-dark-tower')
    expect(gameThemeIdAtIndex('tower', 37)).toBe('tower-event-dive-helmet')
    expect(gameThemeIdAtIndex('tower', 38)).toBe('tower-event-starship')
    expect(gameThemeIdAtIndex('tower', 39)).toBe('tower-event-elite-tower')
  })

  it('maps event towers at indices 40–43', () => {
    expect(gameThemeIdAtIndex('tower', 40)).toBe('tower-event-fisherman')
    expect(gameThemeIdAtIndex('tower', 41)).toBe('tower-event-storm-eye')
    expect(gameThemeIdAtIndex('tower', 42)).toBe('tower-event-umbrella')
    expect(gameThemeIdAtIndex('tower', 43)).toBe('tower-event-noise-tower')
  })

  it('maps snowman event tower at index 48 (selectedTower when equipped)', () => {
    expect(gameThemeIdAtIndex('tower', 48)).toBe('tower-event-snowman')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-snowman']).toBe(48)
  })

  it('maps event/guild towers at indices 48–53', () => {
    expect(gameThemeIdAtIndex('tower', 48)).toBe('tower-event-snowman')
    expect(gameThemeIdAtIndex('tower', 49)).toBe('tower-event-black-cat')
    expect(gameThemeIdAtIndex('tower', 50)).toBe('tower-event-black-hole')
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-pocket-watch')
    expect(gameThemeIdAtIndex('tower', 52)).toBe('tower-guild-crown')
    expect(gameThemeIdAtIndex('tower', 53)).toBe('tower-event-neon-pi')
  })

  it('maps pocket watch event tower at index 51', () => {
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-pocket-watch')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-pocket-watch']).toBe(51)
  })

  it('maps mech warrior guild tower at index 54 (selectedTower when equipped)', () => {
    expect(gameThemeIdAtIndex('tower', 54)).toBe('tower-guild-mech-warrior')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-guild-mech-warrior']).toBe(54)
  })

  it('maps marshmallow event tower at index 55 (selectedTower when equipped)', () => {
    expect(gameThemeIdAtIndex('tower', 55)).toBe('tower-event-marshmallow')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-marshmallow']).toBe(55)
  })

  it('maps cthulhu event tower at index 56', () => {
    expect(gameThemeIdAtIndex('tower', 56)).toBe('tower-event-cthulhu')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-cthulhu']).toBe(56)
  })

  it('maps frog event tower at index 57', () => {
    expect(gameThemeIdAtIndex('tower', 57)).toBe('tower-event-frog')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-event-frog']).toBe(57)
  })

  it('maps dj guild tower at index 58', () => {
    expect(gameThemeIdAtIndex('tower', 58)).toBe('tower-guild-dj')
    expect(TOWER_SAVE_INDEX_BY_THEME_ID['tower-guild-dj']).toBe(58)
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
