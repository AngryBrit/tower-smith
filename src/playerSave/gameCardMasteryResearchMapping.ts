/**
 * Card Mastery lab ↔ game `researchLevel[id]`.
 * Workshop card order (land mine stun → nuke); wave accelerator has no save slot.
 */
export const CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Land Mine Stun Mastery': 178,
  'Recovery Package Chance Mastery': 179,
  'Death Ray Mastery': 180,
  'Energy Net Mastery': 181,
  'Super Tower Mastery': 182,
  'Second Wind Mastery': 183,
  'Demon Mode Mastery': 184,
  'Energy Shield Mastery': 185,
  'Berserker Mastery': 186,
  'Ultimate Crit Mastery': 187,
  'Nuke Mastery': 188,
} as const satisfies Record<string, number>

export type CardMasteryResearchLabName =
  keyof typeof CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME
