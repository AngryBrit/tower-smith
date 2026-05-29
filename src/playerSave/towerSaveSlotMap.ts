/**
 * `towerUnlocked` save index per theme id (from playerInfo.dat field order).
 * Index 0 is the default tower (not a catalog skin). Milestone tiers 1–10 sit at 9–18
 * after the first eight interstellar-era event towers. Milestone tiers 11–12 are at 19–20.
 * Tiers 13–15 (Creepy Clown, Panda, Tech Tree) shipped Feb 2024 — not in slots 21–23.
 * Tiers 16–18 (Cactus, Dragon, Rhino) shipped 15 Jul 2024 — not in slots 23–26.
 * Tiers 19–21 (Atomic, Cyber, Eclipse) shipped Aug 2025 — not in slots 23–29.
 * Later event/guild towers are interleaved by release date — only mapped ids are listed.
 */

/** Unused in original layout before Feb 2024 milestone tiers 13–15. */
export const TOWER_SAVE_RESERVED_BEFORE_FEB_2024_MILESTONES = [21, 22] as const

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
  'tower-event-pocket-watch': 51,
  'tower-guild-pixel-soldier': 63,
  'tower-event-flying-car': 64,
  'tower-event-crystal': 65,
  'tower-event-balloon': 66,
  'tower-guild-restless-eye': 67,
  'tower-guild-shining-star': 68,
  'tower-event-heart': 69,
  'tower-event-glitch': 70,
  'tower-guild-space-telescope': 71,
  'tower-guild-bear': 72,
  'tower-event-brain': 73,
  'tower-guild-rabbit-in-hat': 74, // Guild S9 / Magician — selectedTower when equipped
}

/** Highest `towerUnlocked` index mapped to a catalog tower skin. */
export const TOWER_SAVE_MAX_MAPPED_INDEX = Math.max(
  ...Object.values(TOWER_SAVE_INDEX_BY_THEME_ID),
)

export function towerSaveIndexForThemeId(id: string): number | undefined {
  return TOWER_SAVE_INDEX_BY_THEME_ID[id]
}
