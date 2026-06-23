import { describe, expect, it } from 'vitest'
import { backgroundThemesByGroup, GAME_THEMES, towerThemesByGroup } from './gameThemes'
import { EVENT_THEME_DISPLAY_ORDER, sortEventThemesForDisplay } from './gameEventDisplayOrder'

describe('gameEventDisplayOrder', () => {
  it('lists 45 events starting with Interstellar and ending with Meteor Shower', () => {
    expect(EVENT_THEME_DISPLAY_ORDER).toHaveLength(45)
    expect(EVENT_THEME_DISPLAY_ORDER[0]).toBe('theme_event_interstellar')
    expect(EVENT_THEME_DISPLAY_ORDER.at(-1)).toBe('theme_event_meteor_shower')
  })

  it('sorts tower event skins for the themes page', () => {
    const { event } = towerThemesByGroup()
    expect(event[0]?.eventNameId).toBe('theme_event_interstellar')
    expect(event.at(-1)?.eventNameId).toBe('theme_event_meteor_shower')
    expect(event[2]?.id).toBe('tower-event-plasma-ball')
  })

  it('sorts background event skins with Meteor Shower after 5th Anniversary', () => {
    const { event } = backgroundThemesByGroup()
    const idx5 = event.findIndex((e) => e.id === 'bg-5th-anniversary')
    const idxMeteor = event.findIndex((e) => e.id === 'bg-meteor-shower')
    expect(idx5).toBeGreaterThanOrEqual(0)
    expect(idxMeteor).toBe(idx5 + 1)
  })

  it('places save-tail backgrounds after guild Magician in catalog order', () => {
    const backgrounds = GAME_THEMES.filter((t) => t.category === 'background').map((t) => t.id)
    const magician = backgrounds.indexOf('bg-guild-magician')
    const fifth = backgrounds.indexOf('bg-5th-anniversary')
    const meteor = backgrounds.indexOf('bg-meteor-shower')
    expect(magician).toBeGreaterThanOrEqual(0)
    expect(fifth).toBe(magician + 1)
    expect(meteor).toBe(fifth + 1)
  })

  it('sortEventThemesForDisplay is stable for unknown events', () => {
    const sorted = sortEventThemesForDisplay([])
    expect(sorted).toEqual([])
  })
})
