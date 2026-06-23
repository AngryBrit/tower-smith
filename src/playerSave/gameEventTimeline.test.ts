import { describe, expect, it } from 'vitest'
import { gameThemeIdAtIndex } from './gameThemeIndex'
import {
  GAME_EVENT_SAVE_TIMELINE,
  TOWER_MILESTONE_SAVE_SLOT_COUNT,
  towerSaveIndexForEventTowerId,
} from './gameEventTimeline'

describe('gameEventTimeline', () => {
  it('uses towerSaveSlotMap for early event tower save indices', () => {
    const star = GAME_EVENT_SAVE_TIMELINE.find(
      (row) => row.towerId === 'tower-event-star',
    )
    expect(star?.towerSaveIndex).toBe(1)
    expect(TOWER_MILESTONE_SAVE_SLOT_COUNT).toBe(21)
    expect(towerSaveIndexForEventTowerId('tower-event-plasma-ball')).toBe(3)
    expect(towerSaveIndexForEventTowerId('tower-event-pocket-watch')).toBe(51)
  })

  it('matches gameThemeIdAtIndex for sample save selections', () => {
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-pocket-watch')
    expect(gameThemeIdAtIndex('background', 0)).toBeUndefined()
    expect(gameThemeIdAtIndex('background', 33)).toBe('bg-clock-tower')
    const pi = GAME_EVENT_SAVE_TIMELINE.find((row) => row.backgroundId === 'bg-pi-disk')
    expect(pi?.backgroundSaveIndex).toBe(34)
    expect(gameThemeIdAtIndex('background', 50)).toBe('bg-guild-claw-machine')
    expect(gameThemeIdAtIndex('background', 51)).toBe('bg-neuron')
    expect(gameThemeIdAtIndex('background', 53)).toBe('bg-5th-anniversary')
    const meteor = GAME_EVENT_SAVE_TIMELINE.find(
      (row) => row.eventNameId === 'theme_event_meteor_shower',
    )
    expect(meteor?.towerId).toBe('tower-event-meteorite')
    expect(meteor?.backgroundId).toBe('bg-meteor-shower')
    expect(meteor?.towerSaveIndex).toBe(76)
    expect(meteor?.backgroundSaveIndex).toBe(54)
    expect(gameThemeIdAtIndex('background', 54)).toBe('bg-meteor-shower')
    expect(gameThemeIdAtIndex('tower', 76)).toBe('tower-event-meteorite')
    const anniversary = GAME_EVENT_SAVE_TIMELINE.find(
      (row) => row.eventNameId === 'theme_event_5th_anniversary',
    )
    expect(anniversary?.towerId).toBe('tower-event-cake')
    expect(anniversary?.backgroundId).toBe('bg-5th-anniversary')
    expect(anniversary?.towerSaveIndex).toBe(75)
    expect(anniversary?.backgroundSaveIndex).toBe(53)
  })
})
