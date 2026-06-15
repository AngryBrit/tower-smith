import { describe, expect, it } from 'vitest'
import { towerThemesByGroup } from './gameThemes'
import { EVENT_THEME_DISPLAY_ORDER, sortEventThemesForDisplay } from './gameEventDisplayOrder'

describe('gameEventDisplayOrder', () => {
  it('lists 44 events starting with Interstellar and ending with 5th Anniversary', () => {
    expect(EVENT_THEME_DISPLAY_ORDER).toHaveLength(44)
    expect(EVENT_THEME_DISPLAY_ORDER[0]).toBe('theme_event_interstellar')
    expect(EVENT_THEME_DISPLAY_ORDER.at(-1)).toBe('theme_event_5th_anniversary')
  })

  it('sorts tower event skins for the themes page', () => {
    const { event } = towerThemesByGroup()
    expect(event[0]?.eventNameId).toBe('theme_event_interstellar')
    expect(event.at(-1)?.eventNameId).toBe('theme_event_5th_anniversary')
    expect(event[2]?.id).toBe('tower-event-plasma-ball')
  })

  it('sortEventThemesForDisplay is stable for unknown events', () => {
    const sorted = sortEventThemesForDisplay([])
    expect(sorted).toEqual([])
  })
})
