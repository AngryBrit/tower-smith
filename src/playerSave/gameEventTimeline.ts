import { GAME_THEMES } from '../data/gameThemes'
import { BACKGROUND_EVENT_ROWS } from '../data/backgroundEventGuildSkins'
import { TOWER_EVENT_SKIN_ROWS } from '../data/towerEventGuildSkins'

/** Milestone tower skins occupy save indices `0 .. TOWER_MILESTONE_SAVE_SLOT_COUNT - 1`. */
export const TOWER_MILESTONE_SAVE_SLOT_COUNT = 21

const BACKGROUND_ID_BY_EVENT = new Map(
  BACKGROUND_EVENT_ROWS.map((row) => [row.eventNameId, row.id] as const),
)

/** `backgroundUnlocked` index per background id (game slot order in `BACKGROUND_EVENT_ROWS`). */
const BACKGROUND_SAVE_INDEX_BY_ID = new Map(
  BACKGROUND_EVENT_ROWS.map((row, index) => [row.id, index] as const),
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
      towerSaveIndex: TOWER_MILESTONE_SAVE_SLOT_COUNT + eventIndex,
      backgroundSaveIndex: backgroundId
        ? (BACKGROUND_SAVE_INDEX_BY_ID.get(backgroundId) ?? null)
        : null,
    }
  }),
)

export function towerSaveIndexForEventTowerId(towerId: string): number | undefined {
  return GAME_EVENT_SAVE_TIMELINE.find((row) => row.towerId === towerId)?.towerSaveIndex
}

export function backgroundSaveIndexForEventBackgroundId(
  backgroundId: string,
): number | undefined {
  const idx = BACKGROUND_SAVE_INDEX_BY_ID.get(backgroundId)
  return idx == null ? undefined : idx
}

/** Full `towerUnlocked` index list (milestones, events, guild) in save slot order. */
export function buildTowerThemeIdsByGameIndex(maxIndex = 79): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)

  for (const theme of GAME_THEMES) {
    if (theme.category !== 'tower' || theme.milestoneTier == null) continue
    out[theme.milestoneTier - 1] = theme.id
  }

  for (const row of GAME_EVENT_SAVE_TIMELINE) {
    out[row.towerSaveIndex] = row.towerId
  }

  const guildStart = TOWER_MILESTONE_SAVE_SLOT_COUNT + TOWER_EVENT_SKIN_ROWS.length
  const guildTowers = GAME_THEMES.filter(
    (t) => t.category === 'tower' && t.towerGroup === 'guild',
  ).sort((a, b) => (a.guildSeason ?? 0) - (b.guildSeason ?? 0))
  guildTowers.forEach((theme, offset) => {
    out[guildStart + offset] = theme.id
  })

  return out
}

/** Full `backgroundUnlocked` index list (events, guild) in save slot order. */
export function buildBackgroundThemeIdsByGameIndex(maxIndex = 51): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)

  for (const row of BACKGROUND_EVENT_ROWS) {
    const idx = BACKGROUND_SAVE_INDEX_BY_ID.get(row.id)
    if (idx != null) out[idx] = row.id
  }

  const guildStart = BACKGROUND_EVENT_ROWS.length
  const guildBackgrounds = GAME_THEMES.filter(
    (t) => t.category === 'background' && t.backgroundGroup === 'guild',
  ).sort((a, b) => (a.guildSeason ?? 0) - (b.guildSeason ?? 0))
  guildBackgrounds.forEach((theme, offset) => {
    out[guildStart + offset] = theme.id
  })

  return out
}
