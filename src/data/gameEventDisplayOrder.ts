import type { StringId } from '../i18n/dictionary'
import type { GameThemeEntry } from './gameThemes'

/**
 * Event tower/background display order (effect-paths spreadsheet UI order).
 * Save slot order is separate — see `gameEventTimeline.ts`.
 */
export const EVENT_THEME_DISPLAY_ORDER: readonly StringId[] = [
  'theme_event_interstellar',
  'theme_event_volcano',
  'theme_event_plasma_returns',
  'theme_event_honey',
  'theme_event_aurora',
  'theme_event_aliens',
  'theme_event_ocean_night',
  'theme_event_cherry_blossom',
  'theme_event_easter',
  'theme_event_retrowave',
  'theme_event_prismatic_lines',
  'theme_event_cobweb',
  'theme_event_matrix',
  'theme_event_viral_outbreak',
  'theme_event_full_moon',
  'theme_event_sands_of_time',
  'theme_event_autumn',
  'theme_event_halloween',
  'theme_event_retro_arcade',
  'theme_event_new_year',
  'theme_event_dark_strands',
  'theme_event_deep_blue_sea',
  'theme_event_faster_than_light',
  'theme_event_invaders',
  'theme_event_sunset_fishing',
  'theme_event_into_the_storm',
  'theme_event_rainfall',
  'theme_event_towers_channel',
  'theme_event_abduction',
  'theme_event_snowstorm',
  'theme_event_meowy_night',
  'theme_event_gravity',
  'theme_event_what_time_is_it',
  'theme_event_pi',
  'theme_event_koi_pond',
  'theme_event_camping',
  'theme_event_cthulhu',
  'theme_event_cyberpunk',
  'theme_event_crystal_cave',
  'theme_event_amusement_park',
  'theme_event_valentine',
  'theme_event_glitch',
  'theme_event_neuron',
  'theme_event_5th_anniversary',
] as const

const EVENT_DISPLAY_RANK = new Map<StringId, number>(
  EVENT_THEME_DISPLAY_ORDER.map((id, index) => [id, index]),
)

export function eventThemeDisplayRank(eventNameId: StringId | undefined): number {
  if (eventNameId == null) return Number.MAX_SAFE_INTEGER
  return EVENT_DISPLAY_RANK.get(eventNameId) ?? Number.MAX_SAFE_INTEGER
}

export function sortEventThemesForDisplay(themes: readonly GameThemeEntry[]): GameThemeEntry[] {
  return [...themes].sort(
    (a, b) => eventThemeDisplayRank(a.eventNameId) - eventThemeDisplayRank(b.eventNameId),
  )
}
