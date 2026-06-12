/**
 * `trackAvailable` save index per Krisu theme song id (playerInfo.dat field order).
 *
 * The 12-slot `trackAvailable` / `trackToggledOn` arrays interleave base OST tracks
 * (indices 0–3, 6–7 true on a new game) with the three purchasable Krisu themes
 * (indices 4, 5, 8). Slots 9–11 are unused in current saves.
 */
export const MUSIC_SAVE_INDEX_BY_THEME_ID: Readonly<Record<string, number>> = {
  'music-krisu-oceans-sings': 4,
  'music-krisu-hiding-himalaya': 5,
  'music-krisu-forest-bathing': 8,
}

/** Length of `trackAvailable` / `trackToggledOn` in PlayerData. */
export const MUSIC_TRACK_SLOT_COUNT = 12

export function buildMusicThemeIdsByGameIndex(): readonly (string | undefined)[] {
  const out: (string | undefined)[] = Array(MUSIC_TRACK_SLOT_COUNT).fill(undefined)
  for (const [id, index] of Object.entries(MUSIC_SAVE_INDEX_BY_THEME_ID)) {
    out[index] = id
  }
  return Object.freeze(out)
}

export function musicSaveIndexForThemeId(id: string): number | undefined {
  return MUSIC_SAVE_INDEX_BY_THEME_ID[id]
}
