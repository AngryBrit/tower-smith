import { describe, expect, it } from 'vitest'
import {
  MUSIC_SAVE_INDEX_BY_THEME_ID,
  MUSIC_TRACK_SLOT_COUNT,
  buildMusicThemeIdsByGameIndex,
  musicSaveIndexForThemeId,
} from './musicSaveSlotMap'
import { gameThemeIdAtIndex } from './gameThemeIndex'

describe('musicSaveSlotMap', () => {
  it('maps Krisu theme ids to trackAvailable indices 4, 5, 8', () => {
    expect(MUSIC_SAVE_INDEX_BY_THEME_ID['music-krisu-oceans-sings']).toBe(4)
    expect(MUSIC_SAVE_INDEX_BY_THEME_ID['music-krisu-hiding-himalaya']).toBe(5)
    expect(MUSIC_SAVE_INDEX_BY_THEME_ID['music-krisu-forest-bathing']).toBe(8)
  })

  it('builds a sparse 12-slot game index list', () => {
    const ids = buildMusicThemeIdsByGameIndex()
    expect(ids).toHaveLength(MUSIC_TRACK_SLOT_COUNT)
    expect(ids[4]).toBe('music-krisu-oceans-sings')
    expect(ids[5]).toBe('music-krisu-hiding-himalaya')
    expect(ids[8]).toBe('music-krisu-forest-bathing')
    expect(ids[9]).toBeUndefined()
  })

  it('round-trips theme id ↔ save index', () => {
    expect(musicSaveIndexForThemeId('music-krisu-forest-bathing')).toBe(8)
    expect(gameThemeIdAtIndex('music', 4)).toBe('music-krisu-oceans-sings')
    expect(gameThemeIdAtIndex('music', 6)).toBeUndefined()
  })
})
