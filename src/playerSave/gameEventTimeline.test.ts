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
  })
})
