import { describe, expect, it } from 'vitest'
import { gameThemeIdAtIndex } from './gameThemeIndex'
import {
  GAME_EVENT_SAVE_TIMELINE,
  TOWER_MILESTONE_SAVE_SLOT_COUNT,
  towerSaveIndexForEventTowerId,
} from './gameEventTimeline'

describe('gameEventTimeline', () => {
  it('places event towers after milestone slots in save order', () => {
    const virus = GAME_EVENT_SAVE_TIMELINE.find(
      (row) => row.towerId === 'tower-event-virus',
    )
    const interstellar = GAME_EVENT_SAVE_TIMELINE.find(
      (row) => row.towerId === 'tower-event-star',
    )
    expect(virus?.towerSaveIndex).toBe(51)
    expect(interstellar?.towerSaveIndex).toBe(46)
    expect(TOWER_MILESTONE_SAVE_SLOT_COUNT).toBe(21)
    expect(towerSaveIndexForEventTowerId('tower-event-plasma-ball')).toBe(21)
  })

  it('matches gameThemeIdAtIndex for sample save selections', () => {
    expect(gameThemeIdAtIndex('tower', 51)).toBe('tower-event-virus')
    expect(gameThemeIdAtIndex('background', 33)).toBe('bg-pi-disk')
    const pi = GAME_EVENT_SAVE_TIMELINE.find((row) => row.backgroundId === 'bg-pi-disk')
    expect(pi?.backgroundSaveIndex).toBe(33)
  })
})
