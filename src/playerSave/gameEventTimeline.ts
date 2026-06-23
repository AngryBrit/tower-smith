import { GAME_THEMES } from '../data/gameThemes'
import { BACKGROUND_EVENT_ROWS } from '../data/backgroundEventGuildSkins'
import { TOWER_EVENT_SKIN_ROWS } from '../data/towerEventGuildSkins'
import {
  BACKGROUND_SAVE_INDEX_BY_THEME_ID,
  BACKGROUND_SAVE_MAX_INDEX,
} from './backgroundSaveSlotMap'
import {
  TOWER_SAVE_INDEX_BY_THEME_ID,
  TOWER_SAVE_MAX_MAPPED_INDEX,
  towerSaveIndexForThemeId,
} from './towerSaveSlotMap'

/**
 * @deprecated Save uses index 0 for default only; milestones start at index 9.
 * Kept for callers that still reference the old contiguous milestone block.
 */
export const TOWER_MILESTONE_SAVE_SLOT_COUNT = 21

const BACKGROUND_ID_BY_EVENT = new Map(
  BACKGROUND_EVENT_ROWS.map((row) => [row.eventNameId, row.id] as const),
)

/** `backgroundUnlocked` index 0 is default; event rows use save slots 1..N. */
export const BACKGROUND_EVENT_SAVE_INDEX_OFFSET = 1

/** Haunted House save slot (between Matrix and Virus Field). */
export const BACKGROUND_HAUNTED_HOUSE_SAVE_INDEX = 14

/** Unused save slot between Pi Disk (34) and Mech World (36). */
export const BACKGROUND_SAVE_GAP_AFTER_PI_SLOT = 35

/** Koi Pond save slot (interleaved with guild/event order after Clock Tower). */
export const BACKGROUND_KOI_POND_SAVE_INDEX =
  BACKGROUND_SAVE_INDEX_BY_THEME_ID['bg-koi-pond']!

/** Last catalog background in save slot order (Meteor Shower @ 54). */
export const BACKGROUND_LAST_EVENT_SAVE_INDEX = BACKGROUND_SAVE_MAX_INDEX

export function backgroundSaveIndexForThemeId(id: string): number | undefined {
  return BACKGROUND_SAVE_INDEX_BY_THEME_ID[id]
}

/** `backgroundUnlocked` index per event background id. */
const BACKGROUND_SAVE_INDEX_BY_ID = new Map(
  BACKGROUND_EVENT_ROWS.flatMap((row) => {
    const idx = backgroundSaveIndexForThemeId(row.id)
    return idx == null ? [] : ([[row.id, idx]] as const)
  }),
)

export type GameEventSaveRow = {
  eventNameId: string
  towerId: string
  backgroundId: string | null
  towerSaveIndex: number
  backgroundSaveIndex: number | null
}

/**
 * Live-event skins in **game save slot** order (`TOWER_EVENT_SKIN_ROWS` row order).
 * UI display order is `EVENT_THEME_DISPLAY_ORDER` in `gameEventDisplayOrder.ts`.
 */
export const GAME_EVENT_SAVE_TIMELINE: readonly GameEventSaveRow[] = Object.freeze(
  TOWER_EVENT_SKIN_ROWS.map((tower, eventIndex) => {
    const backgroundId = BACKGROUND_ID_BY_EVENT.get(tower.eventNameId) ?? null
    return {
      eventNameId: tower.eventNameId,
      towerId: tower.id,
      backgroundId,
      towerSaveIndex:
        towerSaveIndexForThemeId(tower.id) ??
        TOWER_MILESTONE_SAVE_SLOT_COUNT + eventIndex,
      backgroundSaveIndex: backgroundId
        ? (BACKGROUND_SAVE_INDEX_BY_ID.get(backgroundId) ?? null)
        : null,
    }
  }),
)

export function towerSaveIndexForEventTowerId(towerId: string): number | undefined {
  return (
    towerSaveIndexForThemeId(towerId) ??
    GAME_EVENT_SAVE_TIMELINE.find((row) => row.towerId === towerId)?.towerSaveIndex
  )
}

export function backgroundSaveIndexForEventBackgroundId(
  backgroundId: string,
): number | undefined {
  return BACKGROUND_SAVE_INDEX_BY_ID.get(backgroundId)
}

/**
 * `backgroundUnlocked` save index for guild season background (2–8).
 * Season 1 (Throne) has no save slot; season 9 (Magician) is index 52.
 */
export function backgroundGuildSaveIndexForSeason(season: number): number | undefined {
  const theme = GAME_THEMES.find(
    (t) =>
      t.category === 'background' &&
      t.backgroundGroup === 'guild' &&
      t.guildSeason === season,
  )
  if (!theme) return undefined
  return backgroundSaveIndexForThemeId(theme.id)
}

/** Full `towerUnlocked` index list in save slot order (sparse until all slots are mapped). */
export function buildTowerThemeIdsByGameIndex(
  maxIndex = Math.max(79, TOWER_SAVE_MAX_MAPPED_INDEX),
): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)

  for (const [id, idx] of Object.entries(TOWER_SAVE_INDEX_BY_THEME_ID)) {
    out[idx] = id
  }

  return out
}

/** Full `backgroundUnlocked` index list in save slot order. */
export function buildBackgroundThemeIdsByGameIndex(
  maxIndex = BACKGROUND_SAVE_MAX_INDEX,
): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)

  for (const [id, idx] of Object.entries(BACKGROUND_SAVE_INDEX_BY_THEME_ID)) {
    out[idx] = id
  }

  return out
}
