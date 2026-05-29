/**
 * `towerUnlocked` save index per theme id (from playerInfo.dat field order).
 * Index 0 is the default tower (not a catalog skin). Milestone tiers 1–10 sit at 9–18
 * after the first eight interstellar-era event towers. Guild/event slots after tier 21
 * are interleaved by release date — only mapped ids are listed here.
 */
export const TOWER_SAVE_INDEX_BY_THEME_ID: Readonly<Record<string, number>> = {
  'tower-event-star': 1,
  'tower-event-eye-of-the-lord': 2,
  'tower-event-plasma-ball': 3,
  'tower-event-bee': 4,
  'tower-event-north-spirit': 5,
  'tower-event-alien': 6,
  'tower-event-water-droplet': 7,
  'tower-event-cherry-blossom': 8,
  'tower-shuriken': 9,
  'tower-donut': 10,
  'tower-yin-yang': 11,
  'tower-smile': 12,
  'tower-butterfly': 13,
  'tower-sheep': 14,
  'tower-fried-egg': 15,
  'tower-mush-mush': 16,
  'tower-turtle': 17,
  'tower-cheese': 18,
  'tower-cat': 19,
  'tower-skull': 20,
  'tower-creepy-clown': 21,
  'tower-panda': 22,
  'tower-tech-tree': 23,
  'tower-cactus': 24,
  'tower-dragon': 25,
  'tower-rhino': 26,
  'tower-atomic': 27,
  'tower-cyber': 28,
  'tower-eclipse': 29,
  'tower-event-pocket-watch': 51,
}

/** Highest `towerUnlocked` index mapped to a catalog tower skin. */
export const TOWER_SAVE_MAX_MAPPED_INDEX = Math.max(
  ...Object.values(TOWER_SAVE_INDEX_BY_THEME_ID),
)

export function towerSaveIndexForThemeId(id: string): number | undefined {
  return TOWER_SAVE_INDEX_BY_THEME_ID[id]
}
